import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(2, "Event name must be at least 2 characters"),
  date: z.coerce.date({
    errorMap: () => ({ message: "A valid event date is required" }),
  }),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(["draft", "live", "closed"]).optional(),
});

export const fieldTypeEnum = z.enum([
  "text",
  "paragraph",
  "phone",
  "email",
  "number",
  "select",
  "radio",
  "checkbox",
  "yes_no",
  "image",
  "section_header",
]);

export const createFormSchema = z.object({
  eventId: z.string().cuid().nullable().optional(),
  title: z.string().min(2, "Form title must be at least 2 characters"),
  description: z.string().optional(),
  isTemplate: z.boolean().optional(),
  templateName: z.string().optional(),
});

export const createFieldSchema = z.object({
  label: z.string().optional().default(""),
  description: z.string().optional(),
  type: fieldTypeEnum,
  required: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      pattern: z.string().optional(),
      errorMessage: z.string().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
    })
    .optional(),
  imageUrl: z.string().url().optional(),
});

export const updateFieldSchema = createFieldSchema.partial();

// Submission payload is intentionally loose on `data` (Record<string, any>)
// because form fields are fully dynamic per event — see planning notes.
export const createSubmissionSchema = z.object({
  submissionToken: z.string().uuid("submissionToken must be a valid UUID"),
  data: z.record(z.string(), z.any()),
});

export const duplicateFormSchema = z.object({
  targetEventId: z.string().cuid().nullable().optional(),
  asTemplate: z.boolean().default(false),
  newTitle: z.string().optional(),
});
