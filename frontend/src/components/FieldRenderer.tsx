import {
  AlertCircle,
  Phone,
  Mail,
  Type,
  Hash,
  CheckSquare,
  ListChecks,
  CircleHelp,
  Image as ImageIcon,
  AlignLeft,
  LucideIcon,
} from "lucide-react";
import { FormField } from "../lib/types";

interface Props {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

const iconForType: Record<string, LucideIcon> = {
  text: Type,
  paragraph: AlignLeft,
  phone: Phone,
  email: Mail,
  number: Hash,
  select: ListChecks,
  radio: ListChecks,
  checkbox: CheckSquare,
  yes_no: CircleHelp,
  image: ImageIcon,
};

const inputBaseClasses =
  "w-full rounded-xl border bg-white dark:bg-brand-dark-800 px-4 py-3 text-base " +
  "text-brand-dark-900 dark:text-brand-lime-50 placeholder:text-brand-dark-300 dark:placeholder:text-brand-dark-400 " +
  "outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-lime-500/60";

function normalizeYesNoValue(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "enabled" in value
  ) {
    const record = value as Record<string, unknown>;
    const details =
      record.details &&
      typeof record.details === "object" &&
      !Array.isArray(record.details)
        ? Object.entries(record.details as Record<string, unknown>).reduce(
            (acc, [key, detailVal]) => {
              acc[key] = String(detailVal ?? "");
              return acc;
            },
            {} as Record<string, string>,
          )
        : {};

    return {
      enabled: Boolean(record.enabled),
      details,
    };
  }

  return { enabled: false, details: {} as Record<string, string> };
}

export function FieldRenderer({ field, value, error, onChange }: Props) {
  if (field.type === "section_header") {
    return (
      <div className="pt-2 pb-1">
        <h3 className="text-lg font-semibold text-brand-dark-900 dark:text-brand-lime-100">
          {field.label}
        </h3>
        <div className="mt-2 h-px w-full bg-gradient-to-r from-brand-lime-500/50 to-transparent" />
      </div>
    );
  }

  const Icon = iconForType[field.type] ?? Type;
  const borderClasses = error
    ? "border-red-400 dark:border-red-500 focus:ring-red-400/60"
    : "border-brand-dark-100 dark:border-brand-dark-700";

  if (field.type === "checkbox") {
    const options = field.options ?? [];
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <div className="flex flex-col gap-1.5">
        {(options.length ? options : [field.label]).map((option) => (
          <label
            key={option}
            className="flex items-start gap-2.5 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option),
                )
              }
              className="mt-0.5 h-5 w-5 rounded-md accent-brand-lime-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-brand-dark-600 dark:text-brand-dark-200">
              {option}
            </span>
          </label>
        ))}
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500 animate-fade-in">
            <AlertCircle size={13} />
            {error}
          </p>
        )}
      </div>
    );
  }

  if (field.type === "yes_no") {
    const state = normalizeYesNoValue(value);
    const detailLabels = field.options?.length
      ? field.options
      : ["Name", "Class"];

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ enabled: true, details: state.details })}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
              state.enabled
                ? "border-brand-lime-500 bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300"
                : "border-brand-dark-100 dark:border-brand-dark-700 text-brand-dark-600 dark:text-brand-dark-200"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => onChange({ enabled: false, details: state.details })}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
              !state.enabled
                ? "border-brand-lime-500 bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300"
                : "border-brand-dark-100 dark:border-brand-dark-700 text-brand-dark-600 dark:text-brand-dark-200"
            }`}
          >
            No
          </button>
        </div>

        {state.enabled && (
          <div className="space-y-2 rounded-2xl border border-brand-dark-100 bg-brand-dark-50/60 p-3 dark:border-brand-dark-700 dark:bg-brand-dark-950/50">
            {detailLabels.map((label) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-brand-dark-500 dark:text-brand-dark-300">
                  {label}
                </label>
                <input
                  type="text"
                  value={state.details[label] ?? ""}
                  onChange={(e) =>
                    onChange({
                      enabled: true,
                      details: {
                        ...state.details,
                        [label]: e.target.value,
                      },
                    })
                  }
                  className={`${inputBaseClasses} ${borderClasses}`}
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500 animate-fade-in">
            <AlertCircle size={13} />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
        <Icon
          size={15}
          className="text-brand-lime-600 dark:text-brand-lime-400"
        />
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {(field.type === "text" ||
        field.type === "phone" ||
        field.type === "email" ||
        field.type === "number") && (
        <input
          type={
            field.type === "number"
              ? "number"
              : field.type === "email"
                ? "email"
                : field.type === "phone"
                  ? "tel"
                  : "text"
          }
          inputMode={field.type === "phone" ? "numeric" : undefined}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBaseClasses} ${borderClasses}`}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      )}

      {field.type === "paragraph" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className={`${inputBaseClasses} ${borderClasses} resize-y`}
          placeholder={`Enter ${field.label.toLowerCase()}`}
        />
      )}

      {field.type === "select" && (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBaseClasses} ${borderClasses} appearance-none`}
        >
          <option value="" disabled>
            Select {field.label.toLowerCase()}
          </option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {field.type === "radio" && (
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((opt) => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                  selected
                    ? "border-brand-lime-500 bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300"
                    : "border-brand-dark-100 dark:border-brand-dark-700 text-brand-dark-600 dark:text-brand-dark-200 hover:border-brand-lime-400"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 animate-fade-in">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
