import {
  EventForm,
  FormField,
  MinistryEvent,
  PublishResponse,
  PublicForm,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export class ApiRequestError extends Error {
  status: number;
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    // Session expired or invalid — clear it so the app redirects to login
    // instead of looping on a token that will never work again.
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiRequestError(
      res.status,
      body?.message || `Request failed (${res.status})`,
      body,
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------- Events ----------
export const getEvents = () => request<MinistryEvent[]>("/events");
export const getEvent = (id: string) => request<MinistryEvent>(`/events/${id}`);
export const createEvent = (data: { name: string; date: string }) =>
  request<MinistryEvent>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateEvent = (
  id: string,
  data: Partial<{ name: string; date: string; status: string }>,
) =>
  request<MinistryEvent>(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// ---------- Forms ----------
export const getForm = (id: string) => request<EventForm>(`/forms/${id}`);
export const getTemplates = () => request<EventForm[]>("/forms/templates");
export const createForm = (data: {
  eventId?: string | null;
  title: string;
  description?: string;
}) =>
  request<EventForm>("/forms", { method: "POST", body: JSON.stringify(data) });
export const updateForm = (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    bannerImageUrl: string | null;
    status: "draft" | "published" | "closed";
    wifiEnabled: boolean;
    wifiSsid: string | null;
    wifiPassword: string | null;
  }>,
) =>
  request<EventForm>(`/forms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const publishForm = (id: string) =>
  request<PublishResponse>(`/forms/${id}/publish`, { method: "POST" });
export const closeForm = (id: string) =>
  request<EventForm>(`/forms/${id}/close`, { method: "POST" });
export const deactivateForm = (id: string) =>
  updateForm(id, { status: "closed" });
export const reactivateForm = (id: string) =>
  updateForm(id, { status: "published" });
export const deleteForm = (id: string) =>
  request<void>(`/forms/${id}`, { method: "DELETE" });
export const duplicateForm = (
  id: string,
  data: {
    targetEventId?: string | null;
    asTemplate?: boolean;
    newTitle?: string;
  },
) =>
  request<EventForm>(`/forms/${id}/duplicate`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// ---------- Fields ----------
export const createField = (
  formId: string,
  data: Omit<FormField, "id" | "formId">,
) =>
  request<FormField>(`/forms/${formId}/fields`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateField = (
  fieldId: string,
  data: Partial<Omit<FormField, "id" | "formId">>,
) =>
  request<FormField>(`/forms/fields/${fieldId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteField = (fieldId: string) =>
  request<void>(`/forms/fields/${fieldId}`, { method: "DELETE" });

// ---------- Submissions ----------
export interface Submission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  flagged: boolean;
  flagReason: string | null;
  possibleDuplicate: boolean;
  resolvedAt: string | null;
  resolvedById: string | null;
  lockedById: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getSubmissions = (
  formId: string,
  filter?: "flagged" | "possibleDuplicate",
) =>
  request<Submission[]>(
    `/forms/${formId}/submissions${filter ? `?${filter}=true` : ""}`,
  );

export const fetchFormBySlug = (slug: string) =>
  request<PublicForm>(`/forms/slug/${slug}`);

export const submitRegistration = (
  formId: string,
  submissionToken: string,
  data: Record<string, unknown>,
) =>
  request<void>(`/forms/${formId}/submissions`, {
    method: "POST",
    body: JSON.stringify({ submissionToken, data }),
  });

export const exportEventToExcel = (eventId: string) =>
  downloadFile(`/events/${eventId}/export`, `event-${eventId}-export.xlsx`);

export const deleteEvent = (id: string) =>
  request<void>(`/events/${id}`, { method: "DELETE" });

export const exportFormToExcel = (
  formId: string,
  summaryFieldIds?: string[],
) => {
  const query =
    summaryFieldIds !== undefined
      ? `?summaryFieldIds=${encodeURIComponent(summaryFieldIds.join(","))}`
      : "";
  return downloadFile(
    `/forms/${formId}/export${query}`,
    `form-${formId}-export.xlsx`,
  );
};

async function downloadFile(path: string, defaultFilename: string) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiRequestError(
      res.status,
      body?.message || `Request failed (${res.status})`,
      body,
    );
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition") ?? "";
  const filenameMatch = /filename="?([^";]+)"?/.exec(contentDisposition);
  const filename = filenameMatch ? filenameMatch[1] : defaultFilename;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const updateSubmission = (
  id: string,
  data: Partial<Pick<Submission, "data" | "flagged" | "flagReason">>,
) =>
  request<Submission>(`/submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const resolveSubmission = (id: string) =>
  request<Submission>(`/submissions/${id}/resolve`, { method: "POST" });
export const lockSubmission = (id: string) =>
  request<Submission>(`/submissions/${id}/lock`, { method: "POST" });

// ---------- Users (SUPER_ADMIN only) ----------
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: string;
}

export const getUsers = () => request<AdminUser[]>("/users");
export const createUser = (data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF";
}) =>
  request<AdminUser>("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (
  id: string,
  data: Partial<{ isActive: boolean; role: "ADMIN" | "STAFF" }>,
) =>
  request<AdminUser>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
