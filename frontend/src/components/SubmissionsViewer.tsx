import { useEffect, useState } from "react";
import { Download, Eye, EyeOff } from "lucide-react";
import { getSubmissions, Submission } from "../lib/api";
import { FormField } from "../lib/types";

interface Props {
  formId: string;
  fields: FormField[];
  t: any;
}

export function SubmissionsViewer({ formId, fields, t }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(fields.slice(0, 5).map((f) => f.id)),
  );

  useEffect(() => {
    loadSubmissions();
  }, [formId]);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const data = await getSubmissions(formId);
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleColumn(fieldId: string) {
    const newSet = new Set(visibleColumns);
    if (newSet.has(fieldId)) {
      newSet.delete(fieldId);
    } else {
      newSet.add(fieldId);
    }
    setVisibleColumns(newSet);
  }

  function exportToExcel() {
    // Prepare headers
    const visibleFields = fields.filter((f) => visibleColumns.has(f.id));
    const headers = [
      "Submitted At",
      ...visibleFields.map((f) => f.label || f.id),
    ];

    // Prepare rows
    const rows = submissions.map((sub) => [
      new Date(sub.createdAt).toLocaleString(),
      ...visibleFields.map((f) => {
        const value = sub.data[f.id];
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object") return JSON.stringify(value);
        return value || "";
      }),
    ]);

    // Create CSV content
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `submissions-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="py-12 text-center" style={{ color: t.textMuted }}>
        Loading submissions...
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="py-12 text-center" style={{ color: t.textMuted }}>
        No submissions yet
      </div>
    );
  }

  const visibleFields = fields.filter((f) => visibleColumns.has(f.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p style={{ color: t.text }} className="font-semibold">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSubmissions()}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition"
            style={{
              background: t.surfaceAlt,
              color: t.text,
              border: `1px solid ${t.border}`,
            }}
          >
            Refresh
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition text-white"
            style={{
              background: `linear-gradient(135deg, #10b981, #059669)`,
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Column visibility toggle */}
      <div className="flex flex-wrap gap-2">
        {fields.map((field) => (
          <button
            key={field.id}
            onClick={() => toggleColumn(field.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition"
            style={{
              background: visibleColumns.has(field.id)
                ? t.accentSoft
                : t.surfaceAlt,
              color: visibleColumns.has(field.id) ? t.accent : t.textMuted,
              border: `1px solid ${t.border}`,
            }}
          >
            {visibleColumns.has(field.id) ? (
              <Eye size={12} />
            ) : (
              <EyeOff size={12} />
            )}
            {field.label || "Field"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-lg border"
        style={{ borderColor: t.border }}
      >
        <table
          className="w-full text-sm"
          style={{ backgroundColor: t.surface }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
              <th
                className="px-4 py-2 text-left font-semibold"
                style={{ color: t.text }}
              >
                Submitted
              </th>
              {visibleFields.map((field) => (
                <th
                  key={field.id}
                  className="px-4 py-2 text-left font-semibold"
                  style={{ color: t.text }}
                >
                  {field.label || "Field"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, idx) => (
              <tr
                key={sub.id}
                style={{
                  borderBottom: `1px solid ${t.border}`,
                  backgroundColor: idx % 2 === 0 ? t.surface : t.surfaceAlt,
                }}
              >
                <td className="px-4 py-2" style={{ color: t.text }}>
                  <div className="text-xs" style={{ color: t.textMuted }}>
                    {new Date(sub.createdAt).toLocaleString()}
                  </div>
                </td>
                {visibleFields.map((field) => (
                  <td
                    key={field.id}
                    className="px-4 py-2 max-w-xs truncate"
                    style={{ color: t.text }}
                  >
                    {Array.isArray(sub.data[field.id])
                      ? (sub.data[field.id] as unknown[]).join(", ")
                      : typeof sub.data[field.id] === "object"
                        ? JSON.stringify(sub.data[field.id])
                        : String(sub.data[field.id] || "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
