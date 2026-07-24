import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, GripVertical, Plus, X } from "lucide-react";
import { FormField } from "../lib/types";
import { FIELD_TYPE_CONFIG, FIELD_TYPE_ORDER } from "../lib/fieldConfig";

interface Props {
  field: FormField;
  locked: boolean; // true if the form already has submissions — restricts destructive edits
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<FormField>) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
}

export function FieldRow({ field, locked, isFirst, isLast, onUpdate, onDelete, onMove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const config = FIELD_TYPE_CONFIG[field.type];
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-900 transition-all duration-200">
      <div className="flex items-center gap-2 p-3">
        <GripVertical size={15} className="flex-shrink-0 text-brand-dark-300 dark:text-brand-dark-600" />

        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-lime-500/10">
          <Icon size={15} className="text-brand-lime-600 dark:text-brand-lime-400" />
        </div>

        <button onClick={() => setExpanded((e) => !e)} className="flex-1 text-left">
          <p className="text-sm font-medium text-brand-dark-900 dark:text-brand-lime-50">
            {field.label || "Untitled field"}
          </p>
          <p className="text-xs text-brand-dark-400">
            {config.label}
            {field.required && " · Required"}
          </p>
        </button>

        <div className="flex items-center gap-1">
          <button
            disabled={isFirst}
            onClick={() => onMove("up")}
            className="rounded-lg p-1.5 text-brand-dark-400 transition-colors hover:bg-brand-dark-50 dark:hover:bg-brand-dark-800 disabled:opacity-30"
          >
            <ChevronUp size={15} />
          </button>
          <button
            disabled={isLast}
            onClick={() => onMove("down")}
            className="rounded-lg p-1.5 text-brand-dark-400 transition-colors hover:bg-brand-dark-50 dark:hover:bg-brand-dark-800 disabled:opacity-30"
          >
            <ChevronDown size={15} />
          </button>
          <button
            onClick={onDelete}
            disabled={locked}
            title={locked ? "Can't delete — this form already has submissions" : "Delete field"}
            className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-slide-up space-y-3 border-t border-brand-dark-100 dark:border-brand-dark-700 p-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-dark-500 dark:text-brand-dark-300">
              Label
            </label>
            <input
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full rounded-lg border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-lime-500/60"
            />
          </div>

          {field.type !== "section_header" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-dark-500 dark:text-brand-dark-300">
                  Field Type
                </label>
                <select
                  value={field.type}
                  disabled={locked}
                  onChange={(e) => onUpdate({ type: e.target.value as FormField["type"] })}
                  className="w-full rounded-lg border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-lime-500/60 disabled:opacity-50"
                >
                  {FIELD_TYPE_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {FIELD_TYPE_CONFIG[t].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.required}
                    disabled={locked}
                    onChange={(e) => onUpdate({ required: e.target.checked })}
                    className="h-4 w-4 rounded accent-brand-lime-500 disabled:opacity-50"
                  />
                  Required field
                </label>
              </div>
            </div>
          )}

          {config.hasOptions && (
            <OptionsEditor
              options={field.options ?? []}
              onChange={(options) => onUpdate({ options })}
            />
          )}

          {(field.type === "phone" || field.type === "email" || field.type === "text" || field.type === "number") && (
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-dark-500 dark:text-brand-dark-300">
                Validation pattern (optional, regex)
              </label>
              <input
                value={field.validation?.pattern ?? ""}
                onChange={(e) =>
                  onUpdate({ validation: { ...field.validation, pattern: e.target.value } })
                }
                placeholder="e.g. ^[0-9]{11}$"
                className="w-full rounded-lg border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-brand-lime-500/60"
              />
              <input
                value={field.validation?.errorMessage ?? ""}
                onChange={(e) =>
                  onUpdate({ validation: { ...field.validation, errorMessage: e.target.value } })
                }
                placeholder="Error message shown to attendee"
                className="mt-2 w-full rounded-lg border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-lime-500/60"
              />
            </div>
          )}

          {locked && (
            <p className="rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400">
              This form already has submissions — type and required-status changes are locked to protect existing data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function OptionsEditor({ options, onChange }: { options: string[]; onChange: (opts: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addOption() {
    if (!draft.trim()) return;
    onChange([...options, draft.trim()]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-dark-500 dark:text-brand-dark-300">
        Options
      </label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {options.map((opt, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded-full bg-brand-lime-500/10 px-2.5 py-1 text-xs text-brand-lime-700 dark:text-brand-lime-300"
          >
            {opt}
            <button onClick={() => onChange(options.filter((_, idx) => idx !== i))}>
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOption();
            }
          }}
          placeholder="Add an option..."
          className="flex-1 rounded-lg border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-lime-500/60"
        />
        <button
          onClick={addOption}
          type="button"
          className="rounded-lg bg-brand-lime-500/15 px-2.5 text-brand-lime-700 dark:text-brand-lime-300"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
