import { X, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { EventForm } from "../lib/types";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  form: EventForm;
}

function renderFieldPreview(field: EventForm["fields"][number]) {
  if (field.type === "section_header") {
    return (
      <div className="rounded-2xl border border-brand-dark-100 dark:border-brand-dark-700 bg-brand-dark-50 dark:bg-brand-dark-950 p-4">
        <h3 className="text-lg font-semibold text-brand-dark-900 dark:text-brand-lime-50">
          {field.label}
        </h3>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-900 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-dark-900 dark:text-brand-lime-50">
            {field.label}
          </p>
          <p className="text-xs text-brand-dark-400 dark:text-brand-dark-300">
            {field.required ? "Required" : "Optional"}
          </p>
        </div>
        <span className="rounded-full bg-brand-lime-500/15 px-3 py-1 text-xs font-semibold text-brand-lime-700 dark:text-brand-lime-300">
          {field.type.replace("_", " ")}
        </span>
      </div>

      {field.type === "checkbox" ? (
        <div className="space-y-3">
          {(field.options?.length ? field.options : [field.label]).map(
            (option) => (
              <div
                key={option}
                className="flex items-center gap-3 text-sm text-brand-dark-600 dark:text-brand-dark-300"
              >
                <span className="h-5 w-5 rounded border border-brand-dark-300 bg-white dark:bg-brand-dark-950" />
                {option}
              </div>
            ),
          )}
        </div>
      ) : field.type === "yes_no" ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <span className="rounded-full bg-brand-lime-500/15 px-3 py-1 text-xs font-semibold text-brand-lime-700 dark:text-brand-lime-300">
              Yes
            </span>
            <span className="rounded-full bg-brand-dark-50 px-3 py-1 text-xs font-semibold text-brand-dark-600 dark:bg-brand-dark-950 dark:text-brand-dark-300">
              No
            </span>
          </div>
          <div className="space-y-2">
            {(field.options?.length ? field.options : ["Name", "Class"]).map(
              (option) => (
                <div
                  key={option}
                  className="rounded-2xl border border-brand-dark-100 bg-brand-dark-50 px-3 py-2 text-sm text-brand-dark-700 dark:border-brand-dark-700 dark:bg-brand-dark-950 dark:text-brand-lime-100"
                >
                  {option}
                </div>
              ),
            )}
          </div>
        </div>
      ) : field.type === "paragraph" ? (
        <div className="min-h-28 rounded-2xl border border-brand-dark-100 bg-brand-dark-50 p-4 text-sm text-brand-dark-500 dark:border-brand-dark-700 dark:bg-brand-dark-950 dark:text-brand-dark-300">
          Type your answer here
        </div>
      ) : field.type === "select" || field.type === "radio" ? (
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => (
            <div
              key={opt}
              className="rounded-2xl border border-brand-dark-100 bg-brand-dark-50 px-3 py-2 text-sm text-brand-dark-700 dark:border-brand-dark-700 dark:bg-brand-dark-950 dark:text-brand-lime-100"
            >
              {opt}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-brand-dark-100 bg-brand-dark-50 p-4 text-sm text-brand-dark-500 dark:border-brand-dark-700 dark:bg-brand-dark-950 dark:text-brand-dark-300">
          {field.type === "phone"
            ? "+234 801 234 5678"
            : "Type your answer here"}
        </div>
      )}
    </div>
  );
}

export function FormPreviewModal({ open, onClose, form }: Props) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // reset image error when banner URL changes
    setImgError(false);
  }, [form.bannerImageUrl]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Preview registration form"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-950 shadow-lg shadow-brand-lime-500/10">
          {form.bannerImageUrl && !imgError ? (
            <img
              src={form.bannerImageUrl}
              alt="Form banner"
              className="h-64 w-full object-cover"
              onError={() => setImgError(true)}
              onLoad={() => setImgError(false)}
            />
          ) : (
            <div className="flex h-64 items-center justify-center bg-gradient-to-r from-brand-lime-200 to-brand-lime-100 text-brand-dark-700 dark:from-brand-dark-800 dark:to-brand-dark-900 dark:text-brand-lime-100">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-dark-500 dark:text-brand-dark-300">
                  Registration preview
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  Sample banner area
                </p>
                {imgError && (
                  <p className="mt-1 text-xs text-red-500">
                    Could not load image
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 p-6 sm:p-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-brand-dark-900 dark:text-brand-lime-50">
                {form.title}
              </h2>
              {form.description && (
                <p className="max-w-2xl text-sm leading-6 text-brand-dark-500 dark:text-brand-dark-300">
                  {form.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {form.fields.map((field) => (
                <div key={field.id}>{renderFieldPreview(field)}</div>
              ))}
            </div>

            <button
              type="button"
              className="w-full rounded-3xl bg-brand-lime-500 px-6 py-3 text-base font-semibold text-brand-dark-950 transition hover:bg-brand-lime-400"
            >
              <Eye size={18} className="inline-block align-middle" />
              <span className="ml-2 align-middle">Ready to publish</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
