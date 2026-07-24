import {
  Type,
  Phone,
  Mail,
  Hash,
  ListChecks,
  CheckSquare,
  CircleHelp,
  AlignLeft,
  LucideIcon,
} from "lucide-react";
import { EventForm } from "../lib/types";

const iconForType: Record<string, LucideIcon> = {
  text: Type,
  phone: Phone,
  email: Mail,
  number: Hash,
  select: ListChecks,
  radio: ListChecks,
  checkbox: CheckSquare,
  yes_no: CircleHelp,
  paragraph: AlignLeft,
};

export function PreviewPane({ form }: { form: EventForm }) {
  return (
    <div className="rounded-2xl border border-brand-dark-100 dark:border-brand-dark-700 bg-brand-dark-50/50 dark:bg-brand-dark-950 p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-dark-400">
        Live Preview — what attendees will see
      </p>
      <div className="rounded-2xl bg-white dark:bg-brand-dark-900 p-5 shadow-sm">
        {form.bannerImageUrl && (
          <img
            src={form.bannerImageUrl}
            alt=""
            className="mb-4 h-32 w-full rounded-xl object-cover"
          />
        )}
        <h2 className="text-xl font-bold text-brand-dark-900 dark:text-brand-lime-50">
          {form.title}
        </h2>
        {form.description && (
          <p className="mt-1 text-sm text-brand-dark-400">{form.description}</p>
        )}

        <div className="mt-5 space-y-4">
          {form.fields.length === 0 && (
            <p className="py-8 text-center text-sm text-brand-dark-300">
              Add fields to see them appear here
            </p>
          )}
          {form.fields.map((field) => {
            if (field.type === "section_header") {
              return (
                <div key={field.id} className="pt-1">
                  <h3 className="text-base font-semibold text-brand-dark-900 dark:text-brand-lime-100">
                    {field.label}
                  </h3>
                  <div className="mt-1.5 h-px w-full bg-brand-lime-500/30" />
                </div>
              );
            }
            const Icon = iconForType[field.type] ?? Type;
            return (
              <div key={field.id}>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-brand-dark-600 dark:text-brand-lime-200">
                  <Icon size={13} className="text-brand-lime-600" />
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === "checkbox" ? (
                  <div className="space-y-2">
                    {(field.options?.length
                      ? field.options
                      : [field.label]
                    ).map((option) => (
                      <div
                        key={option}
                        className="flex items-center gap-2 text-xs text-brand-dark-500"
                      >
                        <span className="h-5 w-5 rounded-md border border-brand-dark-200 dark:border-brand-dark-600" />
                        {option}
                      </div>
                    ))}
                  </div>
                ) : field.type === "yes_no" ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="rounded-full border border-brand-dark-100 px-3 py-1 text-xs text-brand-dark-500 dark:border-brand-dark-700 dark:text-brand-dark-300">
                        Yes
                      </span>
                      <span className="rounded-full border border-brand-dark-100 px-3 py-1 text-xs text-brand-dark-500 dark:border-brand-dark-700 dark:text-brand-dark-300">
                        No
                      </span>
                    </div>
                    {(field.options ?? ["Name", "Class"]).map((opt) => (
                      <div
                        key={opt}
                        className="h-9 rounded-lg border border-brand-dark-100 dark:border-brand-dark-700"
                      />
                    ))}
                  </div>
                ) : field.type === "select" || field.type === "radio" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(field.options ?? []).map((opt) => (
                      <span
                        key={opt}
                        className="rounded-full border border-brand-dark-100 dark:border-brand-dark-700 px-3 py-1 text-xs text-brand-dark-400"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                ) : field.type === "paragraph" ? (
                  <div className="h-20 rounded-lg border border-brand-dark-100 dark:border-brand-dark-700" />
                ) : (
                  <div className="h-9 rounded-lg border border-brand-dark-100 dark:border-brand-dark-700" />
                )}
              </div>
            );
          })}
          {form.fields.length > 0 && (
            <div className="mt-4 rounded-lg bg-brand-lime-500 py-2.5 text-center text-sm font-semibold text-brand-dark-950 opacity-90">
              Complete Registration
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
