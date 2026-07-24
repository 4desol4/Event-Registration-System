import { useEffect, useState } from "react";
import { FileText, LayoutTemplate, Copy, ChevronRight, ArrowLeft, LucideIcon } from "lucide-react";
import { Modal } from "./Modal";
import { createForm, duplicateForm, getEvents, getTemplates } from "../lib/api";
import { EventForm, MinistryEvent } from "../lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  eventId: string;
  onCreated: (form: EventForm) => void;
}

type View = "menu" | "blank" | "templates" | "duplicate";

export function StartFormModal({ open, onClose, eventId, onCreated }: Props) {
  const [view, setView] = useState<View>("menu");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<EventForm[]>([]);
  const [pastEvents, setPastEvents] = useState<MinistryEvent[]>([]);

  useEffect(() => {
    if (!open) {
      setView("menu");
      setTitle("");
    }
  }, [open]);

  useEffect(() => {
    if (view === "templates") getTemplates().then(setTemplates);
    if (view === "duplicate") getEvents().then(setPastEvents);
  }, [view]);

  async function handleBlankCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      const form = await createForm({ eventId, title });
      onCreated(form);
    } finally {
      setSaving(false);
    }
  }

  async function handleUseTemplate(templateId: string, templateTitle: string) {
    setSaving(true);
    try {
      const form = await duplicateForm(templateId, { targetEventId: eventId, asTemplate: false, newTitle: templateTitle });
      onCreated(form);
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicateForm(formId: string, formTitle: string) {
    setSaving(true);
    try {
      const form = await duplicateForm(formId, { targetEventId: eventId, asTemplate: false, newTitle: `${formTitle} (Copy)` });
      onCreated(form);
    } finally {
      setSaving(false);
    }
  }

  const BackButton = () => (
    <button
      onClick={() => setView("menu")}
      className="mb-4 flex items-center gap-1.5 text-sm font-medium text-brand-dark-400 hover:text-brand-lime-600"
    >
      <ArrowLeft size={15} />
      Back
    </button>
  );

  return (
    <Modal open={open} onClose={onClose} title="Create New Form" maxWidth="max-w-lg">
      {view === "menu" && (
        <div className="flex flex-col gap-2.5">
          <OptionCard
            icon={FileText}
            title="Start from blank"
            description="Build a new form from scratch"
            onClick={() => setView("blank")}
          />
          <OptionCard
            icon={LayoutTemplate}
            title="Use a template"
            description="Choose from your saved reusable templates"
            onClick={() => setView("templates")}
          />
          <OptionCard
            icon={Copy}
            title="Duplicate a past event's form"
            description="Copy the structure from any previous event"
            onClick={() => setView("duplicate")}
          />
        </div>
      )}

      {view === "blank" && (
        <div className="animate-fade-in">
          <BackButton />
          <form onSubmit={handleBlankCreate} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
                Form Title
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Youth Sunday Registration"
                className="w-full rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-lime-500/60"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 transition-all hover:bg-brand-lime-400 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create & Continue to Builder"}
            </button>
          </form>
        </div>
      )}

      {view === "templates" && (
        <div className="animate-fade-in">
          <BackButton />
          {templates.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-dark-400">
              No templates saved yet. Save any form as a template from the builder.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  disabled={saving}
                  onClick={() => handleUseTemplate(t.id, t.templateName || t.title)}
                  className="flex items-center justify-between rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 px-4 py-3 text-left transition-all hover:border-brand-lime-400 disabled:opacity-60"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-dark-900 dark:text-brand-lime-50">
                      {t.templateName || t.title}
                    </p>
                    <p className="text-xs text-brand-dark-400">{t.fields.length} fields</p>
                  </div>
                  <ChevronRight size={16} className="text-brand-dark-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "duplicate" && (
        <div className="animate-fade-in max-h-96 overflow-y-auto">
          <BackButton />
          {pastEvents.flatMap((e) => e.forms).length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-dark-400">No past forms to duplicate yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {pastEvents
                .filter((e) => e.forms.length > 0)
                .map((e) => (
                  <div key={e.id}>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-brand-dark-400">
                      {e.name}
                    </p>
                    <div className="flex flex-col gap-2">
                      {e.forms.map((f) => (
                        <button
                          key={f.id}
                          disabled={saving}
                          onClick={() => handleDuplicateForm(f.id, f.title)}
                          className="flex items-center justify-between rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 px-4 py-3 text-left transition-all hover:border-brand-lime-400 disabled:opacity-60"
                        >
                          <p className="text-sm font-medium text-brand-dark-900 dark:text-brand-lime-50">
                            {f.title}
                          </p>
                          <ChevronRight size={16} className="text-brand-dark-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function OptionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3.5 rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 p-4 text-left transition-all duration-200 hover:border-brand-lime-400 hover:bg-brand-lime-50/40 dark:hover:bg-brand-dark-800 active:scale-[0.98]"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-lime-500/10">
        <Icon size={18} className="text-brand-lime-600 dark:text-brand-lime-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-brand-dark-900 dark:text-brand-lime-50">{title}</p>
        <p className="text-xs text-brand-dark-400">{description}</p>
      </div>
    </button>
  );
}
