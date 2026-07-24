import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { createSubmissionSchema } from "../utils/validators";
import { authenticate, requireRole } from "../middleware/auth";
import type { Server as SocketIOServer } from "socket.io";

export function buildSubmissionsRouter(io: SocketIOServer) {
  const router = Router();

  // GET /forms/:formId/submissions — list submissions for a form (admin/staff dashboard)
  router.get(
    "/forms/:formId/submissions",
    authenticate,
    asyncHandler(async (req, res) => {
      const { flagged, possibleDuplicate } = req.query;
      const submissions = await prisma.submission.findMany({
        where: {
          formId: req.params.formId,
          ...(flagged === "true" ? { flagged: true } : {}),
          ...(possibleDuplicate === "true" ? { possibleDuplicate: true } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(submissions);
    }),
  );

  // POST /forms/:formId/submissions — PUBLIC endpoint the attendee form submits to
  router.post(
    "/forms/:formId/submissions",
    asyncHandler(async (req, res) => {
      const formId = req.params.formId;
      const body = createSubmissionSchema.parse(req.body);

      const form = await prisma.form.findUnique({
        where: { id: formId },
        include: { fields: true },
      });
      if (!form) throw new ApiError(404, "Form not found");
      if (form.status !== "published") {
        throw new ApiError(
          403,
          "This form is not currently accepting submissions.",
        );
      }

      // Idempotency: if this exact token was already written, this is a
      // double-tap or network retry, not a new attendee — return the existing row.
      const existing = await prisma.submission.findUnique({
        where: { submissionToken: body.submissionToken },
      });
      if (existing) {
        return res.status(200).json(existing);
      }

      // Server-side validation per field — this is what powers live flagging.
      // We never trust client-side validation alone.
      let flagged = false;
      const flagReasons: string[] = [];

      for (const field of form.fields) {
        const value = body.data[field.id];
        const isEmpty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (field.required && isEmpty && field.type !== "section_header") {
          flagged = true;
          flagReasons.push(`"${field.label}" is required but was left blank`);
          continue;
        }

        if (!isEmpty && field.validation) {
          const rule = field.validation as {
            pattern?: string;
            errorMessage?: string;
          };
          if (rule.pattern) {
            const regex = new RegExp(rule.pattern);
            if (!regex.test(String(value))) {
              flagged = true;
              flagReasons.push(
                rule.errorMessage ||
                  `"${field.label}" does not match the required format`,
              );
            }
          }
        }
      }

      // Soft duplicate detection: same-ish name/phone combo within a short window.
      // This never blocks the submission — it only surfaces a suggestion for staff.
      type FieldRow = (typeof form.fields)[number];
      const nameField = form.fields.find((f: FieldRow) =>
        /name/i.test(f.label),
      );
      const phoneField = form.fields.find((f: FieldRow) => f.type === "phone");
      let possibleDuplicate = false;

      if (nameField || phoneField) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const recent = await prisma.submission.findMany({
          where: { formId, createdAt: { gte: twoMinutesAgo } },
          take: 50,
          orderBy: { createdAt: "desc" },
        });
        const newName = nameField
          ? String(body.data[nameField.id] ?? "")
              .trim()
              .toLowerCase()
          : null;
        const newPhone = phoneField
          ? String(body.data[phoneField.id] ?? "").trim()
          : null;

        type SubmissionRow = (typeof recent)[number];
        possibleDuplicate = recent.some((r: SubmissionRow) => {
          const data = r.data as Record<string, unknown>;
          const sameName =
            newName && nameField
              ? String(data[nameField.id] ?? "")
                  .trim()
                  .toLowerCase() === newName
              : false;
          const samePhone =
            newPhone && phoneField
              ? String(data[phoneField.id] ?? "").trim() === newPhone
              : false;
          return sameName && samePhone;
        });
      }

      const submission = await prisma.submission.create({
        data: {
          formId,
          submissionToken: body.submissionToken,
          data: body.data,
          flagged,
          flagReason: flagReasons.length ? flagReasons.join("; ") : null,
          possibleDuplicate,
        },
      });

      // Real-time push to the admin dashboard (Phase 4 consumes this)
      io.to(`form:${formId}`).emit("new_submission", submission);

      res.status(201).json(submission);
    }),
  );

  // PATCH /submissions/:id — inline edit (staff/admin), e.g. fixing a flagged typo
  router.patch(
    "/submissions/:id",
    authenticate,
    requireRole("SUPER_ADMIN", "ADMIN"),
    asyncHandler(async (req, res) => {
      const { data, flagged, flagReason } = req.body;
      const updated = await prisma.submission.update({
        where: { id: req.params.id },
        data: {
          ...(data ? { data } : {}),
          ...(flagged !== undefined ? { flagged } : {}),
          ...(flagReason !== undefined ? { flagReason } : {}),
        },
      });
      io.to(`form:${updated.formId}`).emit("submission_updated", updated);
      res.json(updated);
    }),
  );

  // POST /submissions/:id/resolve — clear a flag, record who resolved it
  router.post(
    "/submissions/:id/resolve",
    authenticate,
    requireRole("SUPER_ADMIN", "ADMIN"),
    asyncHandler(async (req, res) => {
      const { resolvedById } = req.body;
      const updated = await prisma.submission.update({
        where: { id: req.params.id },
        data: {
          flagged: false,
          possibleDuplicate: false,
          resolvedAt: new Date(),
          resolvedById: resolvedById ?? null,
          lockedById: null,
          lockedAt: null,
        },
      });
      io.to(`form:${updated.formId}`).emit("submission_updated", updated);
      res.json(updated);
    }),
  );

  // POST /submissions/:id/lock — mark "in progress by X" so staff don't collide
  router.post(
    "/submissions/:id/lock",
    authenticate,
    requireRole("SUPER_ADMIN", "ADMIN"),
    asyncHandler(async (req, res) => {
      const { userId } = req.body;
      const updated = await prisma.submission.update({
        where: { id: req.params.id },
        data: { lockedById: userId, lockedAt: new Date() },
      });
      io.to(`form:${updated.formId}`).emit("submission_updated", updated);
      res.json(updated);
    }),
  );

  return router;
}
