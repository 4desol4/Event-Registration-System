import { useEffect, useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { getTemplates } from "../lib/api";
import { EventForm } from "../lib/types";

export function TemplateLibraryPage() {
  const [templates, setTemplates] = useState<EventForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="mb-1 text-2xl  text-brand-dark-900 dark:text-brand-lime-50">
        Template Library
      </h1>
      <p className="mb-6 text-sm text-brand-dark-400">
        Reusable form structures — apply these when creating a new event's form
      </p>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl shimmer-bg animate-shimmer"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-brand-dark-200 dark:border-brand-dark-700 py-16 text-center animate-slide-up">
          <LayoutTemplate
            size={32}
            className="text-brand-dark-300 dark:text-brand-dark-600"
          />
          <p className="text-brand-dark-500 dark:text-brand-dark-300">
            No templates saved yet
          </p>
          <p className="max-w-xs text-xs text-brand-dark-400">
            Open any form in the builder and use "Save as Template" to add one
            here
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t, i) => (
            <div
              key={t.id}
              className={`rounded-2xl border border-brand-dark-100 dark:border-brand-dark-800 bg-white dark:bg-brand-dark-900 p-4 animate-slide-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
              style={{ animationFillMode: "forwards" }}
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-lime-500/10">
                <LayoutTemplate
                  size={16}
                  className="text-brand-lime-600 dark:text-brand-lime-400"
                />
              </div>
              <p className="font-medium text-brand-dark-900 dark:text-brand-lime-50">
                {t.templateName || t.title}
              </p>
              <p className="mt-1 text-xs text-brand-dark-400">
                {t.fields.length} fields
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
