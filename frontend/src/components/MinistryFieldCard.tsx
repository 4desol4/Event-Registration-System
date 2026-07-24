import { useEffect, useState } from "react";
import {
  ChevronDown,
  Trash2,
  GripVertical,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { FormField } from "../lib/types";
import { FIELD_TYPE_CONFIG, FIELD_TYPE_ORDER } from "../lib/fieldConfig";
import { MinistryTheme } from "../lib/ministryTheme";

interface Props {
  field: FormField;
  index: number;
  total: number;
  locked: boolean;
  expanded: boolean;
  t: MinistryTheme;
  onExpand: (fieldId: string | null) => void;
  onUpdate: (patch: Partial<FormField>) => void;
  onDelete: () => void;
  onMove: (direction: number) => void;
  onDuplicate: () => void;
  readOnly: boolean;
  dragHandlers: {
    onDragStart: (index: number) => (e: React.DragEvent) => void;
    onDragOver: (index: number) => (e: React.DragEvent) => void;
    onDrop: (index: number) => (e: React.DragEvent) => void;
  };
}

export function MinistryFieldCard({
  field,
  index,
  total,
  locked,
  expanded,
  t,
  onExpand,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  readOnly,
  dragHandlers,
}: Props) {
  const config = FIELD_TYPE_CONFIG[field.type];
  const Icon = config.icon;
  const isSection = field.type === "section_header";
  const hasOptions = config.hasOptions;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [labelDraft, setLabelDraft] = useState(field.label);
  const [optionDrafts, setOptionDrafts] = useState(field.options ?? []);

  useEffect(() => setLabelDraft(field.label), [field.label]);
  useEffect(() => setOptionDrafts(field.options ?? []), [field.options]);

  function commitLabel() {
    if (!readOnly && labelDraft !== field.label)
      onUpdate({ label: labelDraft });
  }

  function commitOptions(nextOptions: string[]) {
    if (
      !readOnly &&
      JSON.stringify(nextOptions) !== JSON.stringify(field.options ?? [])
    ) {
      onUpdate({ options: nextOptions });
    }
  }

  return (
    <div
      draggable={!expanded && !readOnly}
      onDragStart={dragHandlers.onDragStart(index)}
      onDragOver={dragHandlers.onDragOver(index)}
      onDrop={dragHandlers.onDrop(index)}
      className="mb-3 rounded-2xl transition-all duration-200 ease-out"
      style={{
        backgroundColor: t.surface,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: expanded ? t.accent : t.border,
        borderLeftWidth: "4px",
        borderLeftStyle: "solid",
        borderLeftColor: expanded ? t.accent : "transparent",
        boxShadow: expanded
          ? `0 6px 20px -8px ${t.accent}59`
          : "0 1px 2px rgba(0,0,0,0.03)",
        animation: "fadeInUp 0.35s ease both",
        animationDelay: `${Math.min(index, 8) * 40}ms`,
      }}
    >
      {/* Collapsed header row — always visible */}
      <button
        type="button"
        onClick={() => onExpand(expanded ? null : field.id)}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
      >
        <span
          className="cursor-grab opacity-40 hover:opacity-70"
          style={{ color: t.textMuted }}
        >
          <GripVertical size={16} />
        </span>
        <div
          className="flex shrink-0 items-center justify-center rounded-lg"
          style={{
            width: 34,
            height: 34,
            background: t.accentSoft,
            color: t.accent,
          }}
        >
          <Icon size={17} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-semibold"
            style={{ color: t.text, fontFamily: "Manrope, sans-serif" }}
          >
            {field.label || "Untitled question"}
            {field.required && <span style={{ color: t.gold }}> *</span>}
          </p>
          <p className="truncate text-xs" style={{ color: t.textFaint }}>
            {config.label}
            {hasOptions && field.options?.length
              ? ` · ${field.options.length} options`
              : ""}
          </p>
        </div>
        <ChevronDown
          size={18}
          style={{
            color: t.textMuted,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Expanded editor */}
      {expanded && (
        <div
          className="px-5 pb-5 pt-1"
          style={{ animation: "expandIn 0.22s ease both" }}
        >
          <div className="h-px w-full" style={{ background: t.border }} />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <input
              value={labelDraft}
              readOnly={readOnly}
              onChange={(e) => {
                if (!readOnly) setLabelDraft(e.target.value);
              }}
              onBlur={(e) => {
                commitLabel();
                e.currentTarget.style.borderColor = t.borderStrong;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitLabel();
                  e.currentTarget.blur();
                }
              }}
              placeholder={isSection ? "Section title" : "Question label"}
              className="flex-1 border-0 border-b-2 bg-transparent pb-2 text-lg font-medium outline-none transition-colors"
              style={{
                borderColor: t.borderStrong,
                color: t.text,
                opacity: readOnly ? 0.8 : 1,
                fontFamily: "Fraunces, serif",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = t.accent)}
            />
            {!isSection && (
              <div className="relative">
                <select
                  value={field.type}
                  disabled={readOnly}
                  onChange={(e) =>
                    onUpdate({ type: e.target.value as FormField["type"] })
                  }
                  className="w-full appearance-none rounded-lg py-2 pl-3 pr-9 text-sm font-medium outline-none sm:w-48"
                  style={{
                    background: t.surfaceAlt,
                    border: `1px solid ${t.border}`,
                    color: t.text,
                    opacity: readOnly ? 0.5 : 1,
                    cursor: readOnly ? "not-allowed" : "pointer",
                  }}
                >
                  {FIELD_TYPE_ORDER.map((k) => (
                    <option key={k} value={k}>
                      {FIELD_TYPE_CONFIG[k].label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: t.textMuted }}
                />
              </div>
            )}
          </div>

          {isSection && (
            <textarea
              value={field.description || ""}
              readOnly={readOnly}
              onChange={(e) => {
                if (!readOnly) onUpdate({ description: e.target.value });
              }}
              placeholder="Section description (optional)"
              rows={2}
              className="mt-3 w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                background: t.surfaceAlt,
                border: `1px solid ${t.border}`,
                color: t.textMuted,
              }}
            />
          )}

          {locked && !isSection && (
            <p
              className="mt-2 flex items-center gap-1.5 text-xs"
              style={{ color: t.gold }}
            >
              <AlertTriangle size={13} /> Question type is locked because this
              form already has submissions.
            </p>
          )}

          {/* Options editor */}
          {hasOptions && (
            <div className="mt-4 space-y-2">
              {optionDrafts.map((opt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2"
                  style={{ animation: "fadeInUp 0.2s ease both" }}
                >
                  <Icon size={16} style={{ color: t.textFaint }} />
                  <input
                    value={opt}
                    readOnly={readOnly}
                    onChange={(e) => {
                      if (readOnly) return;
                      const newOptions = [...optionDrafts];
                      newOptions[i] = e.target.value;
                      setOptionDrafts(newOptions);
                    }}
                    onBlur={() => commitOptions(optionDrafts)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitOptions(optionDrafts);
                        e.currentTarget.blur();
                      }
                    }}
                    className="flex-1 border-0 border-b bg-transparent py-1.5 text-sm outline-none"
                    style={{
                      borderColor: t.border,
                      color: t.text,
                      opacity: readOnly ? 0.6 : 1,
                      cursor: readOnly ? "not-allowed" : "text",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (readOnly) return;
                      const newOptions = optionDrafts.filter(
                        (_, oi) => oi !== i,
                      );
                      setOptionDrafts(newOptions);
                      commitOptions(newOptions);
                    }}
                    disabled={readOnly}
                    className="opacity-50 hover:opacity-100"
                    style={{
                      color: t.textMuted,
                      cursor: readOnly ? "not-allowed" : "pointer",
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  if (readOnly) return;
                  const newOptions = [
                    ...optionDrafts,
                    `Option ${optionDrafts.length + 1}`,
                  ];
                  setOptionDrafts(newOptions);
                  commitOptions(newOptions);
                }}
                disabled={readOnly}
                className="ml-6 flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-50"
                style={{
                  color: t.accent,
                  cursor: readOnly ? "not-allowed" : "pointer",
                }}
              >
                <Plus size={14} /> Add option
              </button>
            </div>
          )}

          {/* Validation */}
          {["text", "phone", "email", "number"].includes(field.type) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  if (readOnly) return;
                  setShowAdvanced((s) => !s);
                }}
                disabled={readOnly}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide disabled:opacity-50"
                style={{
                  color: t.textMuted,
                  cursor: readOnly ? "not-allowed" : "pointer",
                }}
              >
                <ChevronDown
                  size={13}
                  style={{
                    transform: showAdvanced ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
                Advanced validation
              </button>
              {showAdvanced && (
                <div
                  className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
                  style={{ animation: "expandIn 0.2s ease both" }}
                >
                  <input
                    value={field.validation?.pattern || ""}
                    readOnly={readOnly}
                    onChange={(e) => {
                      if (readOnly) return;
                      onUpdate({
                        validation: {
                          ...field.validation,
                          pattern: e.target.value,
                        },
                      });
                    }}
                    placeholder="Regex pattern (optional)"
                    className="rounded-lg px-3 py-2 font-mono text-xs outline-none"
                    style={{
                      background: t.surfaceAlt,
                      border: `1px solid ${t.border}`,
                      color: t.text,
                      opacity: readOnly ? 0.7 : 1,
                      cursor: readOnly ? "not-allowed" : "text",
                    }}
                  />
                  <input
                    value={field.validation?.errorMessage || ""}
                    readOnly={readOnly}
                    onChange={(e) => {
                      if (readOnly) return;
                      onUpdate({
                        validation: {
                          ...field.validation,
                          errorMessage: e.target.value,
                        },
                      });
                    }}
                    placeholder="Custom error message"
                    className="rounded-lg px-3 py-2 text-xs outline-none"
                    style={{
                      background: t.surfaceAlt,
                      border: `1px solid ${t.border}`,
                      color: t.text,
                      opacity: readOnly ? 0.7 : 1,
                      cursor: readOnly ? "not-allowed" : "text",
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {/* Footer actions */}
          <div
            className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"
            style={{ borderColor: t.border }}
          >
            <div className="flex items-center gap-1">
              <button
                onClick={() => onMove(-1)}
                disabled={index === 0 || readOnly}
                className="rounded-md p-1.5 disabled:opacity-25"
                style={{
                  color: t.textMuted,
                  cursor: index === 0 || readOnly ? "not-allowed" : "pointer",
                }}
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => onMove(1)}
                disabled={index === total - 1 || readOnly}
                className="rounded-md p-1.5 disabled:opacity-25"
                style={{
                  color: t.textMuted,
                  cursor:
                    index === total - 1 || readOnly ? "not-allowed" : "pointer",
                }}
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={onDuplicate}
                disabled={readOnly}
                className="ml-1 rounded-md p-1.5 hover:opacity-70 disabled:opacity-25"
                style={{
                  color: t.textMuted,
                  cursor: readOnly ? "not-allowed" : "pointer",
                }}
                title={readOnly ? "Read-only field" : "Duplicate"}
              >
                <Copy size={16} />
              </button>
              <button
                onClick={onDelete}
                disabled={locked || readOnly}
                className="rounded-md p-1.5 disabled:opacity-25"
                style={{
                  color: locked || readOnly ? t.textMuted : t.danger,
                  cursor: locked || readOnly ? "not-allowed" : "pointer",
                }}
                title={
                  locked
                    ? "Can't delete — form has submissions"
                    : readOnly
                      ? "Read-only field"
                      : "Delete"
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
            {!isSection && (
              <label
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: t.text }}
              >
                Required
                <MinistryToggle
                  checked={field.required}
                  onChange={(v) => onUpdate({ required: v })}
                  disabled={readOnly}
                  t={t}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MinistryToggle({
  checked,
  onChange,
  disabled,
  t,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  t: MinistryTheme;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed"
      style={{
        background: checked ? t.accent : t.borderStrong,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{
          transform: checked ? "translateX(22px)" : "translateX(4px)",
        }}
      />
    </button>
  );
}
