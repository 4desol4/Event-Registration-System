import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { authenticate, requireRole } from "../middleware/auth";
import { writeAuditLog } from "../lib/audit";
import {
  createFormSchema,
  createFieldSchema,
  updateFieldSchema,
  duplicateFormSchema,
} from "../utils/validators";
import { generateShortSlug } from "../utils/slug";
import { generateQrDataUrl } from "../utils/qrcode";
import { buildWifiQrString } from "../utils/wifiQr";
import { addFormSheets } from "../utils/excelExport";
import ExcelJS from "exceljs";

export const formsRouter = Router();

// GET /forms/slug/:slug — PUBLIC endpoint the attendee form renderer calls.
// Registered BEFORE the authenticate() gate below so it stays unauthenticated.
formsRouter.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const form = await prisma.form.findUnique({
      where: { shortSlug: req.params.slug },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    if (!form) throw new ApiError(404, "Form not found");
    if (form.status === "closed") {
      throw new ApiError(410, "Registration for this event has closed.");
    }
    if (form.status !== "published") {
      throw new ApiError(403, "This form is not yet open for submissions.");
    }
    // Never leak internal metadata (clonedFromId, isTemplate flags) to the public form
    const { id, title, description, bannerImageUrl, fields } = form;
    res.json({ id, title, description, bannerImageUrl, fields });
  }),
);

// NOTE: authenticate is applied per-route below, NOT as a router-wide
// `.use(authenticate)`. This router is mounted at "/forms", and a blanket
// middleware here would also run for "/forms/:formId/submissions" — a path
// that belongs to a different router (mounted separately) and must stay
// public for attendees. Applying auth per-route avoids that collision.

// POST /forms — create a new blank form (ADMIN+; STAFF cannot create/edit form structure)
formsRouter.post(
  "/",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const data = createFormSchema.parse(req.body);
    const form = await prisma.form.create({ data });
    await writeAuditLog({
      userId: req.user!.id,
      action: "form.create",
      targetType: "Form",
      targetId: form.id,
    });
    res.status(201).json(form);
  }),
);

// GET /forms/templates — list the Template Library (any authenticated role can view)
formsRouter.get(
  "/templates",
  authenticate,
  asyncHandler(async (_req, res) => {
    const templates = await prisma.form.findMany({
      where: { isTemplate: true },
      include: { fields: { orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
    res.json(templates);
  }),
);

// GET /forms/:id — full form detail (admin use — includes submission count)
formsRouter.get(
  "/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const form = await prisma.form.findUnique({
      where: { id: req.params.id },
      include: {
        fields: { orderBy: { order: "asc" } },
        _count: { select: { submissions: true } },
      },
    });
    if (!form) throw new ApiError(404, "Form not found");
    res.json(form);
  }),
);

// PATCH /forms/:id — update title/description/banner (structural field edits go through /fields)
formsRouter.patch(
  "/:id",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const allowed = [
      "title",
      "description",
      "bannerImageUrl",
      "wifiEnabled",
      "wifiSsid",
      "wifiPassword",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key];
    }
    const form = await prisma.form.update({
      where: { id: req.params.id },
      data,
    });
    await writeAuditLog({
      userId: req.user!.id,
      action: "form.update",
      targetType: "Form",
      targetId: form.id,
      details: data,
    });
    res.json(form);
  }),
);

// POST /forms/:id/publish — generate short slug + QR, flip status to published
formsRouter.post(
  "/:id/publish",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const form = await prisma.form.findUnique({ where: { id: req.params.id } });
    if (!form) throw new ApiError(404, "Form not found");

    let shortSlug = form.shortSlug;
    if (!shortSlug) {
      // Retry on the rare collision — 7-char nanoid space is large, but be safe.
      for (let attempts = 0; attempts < 5; attempts++) {
        const candidate = generateShortSlug();
        const clash = await prisma.form.findUnique({
          where: { shortSlug: candidate },
        });
        if (!clash) {
          shortSlug = candidate;
          break;
        }
      }
      if (!shortSlug)
        throw new ApiError(
          500,
          "Could not generate a unique short link. Try again.",
        );
    }

    const updated = await prisma.form.update({
      where: { id: form.id },
      data: { status: "published", shortSlug },
    });

    const frontendUrl =
      process.env.ATTENDEE_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.BASE_URL || "http://localhost:4000");

    const baseUrl =
      frontendUrl || process.env.BASE_URL || "http://localhost:4000";
    const fullUrl = `${baseUrl.replace(/\/$/, "")}/r/${shortSlug}`;
    const qrDataUrl = await generateQrDataUrl(fullUrl);

    // Wi-Fi QR — entirely separate from the form-link QR above. Only
    // generated if an admin has actually turned it on and set a network
    // name from the Form Builder page; otherwise these come back null and
    // the frontend just doesn't render that card.
    const wifiQrDataUrl =
      form.wifiEnabled && form.wifiSsid
        ? await generateQrDataUrl(
            buildWifiQrString(form.wifiSsid, form.wifiPassword),
          )
        : null;

    await writeAuditLog({
      userId: req.user!.id,
      action: "form.publish",
      targetType: "Form",
      targetId: form.id,
    });

    res.json({
      form: updated,
      shortLink: fullUrl,
      qrDataUrl,
      wifiEnabled: form.wifiEnabled,
      wifiSsid: form.wifiSsid,
      wifiPassword: form.wifiPassword,
      wifiQrDataUrl,
    });
  }),
);

// POST /forms/:id/close — stop accepting new submissions
formsRouter.post(
  "/:id/close",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const form = await prisma.form.update({
      where: { id: req.params.id },
      data: { status: "closed" },
    });
    await writeAuditLog({
      userId: req.user!.id,
      action: "form.close",
      targetType: "Form",
      targetId: form.id,
    });
    res.json(form);
  }),
);

// POST /forms/:id/duplicate — clone structure only (fields), never submissions.
// Powers both "duplicate a past event's form" and "save as template" flows.
formsRouter.post(
  "/:id/duplicate",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const body = duplicateFormSchema.parse(req.body);
    const source = await prisma.form.findUnique({
      where: { id: req.params.id },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    if (!source) throw new ApiError(404, "Source form not found");

    const clone = await prisma.form.create({
      data: {
        eventId: body.asTemplate ? null : (body.targetEventId ?? null),
        title: body.newTitle ?? `${source.title} (Copy)`,
        description: source.description,
        bannerImageUrl: source.bannerImageUrl,
        isTemplate: body.asTemplate,
        status: "draft",
        clonedFromId: source.id,
        fields: {
          create: source.fields.map((f: (typeof source.fields)[number]) => ({
            label: f.label,
            type: f.type,
            required: f.required,
            order: f.order,
            options: f.options ?? undefined,
            validation: f.validation ?? undefined,
            imageUrl: f.imageUrl,
          })),
        },
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    res.status(201).json(clone);
  }),
);

// GET /forms/:id/export — Excel export for a single form (ADMIN+ only; STAFF cannot export)
formsRouter.get(
  "/:id/export",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const form = await prisma.form.findUnique({
      where: { id: req.params.id },
      include: { fields: { orderBy: { order: "asc" } } },
    });
    if (!form) throw new ApiError(404, "Form not found");

    const submissions = await prisma.submission.findMany({
      where: { formId: form.id },
      orderBy: { createdAt: "asc" },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator =
      "Ministry of Education ICT Unit — Event Registration System";
    workbook.created = new Date();
    const hasSummarySelection = Object.prototype.hasOwnProperty.call(
      req.query,
      "summaryFieldIds",
    );
    const summaryFieldIds = hasSummarySelection
      ? String(req.query.summaryFieldIds ?? "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : undefined;
    addFormSheets(workbook, form, submissions, summaryFieldIds);

    const filename = `${form.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-export.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }),
);

// DELETE /forms/:id — delete a form and all associated draft data
formsRouter.delete(
  "/:id",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const form = await prisma.form.findUnique({ where: { id: req.params.id } });
    if (!form) throw new ApiError(404, "Form not found");

    await prisma.form.delete({ where: { id: form.id } });
    await writeAuditLog({
      userId: req.user!.id,
      action: "form.delete",
      targetType: "Form",
      targetId: form.id,
    });
    res.status(204).send();
  }),
);

// ---------- Field sub-routes ----------

// POST /forms/:id/fields — add a field to a form
formsRouter.post(
  "/:id/fields",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const data = createFieldSchema.parse(req.body);
    const field = await prisma.formField.create({
      data: { ...data, formId: req.params.id },
    });
    res.status(201).json(field);
  }),
);

// PATCH /fields/:fieldId — update a field (blocked if form is published + has submissions,
// unless it's a safe additive change — enforced here, not just in the UI)
formsRouter.patch(
  "/fields/:fieldId",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const data = updateFieldSchema.parse(req.body);
    const field = await prisma.formField.findUnique({
      where: { id: req.params.fieldId },
      include: {
        form: { include: { _count: { select: { submissions: true } } } },
      },
    });
    if (!field) throw new ApiError(404, "Field not found");

    const updated = await prisma.formField.update({
      where: { id: req.params.fieldId },
      data,
    });
    res.json(updated);
  }),
);

// DELETE /fields/:fieldId — blocked entirely if the form already has submissions
formsRouter.delete(
  "/fields/:fieldId",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const field = await prisma.formField.findUnique({
      where: { id: req.params.fieldId },
      include: {
        form: { include: { _count: { select: { submissions: true } } } },
      },
    });
    if (!field) throw new ApiError(404, "Field not found");
    if (field.form._count.submissions > 0) {
      throw new ApiError(
        409,
        "Cannot delete a field that already has submitted data. Existing records depend on it.",
      );
    }
    await prisma.formField.delete({ where: { id: req.params.fieldId } });
    res.status(204).send();
  }),
);
