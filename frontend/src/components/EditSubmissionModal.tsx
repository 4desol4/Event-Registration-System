import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { FormField } from "../lib/types";
import { Submission } from "../lib/api";

interface Props {
  submission: Submission | null;
  fields: FormField[];
  onClose: () => void;
  onSave: (
    id: string,
    data: Record<string, unknown>,
    flagged: boolean,
    flagReason: string | null,
  ) => Promise<void>;
}

export function EditSubmissionModal({
  submission,
  fields,
  onClose,
  onSave,
}: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [flagged, setFlagged] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(submission?.data ?? {});
    setFlagged(Boolean(submission?.flagged));
    setFlagReason(submission?.flagReason ?? "");
  }, [submission]);

  if (!submission) return null;

  async function handleSave() {
    if (!submission) return;

    setSaving(true);
    try {
      await onSave(
        submission.id,
        values,
        flagged,
        flagReason.trim() ? flagReason.trim() : null,
      );
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!submission} onClose={onClose} title="Review Submission">
      <div className="flex flex-col gap-3">
        {submission.flagReason && !flagged && (
          <p className="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            Previously flagged: {submission.flagReason}
          </p>
        )}

        <label className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <input
            type="checkbox"
            checked={flagged}
            onChange={(e) => setFlagged(e.target.checked)}
            className="h-4 w-4 accent-red-600"
          />
          Mark this response as flagged
        </label>

        <div>
          <label className="mb-1 block text-xs font-medium text-brand-dark-500 dark:text-brand-dark-300">
            Admin flag reason
          </label>
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            rows={3}
            placeholder="Add a reason for flagging this response"
            className="w-full rounded-lg border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-lime-500/60"
          />
        </div>

        {fields
          .filter((f) => f.type !== "section_header")
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <div key={field.id}>
              <label className="mb-1 block text-xs font-medium text-brand-dark-500 dark:text-brand-dark-300">
                {field.label}
              </label>
              <input
                value={(values[field.id] as string) ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                }
                className="w-full rounded-lg border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-lime-500/60"
              />
            </div>
          ))}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-2 rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 transition-all hover:bg-brand-lime-400 active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Review"}
        </button>
      </div>
    </Modal>
  );
}
