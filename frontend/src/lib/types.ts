export type FieldType =
  | "text"
  | "paragraph"
  | "phone"
  | "email"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "yes_no"
  | "image"
  | "section_header";

export interface FieldValidation {
  pattern?: string;
  errorMessage?: string;
}

export interface FormField {
  id: string;
  formId: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  options?: string[] | null;
  validation?: FieldValidation | null;
  description?: string | null;
  imageUrl?: string | null;
}

export type FormStatus = "draft" | "published" | "closed";

export interface EventForm {
  id: string;
  eventId: string | null;
  title: string;
  description?: string | null;
  bannerImageUrl?: string | null;
  isTemplate: boolean;
  templateName?: string | null;
  clonedFromId?: string | null;
  status: FormStatus;
  shortSlug?: string | null;
  wifiEnabled?: boolean;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  _count?: { submissions: number };
}

export type EventStatus = "draft" | "live" | "closed";

export interface MinistryEvent {
  id: string;
  name: string;
  date: string;
  status: EventStatus;
  createdAt: string;
  forms: Pick<EventForm, "id" | "title" | "status" | "shortSlug">[];
}

export interface PublishResponse {
  form: EventForm;
  shortLink: string;
  qrDataUrl: string;
  wifiEnabled?: boolean;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  wifiQrDataUrl?: string | null;
}

export interface Submission {
  id: string;
  formId: string;
  submissionToken: string;
  data: Record<string, unknown>;
  flagged: boolean;
  flagReason?: string | null;
  possibleDuplicate: boolean;
  resolvedAt?: string | null;
  resolvedById?: string | null;
  lockedById?: string | null;
  lockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string | null;
  bannerImageUrl?: string | null;
  fields: FormField[];
}
