import { AlertTriangle, Copy, Lock, CheckCircle2, Pencil } from "lucide-react";
import { FormField } from "../lib/types";
import { Submission } from "../lib/api";

interface Props {
  fields: FormField[];
  submissions: Submission[];
  onResolve: (id: string) => void;
  onEdit: (submission: Submission) => void;
  onLock: (id: string) => void;
  currentStaffName: string;
  canManage: boolean;
}

export function SubmissionsTable({
  fields,
  submissions,
  onResolve,
  onEdit,
  onLock,
  currentStaffName,
  canManage,
}: Props) {
  const sortedFields = [...fields]
    .filter((f) => f.type !== "section_header")
    .sort((a, b) => a.order - b.order);

  if (submissions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brand-dark-200 dark:border-brand-dark-700 py-16 text-center bg-white dark:bg-brand-dark-950/10">
        <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
          No submissions match this view yet
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-brand-dark-100 dark:border-brand-dark-800 bg-white dark:bg-brand-dark-950 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-900">
            <th className="w-10 px-3 py-3" />
            {sortedFields.map((f) => (
              <th
                key={f.id}
                className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-dark-500 dark:text-brand-dark-300"
              >
                {f.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-dark-500 dark:text-brand-dark-300">
              Submitted
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-dark-500 dark:text-brand-dark-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, i) => {
            const isLockedByOther =
              s.lockedById && s.lockedById !== currentStaffName;
            return (
              <tr
                key={s.id}
                className={`border-b border-brand-dark-100 dark:border-brand-dark-700 transition-colors animate-fade-in ${
                  s.flagged
                    ? "bg-red-50 dark:bg-red-950/40"
                    : s.possibleDuplicate
                      ? "bg-amber-50 dark:bg-amber-950/30"
                      : i % 2 === 0
                        ? "bg-white dark:bg-brand-dark-950"
                        : "bg-brand-dark-50 dark:bg-brand-dark-900"
                }`}
              >
                <td className="px-4 py-3">
                  {s.flagged ? (
                    <AlertTriangle size={16} className="text-red-400" />
                  ) : s.possibleDuplicate ? (
                    <Copy size={16} className="text-amber-400" />
                  ) : (
                    <CheckCircle2 size={16} className="text-brand-lime-400" />
                  )}
                </td>
                {sortedFields.map((f) => (
                  <td
                    key={f.id}
                    className="whitespace-nowrap px-4 py-3 text-sm text-brand-dark-700 dark:text-brand-dark-200"
                  >
                    {formatValue(s.data[f.id])}
                  </td>
                ))}
                <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-dark-500 dark:text-brand-dark-300">
                  {new Date(s.createdAt).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isLockedByOther && (
                      <span className="flex items-center gap-1 rounded-full bg-brand-dark-100 dark:bg-brand-dark-800 px-2 py-1 text-[10px] text-brand-dark-700 dark:text-brand-dark-300">
                        <Lock size={10} />
                        {s.lockedById}
                      </span>
                    )}
                    {canManage && (
                      <button
                        onClick={() => {
                          onLock(s.id);
                          onEdit(s);
                        }}
                        disabled={!!isLockedByOther}
                        className="rounded-lg p-2 text-brand-dark-500 dark:text-brand-dark-300 transition-colors hover:bg-brand-dark-100 dark:hover:bg-brand-dark-800 disabled:opacity-30"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    {(s.flagged || s.possibleDuplicate) && canManage && (
                      <button
                        onClick={() => onResolve(s.id)}
                        className="rounded-full bg-brand-lime-500/10 px-3 py-1 text-xs font-semibold text-brand-lime-700 dark:text-brand-lime-200 transition hover:bg-brand-lime-500/20"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
