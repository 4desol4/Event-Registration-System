import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  AlertTriangle,
  Copy,
  List,
  LucideIcon,
  Download,
  Settings2,
} from "lucide-react";
import {
  getForm,
  getSubmissions,
  updateSubmission,
  resolveSubmission,
  lockSubmission,
  exportFormToExcel,
  ApiRequestError,
  Submission,
} from "../lib/api";
import { EventForm } from "../lib/types";
import { getSocket, joinFormRoom, leaveFormRoom } from "../lib/socket";
import { LiveCounter } from "../components/LiveCounter";
import { SubmissionsTable } from "../components/SubmissionsTable";
import { EditSubmissionModal } from "../components/EditSubmissionModal";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../components/Modal";

type FilterTab = "all" | "flagged" | "duplicates";

export function SubmissionsDashboardPage() {
  const { formId } = useParams<{ formId: string }>();
  const { user } = useAuth();
  const canManage = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const [form, setForm] = useState<EventForm | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Submission | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryFieldIds, setSummaryFieldIds] = useState<string[]>([]);

  async function handleExport() {
    if (!form) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportFormToExcel(form.id);
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

  useEffect(() => {
    if (!formId) return;
    getForm(formId).then(setForm);
    getSubmissions(formId).then(setSubmissions);

    joinFormRoom(formId);
    const socket = getSocket();

    function handleNew(submission: Submission) {
      setSubmissions((prev) => [submission, ...prev]);
    }
    function handleUpdated(submission: Submission) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submission.id ? submission : s)),
      );
    }

    socket.on("new_submission", handleNew);
    socket.on("submission_updated", handleUpdated);

    return () => {
      socket.off("new_submission", handleNew);
      socket.off("submission_updated", handleUpdated);
      leaveFormRoom(formId);
    };
  }, [formId]);

  const filtered = useMemo(() => {
    let list = submissions;
    if (tab === "flagged") list = list.filter((s) => s.flagged);
    if (tab === "duplicates") list = list.filter((s) => s.possibleDuplicate);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        JSON.stringify(s.data).toLowerCase().includes(q),
      );
    }
    return list;
  }, [submissions, tab, search]);

  const flaggedCount = submissions.filter((s) => s.flagged).length;
  const duplicateCount = submissions.filter((s) => s.possibleDuplicate).length;

  async function handleResolve(id: string) {
    const updated = await resolveSubmission(id);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  async function handleLock(id: string) {
    await lockSubmission(id);
  }

  async function handleSaveEdit(
    id: string,
    data: Record<string, unknown>,
    flagged: boolean,
    flagReason: string | null,
  ) {
    const updated = await updateSubmission(id, {
      data,
      flagged,
      flagReason,
    });
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  if (!form)
    return <div className="h-64 rounded-2xl shimmer-bg animate-shimmer" />;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark-900 dark:text-brand-lime-50">
            {form.title}
          </h1>
          <p className="mt-1 text-sm text-brand-dark-400 dark:text-brand-dark-300">
            Live registration dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canManage && (
            <button
              onClick={() => {
                setSummaryFieldIds(
                  form.fields
                    .filter((field) =>
                      ["select", "radio", "checkbox"].includes(field.type),
                    )
                    .map((field) => field.id),
                );
                setSummaryOpen(true);
              }}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 shadow-md shadow-brand-lime-500/20 transition-all duration-200 hover:bg-brand-lime-400 active:scale-95 disabled:opacity-60"
            >
              <Download size={15} />
              {exporting ? "Exporting..." : "Export"}
            </button>
          )}
          <LiveCounter count={submissions.length} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <TabButton
            active={tab === "all"}
            onClick={() => setTab("all")}
            icon={List}
            label="All"
            count={submissions.length}
          />
          <TabButton
            active={tab === "flagged"}
            onClick={() => setTab("flagged")}
            icon={AlertTriangle}
            label="Flagged"
            count={flaggedCount}
            tone="red"
          />
          <TabButton
            active={tab === "duplicates"}
            onClick={() => setTab("duplicates")}
            icon={Copy}
            label="Possible Duplicates"
            count={duplicateCount}
            tone="amber"
          />
        </div>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark-300"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submissions..."
            className="rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-lime-500/60"
          />
        </div>
      </div>

      {exportError && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 animate-slide-up">
          {exportError}
        </div>
      )}

      <div className="space-y-4">
        <SubmissionsTable
          fields={form.fields}
          submissions={filtered}
          onResolve={handleResolve}
          onEdit={setEditing}
          onLock={handleLock}
          currentStaffName={user?.id ?? ""}
          canManage={canManage}
        />
      </div>

      <EditSubmissionModal
        submission={editing}
        fields={form.fields}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
      />

      <Modal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Choose summary fields"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
            Select option fields to include in the Summary sheet. Counts are
            calculated for each selected option.
          </p>
          <div className="space-y-2">
            {form.fields
              .filter((field) =>
                ["select", "radio", "checkbox"].includes(field.type),
              )
              .map((field) => (
                <label
                  key={field.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-dark-100 bg-brand-dark-50 px-3 py-3 text-sm dark:border-brand-dark-700 dark:bg-brand-dark-800"
                >
                  <input
                    type="checkbox"
                    checked={summaryFieldIds.includes(field.id)}
                    onChange={(event) =>
                      setSummaryFieldIds((current) =>
                        event.target.checked
                          ? [...current, field.id]
                          : current.filter((id) => id !== field.id),
                      )
                    }
                    className="h-4 w-4 accent-brand-lime-500"
                  />
                  <span className="font-medium text-brand-dark-800 dark:text-brand-lime-100">
                    {field.label || "Untitled question"}
                  </span>
                  <span className="ml-auto text-xs text-brand-dark-400">
                    {field.type}
                  </span>
                </label>
              ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSummaryOpen(false)}
              className="rounded-xl border border-brand-dark-200 px-4 py-2 text-sm font-semibold text-brand-dark-600 dark:border-brand-dark-700 dark:text-brand-lime-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl bg-brand-lime-500 px-4 py-2 text-sm font-semibold text-brand-dark-950 disabled:opacity-60"
            >
              <Settings2 size={15} />
              {exporting ? "Exporting..." : "Export selected summary"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  tone = "lime",
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  count: number;
  tone?: "lime" | "red" | "amber";
}) {
  const toneClasses = {
    lime: "bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300",
    red: "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400",
    amber:
      "bg-amber-50 text-amber-500 dark:bg-amber-950/40 dark:text-amber-400",
  };

  const base =
    "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200";
  const activeClasses =
    "border border-brand-lime-400/40 bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-200 shadow-sm shadow-brand-lime-500/10";
  const inactiveClasses =
    "border border-transparent text-brand-dark-500 hover:border-brand-dark-600 hover:bg-brand-dark-50 dark:hover:bg-brand-dark-800";

  return (
    <button
      onClick={onClick}
      className={`${base} ${active ? activeClasses : inactiveClasses} ${toneClasses[tone]}`}
    >
      <Icon size={14} />
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${active ? "bg-brand-lime-100/20 text-brand-lime-700 dark:text-brand-lime-200" : "bg-brand-dark-100 dark:bg-brand-dark-800 text-brand-dark-600 dark:text-brand-dark-300"}`}
      >
        {count}
      </span>
    </button>
  );
}
