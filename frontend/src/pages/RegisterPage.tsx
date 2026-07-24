import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Wifi, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import {
  fetchFormBySlug,
  submitRegistration,
  ApiRequestError,
} from "../lib/api";
import { PublicForm } from "../lib/types";
import { generateUUID } from "../lib/uuid";
import { FieldRenderer } from "../components/FieldRenderer";
import { LoadingScreen } from "../components/LoadingScreen";
import { StatusScreen } from "../components/StatusScreen";
import { SuccessScreen } from "../components/SuccessScreen";
import { ThemeToggle } from "../components/ThemeToggle";

type PageState =
  | "loading"
  | "ready"
  | "submitting"
  | "success"
  | "closed"
  | "not_found"
  | "network_error";

export function RegisterPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [form, setForm] = useState<PublicForm | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // bots fill this; humans never see it

  // Generated once per page load — powers idempotency on the backend
  const submissionToken = useMemo(() => generateUUID(), []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    fetchFormBySlug(slug)
      .then((data) => {
        if (cancelled) return;
        setForm(data);
        setPageState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiRequestError) {
          if (err.status === 410) {
            setErrorMessage(err.message);
            setPageState("closed");
          } else if (err.status === 404 || err.status === 403) {
            setErrorMessage(err.message);
            setPageState("not_found");
          } else {
            setPageState("network_error");
          }
        } else {
          setPageState("network_error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  function validateClientSide(): boolean {
    if (!form) return false;
    const errors: Record<string, string> = {};

    for (const field of form.fields) {
      if (field.type === "section_header") continue;
      const value = values[field.id];
      const isYesNoAnswered =
        field.type === "yes_no" &&
        typeof value === "object" &&
        value !== null &&
        "enabled" in value;
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (field.type === "yes_no" && !isYesNoAnswered);

      if (field.required && isEmpty) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }
      if (!isEmpty && field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(String(value))) {
          errors[field.id] =
            field.validation.errorMessage || `${field.label} format is invalid`;
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    if (honeypot) return; // silently drop bot submissions

    if (!consentChecked) {
      setFieldErrors((prev) => ({
        ...prev,
        __consent: "Please confirm consent to continue",
      }));
      return;
    }
    if (!validateClientSide()) return;

    setPageState("submitting");
    try {
      await submitRegistration(form.id, submissionToken, values);
      setPageState("success");
    } catch (err) {
      if (
        err instanceof ApiRequestError &&
        err.body &&
        typeof err.body === "object" &&
        "details" in err.body &&
        Array.isArray((err.body as any).details)
      ) {
        const serverErrors: Record<string, string> = {};
        for (const d of (err.body as any).details) {
          if (d?.path && d?.message) {
            serverErrors[d.path] = d.message;
          }
        }
        setFieldErrors(serverErrors);
        setPageState("ready");
      } else {
        setErrorMessage(
          "Something went wrong submitting your registration. Please try again.",
        );
        setPageState("ready");
      }
    }
  }

  if (pageState === "loading") return <LoadingScreen />;
  if (pageState === "closed")
    return <StatusScreen variant="closed" message={errorMessage} />;
  if (pageState === "not_found")
    return <StatusScreen variant="not_found" message={errorMessage} />;
  if (pageState === "network_error") return <StatusScreen variant="network" />;
  if (pageState === "success" && form)
    return <SuccessScreen eventTitle={form.title} />;
  if (!form) return <StatusScreen variant="not_found" />;

  const isSubmitting = pageState === "submitting";

  const hotspotUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const typedLink = `${hotspotUrl}/go/${slug ?? ""}`.replace(/\/$/, "");

  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark-950">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-6 sm:py-10">
        <div className="mb-4 flex items-center justify-end">
          <ThemeToggle />
        </div>

        {form.bannerImageUrl && (
          <div className="mb-6 overflow-hidden rounded-2xl animate-scale-in">
            <img
              src={form.bannerImageUrl}
              alt=""
              className="h-40 w-full object-cover sm:h-48"
              loading="eager"
            />
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-brand-lime-200 bg-brand-lime-50/70 p-3 text-sm text-brand-dark-700 dark:border-brand-lime-900/40 dark:bg-brand-dark-800/70 dark:text-brand-lime-100">
          <div className="flex items-center gap-2 font-medium">
            <Wifi size={16} className="text-brand-lime-600" />
            If you are on a station PC, scan the station QR or open:
          </div>
          <div className="mt-2 break-all text-xs text-brand-dark-600 dark:text-brand-lime-200">
            {typedLink}
          </div>
        </div>

        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl  leading-tight text-brand-dark-900 dark:text-brand-lime-50 sm:text-3xl">
            {form.title}
          </h1>
          {form.description && (
            <p className="mt-2 text-sm text-brand-dark-500 dark:text-brand-dark-300">
              {form.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {form.fields.map((field, i) => (
            <div
              key={field.id}
              className={`animate-slide-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
              style={{ animationFillMode: "forwards" }}
            >
              <FieldRenderer
                field={field}
                value={values[field.id]}
                error={fieldErrors[field.id]}
                onChange={(v) =>
                  setValues((prev) => ({ ...prev, [field.id]: v }))
                }
              />
            </div>
          ))}

          {/* Honeypot — invisible to real people, catches basic bots */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="mt-1 rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-brand-lime-50/40 dark:bg-brand-dark-800/40 p-4 animate-slide-up">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-md accent-brand-lime-500 cursor-pointer"
              />
              <span className="flex items-start gap-1.5 text-xs text-brand-dark-500 dark:text-brand-dark-300">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 flex-shrink-0 text-brand-lime-600"
                />
                I consent to my information being collected and used by the
                Ministry of Education for this event's records, in accordance
                with the Nigeria Data Protection Act.
              </span>
            </label>
            {fieldErrors.__consent && (
              <p className="mt-1.5 pl-7 text-xs text-red-500">
                {fieldErrors.__consent}
              </p>
            )}
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand-lime-500 px-5 py-3.5
                       text-base font-semibold text-brand-dark-950 shadow-lg shadow-brand-lime-500/25
                       transition-all duration-200 hover:bg-brand-lime-400 hover:shadow-brand-lime-500/40
                       active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
