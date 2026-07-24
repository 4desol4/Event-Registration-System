import { LucideIcon, CalendarX, ShieldAlert, WifiOff } from "lucide-react";

interface Props {
  variant: "closed" | "not_found" | "network";
  message?: string;
}

const config: Record<Props["variant"], { icon: LucideIcon; title: string; defaultMessage: string }> = {
  closed: {
    icon: CalendarX,
    title: "Registration closed",
    defaultMessage: "Registration for this event has ended. Please check with an event staff member.",
  },
  not_found: {
    icon: ShieldAlert,
    title: "Form not found",
    defaultMessage: "This registration link doesn't seem to be valid. Please check the QR code or link and try again.",
  },
  network: {
    icon: WifiOff,
    title: "Connection problem",
    defaultMessage: "We couldn't reach the registration server. Please check your connection and try again.",
  },
};

export function StatusScreen({ variant, message }: Props) {
  const { icon: Icon, title, defaultMessage } = config[variant];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center bg-white dark:bg-brand-dark-950 animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-dark-100 dark:bg-brand-dark-800">
        <Icon size={30} className="text-brand-dark-400 dark:text-brand-dark-300" />
      </div>
      <h1 className="text-xl font-semibold text-brand-dark-900 dark:text-brand-lime-50">{title}</h1>
      <p className="max-w-xs text-brand-dark-500 dark:text-brand-dark-300">{message || defaultMessage}</p>
    </div>
  );
}
