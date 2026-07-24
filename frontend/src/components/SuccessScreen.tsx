import { CheckCircle2 } from "lucide-react";

export function SuccessScreen({ eventTitle }: { eventTitle: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center bg-white dark:bg-brand-dark-950">
      <div className="relative flex items-center justify-center">
        <span className="absolute h-20 w-20 rounded-full bg-brand-lime-500/40 animate-pulse-ring" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-lime-500 animate-check-pop">
          <CheckCircle2 size={40} className="text-white" strokeWidth={2.2} />
        </div>
      </div>

      <div className="animate-slide-up stagger-2 opacity-0" style={{ animationFillMode: "forwards" }}>
        <h1 className="text-2xl font-bold text-brand-dark-900 dark:text-brand-lime-50">
          You're registered!
        </h1>
        <p className="mt-2 max-w-xs text-brand-dark-500 dark:text-brand-dark-300">
          Thank you for registering for <span className="font-medium">{eventTitle}</span>. Please proceed to the hall.
        </p>
      </div>
    </div>
  );
}
