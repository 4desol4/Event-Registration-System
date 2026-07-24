import ExcelJS from "exceljs";
import type { Form, FormField, Submission } from "@prisma/client";

const FLAG_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFDE2E2" }, // soft red — matches the dashboard's flagged-row tint
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFEAF7D6" }, // soft lime — matches the brand palette
};

type FormWithFields = Form & { fields: FormField[] };

/**
 * Adds a "Submissions" sheet and a "Summary" sheet for one form to an
 * existing workbook. Column order matches each field's `order`, and headers
 * are the human-readable labels — never raw field IDs — so the file is
 * immediately usable by someone who never saw the form builder.
 */
export function addFormSheets(
  workbook: ExcelJS.Workbook,
  form: FormWithFields,
  submissions: Submission[],
  summaryFieldIds?: string[],
) {
  const sortedFields = [...form.fields]
    .filter((f) => f.type !== "section_header")
    .sort((a, b) => a.order - b.order);

  // ---------- Submissions sheet ----------
  const sheetName = uniqueSheetName(workbook, `Submissions - ${form.title}`);
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    ...sortedFields.map((f) => ({ header: f.label, key: f.id, width: 22 })),
    { header: "Submitted At", key: "__submittedAt", width: 20 },
    { header: "Status", key: "__status", width: 14 },
  ];

  sheet.getRow(1).eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = { bold: true };
  });

  for (const submission of submissions) {
    const data = submission.data as Record<string, unknown>;
    const row: Record<string, unknown> = {
      __submittedAt: new Date(submission.createdAt).toLocaleString(),
      __status: submission.flagged
        ? `Flagged: ${submission.flagReason ?? "see notes"}`
        : submission.possibleDuplicate
          ? "Possible duplicate"
          : "OK",
    };
    for (const field of sortedFields) {
      row[field.id] = formatCellValue(data[field.id]);
    }
    const addedRow = sheet.addRow(row);
    if (submission.flagged) {
      addedRow.eachCell((cell) => (cell.fill = FLAG_FILL));
    }
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  // ---------- Summary sheet ----------
  const summarySheetName = uniqueSheetName(workbook, `Summary - ${form.title}`);
  const summarySheet = workbook.addWorksheet(summarySheetName);
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value", key: "value", width: 16 },
  ];
  summarySheet.getRow(1).eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = { bold: true };
  });

  const flaggedCount = submissions.filter((s) => s.flagged).length;
  const duplicateCount = submissions.filter((s) => s.possibleDuplicate).length;

  summarySheet.addRow({
    metric: "Total Submissions",
    value: submissions.length,
  });
  summarySheet.addRow({
    metric: "Flagged (unresolved issues)",
    value: flaggedCount,
  });
  summarySheet.addRow({ metric: "Possible Duplicates", value: duplicateCount });
  summarySheet.addRow({ metric: "", value: "" });

  // Breakdown for every select/radio field — this is what makes the "create a
  // summary" step disappear as manual work; it's computed here, not by hand later.
  const breakdownFields = sortedFields.filter(
    (f) =>
      (f.type === "select" ||
        f.type === "radio" ||
        f.type === "checkbox" ||
        f.type === "yes_no") &&
      (!summaryFieldIds || summaryFieldIds.includes(f.id)),
  );
  for (const field of breakdownFields) {
    summarySheet.addRow({ metric: field.label.toUpperCase(), value: "" }).font =
      { bold: true };
    const counts = new Map<string, number>();
    for (const submission of submissions) {
      const data = submission.data as Record<string, unknown>;
      const rawValue = data[field.id];
      if (field.type === "yes_no") {
        const value =
          rawValue && typeof rawValue === "object" && "enabled" in rawValue;
        if (!value) continue;
        const enabled = (rawValue as { enabled?: boolean }).enabled === true;
        counts.set(
          enabled ? "Yes" : "No",
          (counts.get(enabled ? "Yes" : "No") ?? 0) + 1,
        );
        continue;
      }
      const values = Array.isArray(rawValue)
        ? rawValue.map(String)
        : [String(rawValue ?? "").trim()];
      for (const value of values) {
        if (!value) continue;
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    for (const [option, count] of [...counts.entries()].sort(
      (a, b) => b[1] - a[1],
    )) {
      summarySheet.addRow({ metric: `  ${option}`, value: count });
    }
    summarySheet.addRow({ metric: "", value: "" });
  }
}

// Excel sheet names: max 31 chars, can't contain \ / ? * [ ], and MUST be
// unique within a workbook (ExcelJS throws if two sheets share a name).
// This matters here because a single event export can include multiple
// forms — and two forms easily end up with similar or identical titles,
// e.g. one duplicated from another without renaming ("Registration (Copy)").
function uniqueSheetName(workbook: ExcelJS.Workbook, rawName: string): string {
  const base = rawName.replace(/[\\/?*[\]]/g, "-").slice(0, 31);
  if (!workbook.getWorksheet(base)) return base;

  for (let suffix = 2; suffix < 1000; suffix++) {
    const suffixStr = ` (${suffix})`;
    const candidate = base.slice(0, 31 - suffixStr.length) + suffixStr;
    if (!workbook.getWorksheet(candidate)) return candidate;
  }
  // Astronomically unlikely fallback — still guarantees uniqueness.
  return base.slice(0, 20) + Date.now().toString().slice(-8);
}

function formatCellValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value))
    return value.map(formatCellValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => {
        const formatted = formatCellValue(item);
        return formatted ? `${key}: ${formatted}` : null;
      })
      .filter(Boolean);
    return entries.join("; ");
  }
  return String(value);
}
