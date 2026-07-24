import { Router } from "express";
import ExcelJS from "exceljs";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { createEventSchema, updateEventSchema } from "../utils/validators";
import { authenticate, requireRole } from "../middleware/auth";
import { writeAuditLog } from "../lib/audit";
import { addFormSheets } from "../utils/excelExport";

export const eventsRouter = Router();

// POST /events — create a new event
eventsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createEventSchema.parse(req.body);
    const event = await prisma.event.create({ data });
    res.status(201).json(event);
  }),
);

// GET /events — list all events, most recent first
eventsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const events = await prisma.event.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { date: "desc" },
      include: {
        forms: {
          select: { id: true, title: true, status: true, shortSlug: true },
        },
      },
    });
    res.json(events);
  }),
);

// GET /events/:id — single event with its forms
eventsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        forms: {
          include: { _count: { select: { submissions: true } } },
        },
      },
    });
    if (!event) throw new ApiError(404, "Event not found");
    res.json(event);
  }),
);

// GET /events/:id/export — Excel export for all forms in an event (ADMIN+ only)
eventsRouter.get(
  "/:id/export",
  authenticate,
  requireRole("SUPER_ADMIN", "ADMIN"),
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        forms: {
          include: { fields: { orderBy: { order: "asc" } } },
        },
      },
    });
    if (!event) throw new ApiError(404, "Event not found");
    if (!event.forms.length) {
      throw new ApiError(400, "Event has no forms to export.");
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator =
      "Ministry of Education ICT Unit — Event Registration System";
    workbook.created = new Date();

    for (const form of event.forms) {
      const submissions = await prisma.submission.findMany({
        where: { formId: form.id },
        orderBy: { createdAt: "asc" },
      });
      addFormSheets(workbook, form, submissions);
    }

    const filename = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-export.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();

    await writeAuditLog({
      userId: req.user!.id,
      action: "event.export",
      targetType: "Event",
      targetId: event.id,
    });
  }),
);

// PATCH /events/:id — update event details or status
eventsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateEventSchema.parse(req.body);
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
    });
    res.json(event);
  }),
);

// DELETE /events/:id — delete an event and all its associated forms (SUPER_ADMIN only)
eventsRouter.delete(
  "/:id",
  authenticate,
  requireRole("SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { forms: { select: { id: true } } },
    });
    if (!event) throw new ApiError(404, "Event not found");

    // Delete associated forms first to ensure related cascade rules run
    await prisma.$transaction(async (tx) => {
      if (event.forms.length > 0) {
        const formIds = event.forms.map((f) => f.id);
        await tx.form.deleteMany({ where: { id: { in: formIds } } });
      }
      await tx.event.delete({ where: { id: event.id } });
    });

    await writeAuditLog({
      userId: req.user!.id,
      action: "event.delete",
      targetType: "Event",
      targetId: event.id,
      details: { deletedFormIds: event.forms.map((f) => f.id) },
    });

    res.status(204).send();
  }),
);
