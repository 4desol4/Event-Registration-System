import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Plus,
  FileText,
  ArrowLeft,
  ExternalLink,
  Download,
  Trash2,
  Slash,
} from "lucide-react";
import {
  getEvent,
  exportEventToExcel,
  ApiRequestError,
  updateEvent,
  deleteEvent,
} from "../lib/api";
import { MinistryEvent } from "../lib/types";
import { StartFormModal } from "../components/StartFormModal";
import { useAuth } from "../context/AuthContext";

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const canManage = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const navigate = useNavigate();
  const [event, setEvent] = useState<MinistryEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    if (!event) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportEventToExcel(event.id);
    } catch (err) {
      setExportError(
        err instanceof ApiRequestError
          ? err.message
          : "Export failed. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  }

  async function toggleEvent() {
    if (!event) return;
    setBusy(true);
    try {
      const newStatus = event.status === "live" ? "closed" : "live";
      const updated = await updateEvent(event.id, { status: newStatus });
      setEvent(updated);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Could not update event");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm("Delete this event and all its forms? This cannot be undone."))
      return;
    setBusy(true);
    try {
      await deleteEvent(event.id);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Could not delete event");
    } finally {
      setBusy(false);
    }
  }

  function load() {
    if (eventId) getEvent(eventId).then(setEvent);
  }

  useEffect(load, [eventId]);

  if (!event) {
    return <div className="h-40 rounded-2xl shimmer-bg animate-shimmer" />;
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/"
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-brand-dark-400 hover:text-brand-lime-600"
      >
        <ArrowLeft size={15} />
        All Events
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl  text-brand-dark-900 dark:text-brand-lime-50">
            {event.name}
          </h1>
          <p className="mt-1 text-sm text-brand-dark-400">
            {new Date(event.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && event.forms.length > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 px-4 py-2.5 text-sm font-medium text-brand-dark-600 dark:text-brand-dark-200 transition-all hover:border-brand-lime-400 disabled:opacity-60"
            >
              <Download size={16} />
              {exporting ? "Exporting..." : "Export to Excel"}
            </button>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className={`flex items-center gap-2 rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 shadow-md shadow-brand-lime-500/20 transition-all hover:bg-brand-lime-400 active:scale-95 ${
              canManage ? "" : "hidden"
            }`}
          >
            <Plus size={17} />
            New Form
          </button>

          {canManage && (
            <>
              <button
                onClick={toggleEvent}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium dark:bg-yellow-900/20"
              >
                <Slash size={14} />
                {event.status === "live" ? "Close Event" : "Make Live"}
              </button>

              <button
                onClick={handleDelete}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-900/20"
              >
                <Trash2 size={14} />
                Delete Event
              </button>
            </>
          )}
        </div>
      </div>

      {exportError && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 animate-slide-up">
          {exportError}
        </div>
      )}

      {event.forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-dark-200 dark:border-brand-dark-700 py-16 text-center animate-slide-up">
          <FileText
            size={32}
            className="text-brand-dark-300 dark:text-brand-dark-600"
          />
          <p className="text-brand-dark-500 dark:text-brand-dark-300">
            No forms yet for this event
          </p>
          {canManage && (
            <button
              onClick={() => setModalOpen(true)}
              className="text-sm font-medium text-brand-lime-600 hover:underline"
            >
              Create your first form
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {event.forms.map((form, i) => (
            <Link
              key={form.id}
              to={`/forms/${form.id}`}
              className={`rounded-2xl border border-brand-dark-100 dark:border-brand-dark-800 bg-white dark:bg-brand-dark-900 p-4 transition-all duration-200 hover:border-brand-lime-400 hover:shadow-md animate-slide-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
              style={{ animationFillMode: "forwards" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-lime-500/10">
                  <FileText
                    size={16}
                    className="text-brand-lime-600 dark:text-brand-lime-400"
                  />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    form.status === "published"
                      ? "bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300"
                      : form.status === "closed"
                        ? "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-brand-dark-100 text-brand-dark-500 dark:bg-brand-dark-800 dark:text-brand-dark-300"
                  }`}
                >
                  {form.status}
                </span>
              </div>
              <p className="font-medium text-brand-dark-900 dark:text-brand-lime-50">
                {form.title}
              </p>
              {form.shortSlug && (
                <p className="mt-1 flex items-center gap-1 text-xs text-brand-dark-400">
                  <ExternalLink size={11} />
                  /r/{form.shortSlug}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      <StartFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        eventId={event.id}
        onCreated={(form) => navigate(`/forms/${form.id}`)}
      />
    </div>
  );
}
