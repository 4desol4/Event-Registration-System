import { useState } from "react";
import {
  AlertTriangle,
  Copy,
  Lock,
  CheckCircle2,
  Pencil,
  ChevronDown,
} from "lucide-react";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sortedFields = [...fields]
    .filter((f) => f.type !== "section_header")
    .sort((a, b) => a.order - b.order);

  if (submissions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-brand-dark-200 bg-white py-16 text-center dark:border-brand-dark-700 dark:bg-brand-dark-950/10">
        <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
          No submissions match this view yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-brand-dark-100 bg-white shadow-sm dark:border-brand-dark-800 dark:bg-brand-dark-950">
      <div className="block space-y-3 p-3 md:hidden">
        {submissions.map((s, i) => {
          const isLockedByOther =
            s.lockedById && s.lockedById !== currentStaffName;
          return (
            <div
              key={s.id}
              className={`rounded-2xl border transition-colors ${
                s.flagged
                  ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
                  : s.possibleDuplicate
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                    : "border-brand-dark-100 dark:border-brand-dark-800"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId((current) => (current === s.id ? null : s.id))
                }
                className="flex w-full items-start gap-2 p-3 text-left"
              >
                <div className="mt-0.5 shrink-0">
                  {s.flagged ? (
                    <AlertTriangle size={16} className="text-red-400" />
                  ) : s.possibleDuplicate ? (
                    <Copy size={16} className="text-amber-400" />
                  ) : (
                    <CheckCircle2 size={16} className="text-brand-lime-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-brand-dark-800 dark:text-brand-lime-100">
                      Submission {i + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-brand-dark-500 dark:text-brand-dark-300">
                        {new Date(s.createdAt).toLocaleTimeString()}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`shrink-0 transition-transform ${
                          expandedId === s.id ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {isLockedByOther && (
                      <span className="flex items-center gap-1 rounded-full bg-brand-dark-100 px-2 py-1 text-[10px] text-brand-dark-700 dark:bg-brand-dark-800 dark:text-brand-dark-300">
                        <Lock size={10} />
                        {s.lockedById}
                      </span>
                    )}
                    {(s.flagged || s.possibleDuplicate) && canManage && (
                      <span className="rounded-full bg-brand-lime-500/10 px-2.5 py-1 text-[10px] font-semibold text-brand-lime-700 dark:text-brand-lime-200">
                        Needs review
                      </span>
                    )}
                  </div>
                </div>
              </button>
              {expandedId === s.id && (
                <div className="border-t border-brand-dark-100 px-3 pb-3 pt-2 dark:border-brand-dark-800">
                  <div className="space-y-2">
                    {sortedFields.map((f) => (
                      <div
                        key={f.id}
                        className="rounded-xl bg-brand-dark-50 px-2.5 py-2 dark:bg-brand-dark-900"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-dark-500 dark:text-brand-dark-400">
                          {f.label}
                        </p>
                        <p className="mt-0.5 break-words text-sm text-brand-dark-700 dark:text-brand-dark-200">
                          {formatValue(s.data[f.id])}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {canManage && (
                      <button
                        onClick={() => {
                          onLock(s.id);
                          onEdit(s);
                        }}
                        disabled={!!isLockedByOther}
                        className="rounded-lg bg-brand-dark-100 px-2.5 py-1.5 text-xs font-medium text-brand-dark-600 transition hover:bg-brand-dark-200 disabled:opacity-30 dark:bg-brand-dark-800 dark:text-brand-dark-200 dark:hover:bg-brand-dark-700"
                      >
                        Edit
                      </button>
                    )}
                    {(s.flagged || s.possibleDuplicate) && canManage && (
                      <button
                        onClick={() => onResolve(s.id)}
                        className="rounded-full bg-brand-lime-500/10 px-3 py-1.5 text-xs font-semibold text-brand-lime-700 transition hover:bg-brand-lime-500/20 dark:text-brand-lime-200"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-dark-100 bg-white dark:border-brand-dark-700 dark:bg-brand-dark-900">
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
                  className={`border-b border-brand-dark-100 transition-colors animate-fade-in dark:border-brand-dark-700 ${
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
                        <span className="flex items-center gap-1 rounded-full bg-brand-dark-100 px-2 py-1 text-[10px] text-brand-dark-700 dark:bg-brand-dark-800 dark:text-brand-dark-300">
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
                          className="rounded-lg p-2 text-brand-dark-500 transition-colors hover:bg-brand-dark-100 disabled:opacity-30 dark:text-brand-dark-300 dark:hover:bg-brand-dark-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {(s.flagged || s.possibleDuplicate) && canManage && (
                        <button
                          onClick={() => onResolve(s.id)}
                          className="rounded-full bg-brand-lime-500/10 px-3 py-1 text-xs font-semibold text-brand-lime-700 transition hover:bg-brand-lime-500/20 dark:text-brand-lime-200"
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
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
