import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Sparkles,
  AlignLeft,
  LayoutTemplate,
  MessageSquareText,
  Eye,
  Sun,
  Moon,
  Image as ImageIcon,
  QrCode,
  Lock,
  AlertTriangle,
  ShieldCheck,
  GraduationCap,
  ClipboardCheck,
  Undo2,
  Redo2,
  X,
} from "lucide-react";
import {
  getForm,
  createField,
  updateField,
  deleteField,
  updateForm,
  publishForm,
  deleteForm,
  duplicateForm,
  ApiRequestError,
} from "../lib/api";
import { EventForm, FormField } from "../lib/types";
import { MinistryFieldCard } from "../components/MinistryFieldCard";
import { FormPreviewModal } from "../components/FormPreviewModal";
import { PublishSuccessModal } from "../components/PublishSuccessModal";
import { Modal } from "../components/Modal";
import { QUICK_ADD_PRESETS } from "../lib/fieldConfig";
import {
  getMinistryTheme,
  MINISTRY_FONTS,
  type MinistryTheme,
} from "../lib/ministryTheme";

const FIELD_TYPES = {
  text: "text",
  paragraph: "paragraph",
  phone: "phone",
  email: "email",
  number: "number",
  select: "select",
  radio: "radio",
  checkbox: "checkbox",
  yes_no: "yes_no",
  image: "image",
  section_header: "section_header",
};

const OPTION_TYPES = new Set(["select", "radio", "checkbox", "yes_no"]);

export function FormBuilderPage() {
  const { formId } = useParams<{ formId: string }>();
  const { theme: themeMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isManager = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const readOnly = !isManager;
  const dark = themeMode === "dark";
  const t = getMinistryTheme(dark);

  const navigate = useNavigate();
  const [form, setForm] = useState<EventForm | null>(null);
  const [history, setHistory] = useState<EventForm[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    shortLink: string;
    qrDataUrl: string;
    wifiEnabled?: boolean;
    wifiSsid?: string | null;
    wifiPassword?: string | null;
    wifiQrDataUrl?: string | null;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [bannerOn, setBannerOn] = useState(true);
  const [description, setDescription] = useState("");
  const [wifiEnabled, setWifiEnabled] = useState(false);
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function cloneForm(form: EventForm) {
    return JSON.parse(JSON.stringify(form)) as EventForm;
  }

  function normalizeForm(f: EventForm) {
    return { ...f, fields: f.fields ?? [] } as EventForm;
  }

  function pushHistory(nextForm: EventForm) {
    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1);
      return [...truncated, cloneForm(nextForm)];
    });
    setHistoryIndex((prev) => prev + 1);
  }

  function load() {
    if (formId) {
      getForm(formId).then((f) => {
        setForm(normalizeForm(f));
        setDescription(f.description || "");
        setWifiEnabled(f.wifiEnabled || false);
        setWifiSsid(f.wifiSsid || "");
        setWifiPassword(f.wifiPassword || "");
        if (f.fields.length > 0) {
          setExpandedId(f.fields[0].id);
        }
        setHistory([cloneForm(normalizeForm(f))]);
        setHistoryIndex(0);
      });
    }
  }

  useEffect(load, [formId]);

  if (!form) {
    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: t.bg }}>
        <div className="h-64 rounded-2xl shimmer-bg animate-shimmer" />
      </div>
    );
  }

  const locked = (form?._count?.submissions ?? 0) > 0;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex + 1 < history.length;

  async function addField(type: string = "text") {
    if (!form || readOnly) return;
    const order = form.fields.length;
    try {
      const newField = await createField(form.id, {
        label: "",
        type: type as FormField["type"],
        required: false,
        order,
        options:
          type === "yes_no"
            ? ["Student Name", "Class"]
            : OPTION_TYPES.has(type)
              ? ["Option 1"]
              : undefined,
      });
      const updated = normalizeForm({
        ...form,
        fields: [...(form.fields ?? []), newField],
      });
      setForm(updated);
      pushHistory(updated);
      setExpandedId(newField.id);
      setMobileMenuOpen(false);
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function addPreset(
    preset: (typeof QUICK_ADD_PRESETS)[number]["field"],
  ) {
    if (!form || readOnly) return;
    const order = form.fields.length;
    try {
      const newField = await createField(form.id, {
        label: preset.label || "",
        type: preset.type || "text",
        required: preset.required || false,
        order,
        options: preset.options,
        validation: preset.validation,
      });
      const updated = normalizeForm({
        ...form,
        fields: [...(form.fields ?? []), newField],
      });
      setForm(updated);
      pushHistory(updated);
      setExpandedId(newField.id);
      setPresetMenuOpen(false);
      setMobileMenuOpen(false);
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function updateField_(fieldId: string, patch: Partial<FormField>) {
    if (readOnly) return;
    try {
      const updated = await updateField(fieldId, patch);
      setForm((f) => {
        if (!f) return f;
        const next = normalizeForm({
          ...f,
          fields: (f.fields ?? []).map((fl) =>
            fl.id === fieldId ? updated : fl,
          ),
        });
        pushHistory(next);
        return next;
      });
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function saveAsTemplate() {
    if (!form || readOnly) return;
    const templateName = window.prompt(
      "Template name",
      `${form.title} Template`,
    );
    if (!templateName?.trim()) return;
    try {
      await duplicateForm(form.id, {
        asTemplate: true,
        newTitle: templateName.trim(),
      });
      setErrorMsg(null);
      window.alert("Form saved as a template.");
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function removeField(fieldId: string) {
    if (readOnly) return;
    try {
      await deleteField(fieldId);
      setForm((f) => {
        if (!f) return f;
        const next = normalizeForm({
          ...f,
          fields: (f.fields ?? []).filter((fl) => fl.id !== fieldId),
        });
        pushHistory(next);
        return next;
      });
      if (expandedId === fieldId) setExpandedId(null);
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function duplicateField(fieldId: string) {
    if (!form || readOnly) return;
    const field = form.fields.find((f) => f.id === fieldId);
    if (!field) return;
    const idx = form.fields.findIndex((f) => f.id === fieldId);
    try {
      const newField = await createField(form.id, {
        label: field.label + " (copy)",
        type: field.type,
        required: field.required,
        order: idx + 1,
        options: field.options,
        validation: field.validation,
      });
      const updated = [...(form.fields ?? [])];
      updated.splice(idx + 1, 0, newField);
      const next = normalizeForm({ ...form, fields: updated });
      setForm(next);
      pushHistory(next);
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function moveField(fieldId: string, direction: number) {
    if (!form || readOnly) return;
    const idx = form.fields.findIndex((f) => f.id === fieldId);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= form.fields.length) return;

    const reordered = [...(form.fields ?? [])];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const next = normalizeForm({ ...form, fields: reordered });
    setForm(next);
    pushHistory(next);

    try {
      await Promise.all(
        reordered.map((f, i) => updateField(f.id, { order: i })),
      );
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function updateFormMeta() {
    if (!form || readOnly) return;
    try {
      const updated = await updateForm(form.id, {
        title: form.title,
        description,
        wifiEnabled,
        wifiSsid,
        wifiPassword,
      });
      setForm((prev) => {
        const merged = normalizeForm({
          ...(prev ?? {}),
          ...((updated ?? {}) as EventForm),
        });
        pushHistory(merged);
        return merged;
      });
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function compressImage(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });

    const maxWidth = 1200;
    const scale = Math.min(1, maxWidth / image.width);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare image canvas.");
    context.drawImage(image, 0, 0, width, height);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    return canvas.toDataURL(
      outputType,
      outputType === "image/png" ? undefined : 0.65,
    );
  }

  async function saveBannerImage(file: File) {
    if (!form || readOnly) return;
    if (file.size > 1000000) {
      setErrorMsg("Banner image must be smaller than 1MB.");
      return;
    }

    try {
      setSaving(true);
      const dataUrl = await compressImage(file);
      const updated = await updateForm(form.id, { bannerImageUrl: dataUrl });
      setForm((prev) => {
        const merged = normalizeForm({
          ...(prev ?? {}),
          ...((updated ?? {}) as EventForm),
        });
        pushHistory(merged);
        return merged;
      });
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveBannerUrl(url: string) {
    if (!form || readOnly) return;
    try {
      setSaving(true);
      const updated = await updateForm(form.id, { bannerImageUrl: url });
      setForm((prev) => {
        const merged = normalizeForm({
          ...(prev ?? {}),
          ...((updated ?? {}) as EventForm),
        });
        pushHistory(merged);
        return merged;
      });
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function clearBanner() {
    if (!form || readOnly) return;
    try {
      setSaving(true);
      const updated = await updateForm(form.id, { bannerImageUrl: null });
      setForm((prev) => {
        const merged = normalizeForm({
          ...(prev ?? {}),
          ...((updated ?? {}) as EventForm),
        });
        pushHistory(merged);
        return merged;
      });
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!form || readOnly) return;
    setPublishing(true);
    try {
      const result = await publishForm(form.id);
      setForm((prev) => {
        const merged = normalizeForm({
          ...(prev ?? {}),
          ...((result.form ?? {}) as EventForm),
        });
        pushHistory(merged);
        return merged;
      });
      setPublishResult({
        shortLink: result.shortLink,
        qrDataUrl: result.qrDataUrl,
        wifiEnabled: result.wifiEnabled,
        wifiSsid: result.wifiSsid,
        wifiPassword: result.wifiPassword,
        wifiQrDataUrl: result.wifiQrDataUrl,
      });
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function handleViewPublished() {
    if (!form || readOnly) return;
    setPublishing(true);
    try {
      const result = await publishForm(form.id);
      setPublishResult({
        shortLink: result.shortLink,
        qrDataUrl: result.qrDataUrl,
        wifiEnabled: result.wifiEnabled,
        wifiSsid: result.wifiSsid,
        wifiPassword: result.wifiPassword,
        wifiQrDataUrl: result.wifiQrDataUrl,
      });
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function handleCloseForm() {
    if (!form || readOnly) return;
    try {
      const updated = await updateForm(form.id, { status: "closed" });
      setForm((prev) => {
        const merged = normalizeForm({
          ...(prev ?? {}),
          ...((updated ?? {}) as EventForm),
        });
        pushHistory(merged);
        return merged;
      });
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function handleReopenForm() {
    if (!form || readOnly) return;
    try {
      const updated = await updateForm(form.id, { status: "published" });
      setForm((prev) => {
        const merged = normalizeForm({
          ...(prev ?? {}),
          ...((updated ?? {}) as EventForm),
        });
        pushHistory(merged);
        return merged;
      });
      setErrorMsg(null);
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  async function handleDeleteForm() {
    if (!form || readOnly) return;
    const confirmed = window.confirm(
      "Delete this form and all its draft data? This cannot be undone.",
    );
    if (!confirmed) return;
    try {
      await deleteForm(form.id);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiRequestError) setErrorMsg(err.message);
    }
  }

  function handleUndo() {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    setForm(normalizeForm(cloneForm(prev)));
    setHistoryIndex(historyIndex - 1);
  }

  function handleRedo() {
    if (historyIndex + 1 >= history.length) return;
    const next = history[historyIndex + 1];
    setForm(normalizeForm(cloneForm(next)));
    setHistoryIndex(historyIndex + 1);
  }

  const onDragStart = (idx: number) => () => (dragFrom.current = idx);
  const onDragOver = (idx: number) => (e: React.DragEvent) =>
    e.preventDefault();
  const onDrop = (idx: number) => () => {
    if (dragFrom.current === null || dragFrom.current === idx) return;
    const from = dragFrom.current;
    const reordered = [...(form.fields ?? [])];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(idx, 0, moved);
    setForm(normalizeForm({ ...form, fields: reordered }));
    dragFrom.current = null;
  };

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 flex flex-col"
      style={{ backgroundColor: t.bg, fontFamily: "Manrope, sans-serif" }}
    >
      <style>{`
        ${MINISTRY_FONTS}
        @keyframes fadeInUp { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform:translateY(0);} }
        @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
        @keyframes popIn { from { opacity:0; transform: scale(.94);} to { opacity:1; transform: scale(1);} }
        @keyframes expandIn { from { opacity:0; transform: translateY(-4px);} to { opacity:1; transform: translateY(0);} }
        .checkmark-circle { width:64px;height:64px;border-radius:9999px;display:flex;align-items:center;justify-content:center; animation: popIn .4s cubic-bezier(.2,.9,.3,1.3) both; }
        .checkmark-icon { animation: fadeIn .3s ease .15s both; }
        * { scrollbar-width: thin; }
      `}</style>

      {/* Accreditation ribbon */}
      <div
        className="h-1.5 w-full"
        style={{
          backgroundImage: `linear-gradient(90deg, ${t.accent}, ${t.gold}, ${t.accent})`,
        }}
      />

      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 backdrop-blur-md sm:px-6"
        style={{
          background: dark ? "rgba(10,19,16,0.88)" : "rgba(247,248,243,0.92)",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: t.accent }}
        >
          <GraduationCap size={18} className="text-white" />
        </div>
        <input
          value={form.title}
          onChange={(e) =>
            setForm((prev) =>
              prev ? normalizeForm({ ...prev, title: e.target.value }) : prev,
            )
          }
          onBlur={() => updateFormMeta()}
          disabled={readOnly}
          className="min-w-0 flex-1 truncate border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-brand-dark-400 dark:placeholder:text-brand-dark-500 sm:flex-none sm:w-56"
          style={{ color: t.text, opacity: readOnly ? 0.75 : 1 }}
        />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => toggleTheme()}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{ color: t.text, border: `1px solid ${t.border}` }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{ color: t.text, border: `1px solid ${t.border}` }}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/forms/${form.id}/submissions`)}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-brand-lime-400 sm:w-auto sm:gap-2 sm:px-4"
            style={{
              borderColor: t.border,
              backgroundColor: dark
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.88)",
              color: t.text,
            }}
          >
            <MessageSquareText size={16} />
            <span className="hidden sm:inline">Responses</span>
          </button>
          {isManager && (
            <button
              onClick={() =>
                form.status === "published"
                  ? handleViewPublished()
                  : handlePublish()
              }
              disabled={publishing || (form?.fields?.length ?? 0) === 0}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
              style={{
                background:
                  form.status === "published"
                    ? t.accentDark
                    : `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
              }}
            >
              {form.status === "published" ? (
                <ClipboardCheck size={15} />
              ) : (
                <QrCode size={15} />
              )}
              <span className="hidden sm:inline">
                {form.status === "published"
                  ? "View QR & link"
                  : publishing
                    ? "Publishing..."
                    : "Publish"}
              </span>
            </button>
          )}
        </div>
      </div>

      {locked && (
        <div
          className="mx-auto mt-4 flex max-w-2xl items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            background: t.dangerSoft,
            color: t.danger,
            animation: "fadeInUp 0.25s ease both",
          }}
        >
          <Lock size={15} className="shrink-0" />
          This form has live submissions — deleting questions or changing their
          type is disabled to protect existing data.
        </div>
      )}

      {errorMsg && (
        <div
          className="mx-auto mt-4 flex max-w-2xl items-center gap-2 rounded-xl px-4 py-3 text-sm"
          style={{
            background: t.dangerSoft,
            color: t.danger,
            animation: "fadeInUp 0.25s ease both",
          }}
        >
          <AlertTriangle size={15} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="mx-auto mt-4 flex max-w-2xl items-center justify-between gap-3 px-4 sm:px-6">
        <div
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            backgroundColor: t.surfaceAlt,
            border: `1px solid ${t.border}`,
            color: t.textMuted,
          }}
        >
          Status:{" "}
          <span className="font-semibold text-brand-dark-900 dark:text-brand-lime-100">
            {form.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManager ? (
            <>
              {form.status === "published" && (
                <button
                  onClick={handleCloseForm}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-900"
                >
                  Close registration
                </button>
              )}
              {form.status === "closed" && (
                <button
                  onClick={handleReopenForm}
                  className="rounded-2xl border border-brand-lime-200 bg-brand-lime-50 px-4 py-2 text-sm font-semibold text-brand-lime-700 transition hover:bg-brand-lime-100 dark:border-brand-lime-500/40 dark:bg-brand-lime-500/10 dark:text-brand-lime-200 dark:hover:bg-brand-lime-500/15"
                >
                  Reopen form
                </button>
              )}
              <button
                onClick={handleDeleteForm}
                className="rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:bg-brand-dark-50 dark:hover:bg-brand-dark-900"
                style={{
                  borderColor: t.border,
                  backgroundColor: t.surface,
                  color: t.text,
                }}
              >
                Delete form
              </button>
              <button
                onClick={saveAsTemplate}
                className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition hover:bg-brand-dark-50 dark:hover:bg-brand-dark-900"
                style={{
                  borderColor: t.border,
                  backgroundColor: t.surface,
                  color: t.text,
                }}
              >
                <LayoutTemplate size={15} /> Save as template
              </button>
            </>
          ) : (
            <div
              className="rounded-2xl border px-4 py-2 text-sm text-brand-dark-600 dark:text-brand-lime-200"
              style={{
                borderColor: t.border,
                backgroundColor: dark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(248,250,252,0.84)",
              }}
            >
              Staff users can view this form but cannot publish, close, or
              delete it.
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div
          className="mb-4 rounded-2xl border p-4 shadow-sm"
          style={{
            backgroundColor: t.surface,
            borderColor: t.border,
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: t.text }}>
                Registration banner
              </h2>
              <p className="text-sm" style={{ color: t.textMuted }}>
                Upload a banner image or paste an image URL to brand the form.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => !readOnly && fileInputRef.current?.click()}
                disabled={readOnly}
                className="rounded-full bg-brand-lime-500 px-3 py-2 text-sm font-semibold text-brand-dark-950 transition hover:bg-brand-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload image
              </button>
              <button
                type="button"
                onClick={() => !readOnly && setBannerOn(true)}
                disabled={readOnly}
                className="rounded-full border px-3 py-2 text-sm font-semibold transition hover:border-brand-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: t.border, color: t.text }}
              >
                Paste URL
              </button>
              {form.bannerImageUrl && (
                <button
                  type="button"
                  onClick={() => !readOnly && clearBanner()}
                  disabled={readOnly}
                  className="rounded-full border px-3 py-2 text-sm font-semibold transition hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: dark ? "rgba(255,255,255,0.08)" : "#FBCACA",
                    color: dark ? "#FCA5A5" : "#B91C1C",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {form.bannerImageUrl ? (
            <div className="mt-4 overflow-hidden rounded-2xl">
              <img
                src={form.bannerImageUrl}
                alt="Banner preview"
                className="h-48 w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="mt-4 flex h-48 items-center justify-center rounded-2xl text-center"
              style={{ backgroundColor: t.surfaceAlt, color: t.textMuted }}
            >
              No banner selected yet.
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={readOnly}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && !readOnly) saveBannerImage(file);
              e.target.value = "";
            }}
          />
          {bannerOn && (
            <div
              className="mt-4 rounded-2xl border p-3"
              style={{ borderColor: t.border, backgroundColor: t.surfaceAlt }}
            >
              <label
                className="block text-sm font-semibold"
                style={{ color: t.text }}
              >
                Banner image URL
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  value={form.bannerImageUrl ?? ""}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev
                        ? normalizeForm({
                            ...prev,
                            bannerImageUrl: e.target.value,
                          })
                        : prev,
                    )
                  }
                  onBlur={(e) => saveBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{
                    color: t.text,
                    backgroundColor: t.surface,
                    borderColor: t.border,
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    form?.bannerImageUrl && saveBannerUrl(form.bannerImageUrl)
                  }
                  disabled={!form?.bannerImageUrl || saving}
                  className="rounded-xl bg-brand-lime-500 px-4 py-2 text-sm font-semibold text-brand-dark-950 transition hover:bg-brand-lime-400 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Title card */}
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{
            backgroundColor: t.surface,
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: t.border,
            borderTopWidth: "6px",
            borderTopStyle: "solid",
            borderTopColor: t.accent,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <input
            value={form.title}
            readOnly={readOnly}
            onChange={(e) => {
              if (!readOnly)
                setForm((prev) =>
                  prev
                    ? normalizeForm({ ...prev, title: e.target.value })
                    : prev,
                );
            }}
            onBlur={() => !readOnly && updateFormMeta()}
            placeholder="Form title"
            className="w-full border-0 border-b-2 bg-transparent pb-2 text-2xl font-medium outline-none sm:text-3xl"
            style={{
              borderColor: t.borderStrong,
              color: t.text,
              opacity: readOnly ? 0.75 : 1,
              fontFamily: "Fraunces, serif",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = t.accent)}
          />
          <textarea
            value={description}
            readOnly={readOnly}
            onChange={(e) => {
              if (!readOnly) setDescription(e.target.value);
            }}
            onBlur={() => !readOnly && updateFormMeta()}
            placeholder="Form description"
            rows={2}
            className="mt-3 w-full resize-none border-0 bg-transparent text-sm outline-none"
            style={{
              color: t.textMuted,
              opacity: readOnly ? 0.75 : 1,
              cursor: readOnly ? "not-allowed" : "text",
            }}
          />

          {/* Wi-Fi hotspot settings — for attendees without mobile data.
              Saved to the database via the same updateFormMeta() call above,
              so changing the network name/password here never needs a code
              change or redeploy — just type it in and it's live. */}
          <div
            className="mt-4 rounded-xl border p-4"
            style={{
              borderColor: t.border,
              backgroundColor: t.surfaceAlt,
              boxShadow: dark
                ? "0 8px 24px rgba(0,0,0,0.18)"
                : "0 6px 18px rgba(15,23,42,0.05)",
            }}
          >
            <label
              className="flex items-start gap-3 text-sm font-semibold"
              style={{ color: t.text }}
            >
              <input
                type="checkbox"
                checked={wifiEnabled}
                disabled={readOnly}
                onChange={(e) => {
                  if (readOnly) return;
                  setWifiEnabled(e.target.checked);
                }}
                onBlur={() => !readOnly && updateFormMeta()}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-lime-500"
              />
              <span>
                <span className="block">Show a Wi-Fi QR code</span>
                <span
                  className="mt-0.5 block text-xs font-normal"
                  style={{ color: t.textMuted }}
                >
                  Help attendees connect without using mobile data.
                </span>
              </span>
            </label>

            {wifiEnabled && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1 block text-xs"
                    style={{ color: t.textMuted }}
                  >
                    Wi-Fi network name (SSID)
                  </label>
                  <input
                    value={wifiSsid}
                    readOnly={readOnly}
                    onChange={(e) => !readOnly && setWifiSsid(e.target.value)}
                    onBlur={() => !readOnly && updateFormMeta()}
                    placeholder="e.g. MOE-Reg-1"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none placeholder:text-brand-dark-400 focus:ring-2 focus:ring-brand-lime-500/40"
                    style={{
                      borderColor: t.border,
                      backgroundColor: t.surface,
                      color: t.text,
                    }}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-xs"
                    style={{ color: t.textMuted }}
                  >
                    Wi-Fi password (leave blank for an open network)
                  </label>
                  <input
                    value={wifiPassword}
                    readOnly={readOnly}
                    onChange={(e) =>
                      !readOnly && setWifiPassword(e.target.value)
                    }
                    onBlur={() => !readOnly && updateFormMeta()}
                    placeholder="Wi-Fi password"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none placeholder:text-brand-dark-400 focus:ring-2 focus:ring-brand-lime-500/40"
                    style={{
                      borderColor: t.border,
                      backgroundColor: t.surface,
                      color: t.text,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="mt-4">
          {form.fields
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((f, i) => (
              <MinistryFieldCard
                key={f.id}
                field={f}
                index={i}
                total={form.fields.length}
                expanded={expandedId === f.id}
                onExpand={setExpandedId}
                t={t}
                locked={locked}
                readOnly={readOnly}
                onUpdate={
                  readOnly ? () => {} : (patch) => updateField_(f.id, patch)
                }
                onDelete={readOnly ? () => {} : () => removeField(f.id)}
                onMove={readOnly ? () => {} : (dir) => moveField(f.id, dir)}
                onDuplicate={readOnly ? () => {} : () => duplicateField(f.id)}
                dragHandlers={{ onDragStart, onDragOver, onDrop }}
              />
            ))}

          {isManager && (
            <button
              onClick={() => addField("text")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 text-sm font-medium transition-colors hover:border-current"
              style={{
                borderColor: t.borderStrong,
                color: t.textMuted,
                animation: "fadeInUp 0.3s ease both",
                backgroundColor: t.surfaceAlt,
              }}
            >
              <Plus size={16} /> Add question
            </button>
          )}
        </div>

        <p
          className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs"
          style={{ color: t.textFaint }}
        >
          <ShieldCheck size={13} /> {form.fields.length} fields Â· draft
          autosaves locally
        </p>
      </div>

      {/* Desktop floating toolbar */}
      {isManager && (
        <div className="fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          <ToolbarBtn
            icon={Plus}
            label="Add question"
            onClick={() => addField("text")}
            t={t}
            accent
          />
          <div className="relative">
            <ToolbarBtn
              icon={Sparkles}
              label="Quick-add preset"
              onClick={() => setPresetMenuOpen((s) => !s)}
              t={t}
            />
            {presetMenuOpen && (
              <div
                className="absolute right-full top-0 mr-3 w-52 overflow-hidden rounded-xl shadow-xl"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  animation: "popIn 0.18s ease both",
                }}
              >
                {QUICK_ADD_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => addPreset(p.field)}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm hover:opacity-70"
                    style={{ color: t.text }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ToolbarBtn
            icon={AlignLeft}
            label="Add section"
            onClick={() => addField("section_header")}
            t={t}
          />
          <ToolbarBtn
            icon={ImageIcon}
            label="Banner image"
            onClick={() => setBannerOn(true)}
            t={t}
          />
          <ToolbarBtn
            icon={Undo2}
            label="Undo"
            onClick={handleUndo}
            t={t}
            accent={canUndo}
          />
          <ToolbarBtn
            icon={Redo2}
            label="Redo"
            onClick={handleRedo}
            t={t}
            accent={canRedo}
          />
        </div>
      )}

      {/* Mobile FAB */}
      {isManager && (
        <div className="fixed bottom-6 right-5 z-20 flex flex-col items-end gap-2 md:hidden">
          {mobileMenuOpen && (
            <div
              className="mb-1 flex flex-col gap-2 rounded-2xl p-2 shadow-xl"
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                animation: "popIn 0.18s ease both",
              }}
            >
              {[
                {
                  icon: Plus,
                  label: "Add question",
                  fn: () => addField("text"),
                },
                {
                  icon: Sparkles,
                  label: "Quick-add preset",
                  fn: () => setPresetMenuOpen((s) => !s),
                },
                {
                  icon: AlignLeft,
                  label: "Add section",
                  fn: () => addField("section_header"),
                },
                {
                  icon: ImageIcon,
                  label: "Banner image",
                  fn: () => {
                    setBannerOn(true);
                    setMobileMenuOpen(false);
                  },
                },
              ].map((it) => (
                <button
                  key={it.label}
                  onClick={it.fn}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                  style={{ color: t.text }}
                >
                  <it.icon size={16} style={{ color: t.accent }} /> {it.label}
                </button>
              ))}
              {presetMenuOpen && (
                <div
                  className="mt-1 border-t pt-2"
                  style={{ borderColor: t.border }}
                >
                  {QUICK_ADD_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => addPreset(p.field)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs"
                      style={{ color: t.textMuted }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen((s) => !s)}
            className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-90"
            style={{
              background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
              transform: mobileMenuOpen ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <Plus size={24} />
          </button>
        </div>
      )}

      {isManager && (
        <div className="fixed bottom-6 left-6 z-20 hidden items-center gap-2 rounded-full bg-brand-dark-950/90 px-3 py-2 text-sm text-brand-lime-100 shadow-xl md:flex">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="rounded-full px-3 py-2 transition hover:bg-brand-dark-900 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="rounded-full px-3 py-2 transition hover:bg-brand-dark-900 disabled:opacity-40"
          >
            Redo
          </button>
        </div>
      )}

      {previewOpen && (
        <FormPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          form={form}
        />
      )}

      {publishResult && (
        <PublishSuccessModal
          open={!!publishResult}
          onClose={() => setPublishResult(null)}
          shortLink={publishResult.shortLink}
          qrDataUrl={publishResult.qrDataUrl}
          formTitle={form.title}
          wifiSsid={publishResult.wifiSsid}
          wifiPassword={publishResult.wifiPassword}
          wifiQrDataUrl={publishResult.wifiQrDataUrl}
        />
      )}
    </div>
  );
}

interface ToolbarBtnProps {
  icon: any;
  label: string;
  onClick: () => void;
  t: MinistryTheme;
  accent?: boolean;
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
  t,
  accent,
}: ToolbarBtnProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className="flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-all duration-150 hover:scale-110 hover:shadow-md active:scale-95"
        style={{
          background: accent ? t.accent : t.surface,
          border: `1px solid ${accent ? t.accent : t.border}`,
          color: accent ? "#fff" : t.text,
        }}
      >
        <Icon size={18} />
      </button>
      <span
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
        style={{ background: t.text, color: t.bg }}
      >
        {label}
      </span>
    </div>
  );
}

function MiniPattern({ t }: { t: MinistryTheme }) {
  const icons = Array.from({ length: 14 });
  return (
    <div className="relative h-full w-full overflow-hidden opacity-25">
      {icons.map((_, i) => (
        <GraduationCap
          key={i}
          size={22}
          style={{
            position: "absolute",
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            transform: `rotate(${(i * 29) % 360}deg)`,
            color: "#fff",
          }}
        />
      ))}
    </div>
  );
}
