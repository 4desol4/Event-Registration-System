import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CalendarDays,
  ChevronRight,
  Circle,
  Trash2,
  Slash,
} from "lucide-react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { MinistryEvent } from "../lib/types";
import { Modal } from "../components/Modal";

const statusStyles: Record<string, string> = {
  draft:
    "bg-brand-dark-100 text-brand-dark-500 dark:bg-brand-dark-800 dark:text-brand-dark-300",
  live: "bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300",
  closed: "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400",
};

export function EventsListPage() {
  const [events, setEvents] = useState<MinistryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    getEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  const { user } = useAuth();
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  async function toggleEvent(eid: string, current: string) {
    setBusy((b) => ({ ...b, [eid]: true }));
    try {
      const newStatus = current === "live" ? "closed" : "live";
      const updated = await updateEvent(eid, { status: newStatus });
      setEvents((ev) => ev.map((x) => (x.id === eid ? updated : x)));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Could not update event");
    } finally {
      setBusy((b) => {
        const copy = { ...b };
        delete copy[eid];
        return copy;
      });
    }
  }

  async function handleDelete(eid: string) {
    if (!confirm("Delete this event and all its forms? This cannot be undone."))
      return;
    setBusy((b) => ({ ...b, [eid]: true }));
    try {
      await deleteEvent(eid);
      setEvents((ev) => ev.filter((x) => x.id !== eid));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Could not delete event");
    } finally {
      setBusy((b) => {
        const copy = { ...b };
        delete copy[eid];
        return copy;
      });
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !date) return;
    setSaving(true);
    try {
      await createEvent({ name, date });
      setModalOpen(false);
      setName("");
      setDate("");
      load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl  text-brand-dark-900 dark:text-brand-lime-50">
            Events
          </h1>
          <p className="mt-1 text-sm text-brand-dark-400 dark:text-brand-dark-300">
            {user?.role === "STAFF"
              ? "Browse live events assigned to your role."
              : "Manage registration for every Ministry program."}
          </p>
        </div>
        {user?.role !== "STAFF" && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 shadow-md shadow-brand-lime-500/20 transition-all duration-200 hover:bg-brand-lime-400 active:scale-95"
          >
            <Plus size={17} />
            New Event
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl shimmer-bg animate-shimmer"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-dark-200 dark:border-brand-dark-700 py-16 text-center animate-slide-up">
          <CalendarDays
            size={32}
            className="text-brand-dark-300 dark:text-brand-dark-600"
          />
          <p className="text-brand-dark-500 dark:text-brand-dark-300">
            No events yet
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm font-medium text-brand-lime-600 hover:underline"
          >
            Create your first event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <div
              key={event.id}
              className={`flex flex-col gap-4 rounded-2xl border border-brand-dark-100 dark:border-brand-dark-800 bg-white dark:bg-brand-dark-900 p-4 transition-all duration-200 hover:border-brand-lime-400 hover:shadow-md animate-slide-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
              style={{ animationFillMode: "forwards" }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  to={`/events/${event.id}`}
                  className="flex min-w-0 items-center gap-3.5"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-lime-500/10">
                    <CalendarDays
                      size={19}
                      className="text-brand-lime-600 dark:text-brand-lime-400"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-dark-900 dark:text-brand-lime-50 truncate">
                      {event.name}
                    </p>
                    <p className="text-xs text-brand-dark-400 dark:text-brand-dark-400">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      {event.forms.length} form
                      {event.forms.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
                <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[event.status]}`}
                  >
                    <Circle size={6} className="fill-current" />
                    {event.status}
                  </span>
                  {user?.role === "SUPER_ADMIN" && (
                    <>
                      <button
                        onClick={() => toggleEvent(event.id, event.status)}
                        disabled={!!busy[event.id]}
                        className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-1 text-sm font-medium dark:bg-yellow-900/20"
                      >
                        <Slash size={14} />
                        {event.status === "live" ? "Close" : "Make live"}
                      </button>

                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={!!busy[event.id]}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/20"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  )}
                  <ChevronRight
                    size={18}
                    className="text-brand-dark-300 dark:text-brand-dark-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Event"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Event Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Youth Sunday 2026"
              className="w-full rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-brand-lime-500/60"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Event Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-brand-lime-500/60"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-2 rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 transition-all hover:bg-brand-lime-400 active:scale-95 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Event"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
