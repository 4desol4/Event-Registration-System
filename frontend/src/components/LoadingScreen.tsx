import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function LoadingScreen() {
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  useEffect(() => {
    // If loading takes more than 3s, reassure the person instead of leaving
    // them staring at a spinner wondering if it's broken.
    const timer = setTimeout(() => setShowSlowNotice(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 bg-white dark:bg-brand-dark-950">
      <div className="w-full max-w-sm space-y-4">
        <div className="h-8 w-2/3 rounded-lg shimmer-bg animate-shimmer" />
        <div className="h-4 w-full rounded-lg shimmer-bg animate-shimmer" />
        <div className="h-4 w-5/6 rounded-lg shimmer-bg animate-shimmer" />
        <div className="mt-6 space-y-3">
          <div className="h-12 w-full rounded-xl shimmer-bg animate-shimmer" />
          <div className="h-12 w-full rounded-xl shimmer-bg animate-shimmer" />
          <div className="h-12 w-full rounded-xl shimmer-bg animate-shimmer" />
        </div>
      </div>

      {showSlowNotice && (
        <div className="flex items-center gap-2 rounded-full border border-brand-lime-500/30 bg-brand-lime-500/10 px-4 py-2 text-sm text-brand-dark-600 dark:text-brand-lime-200 animate-fade-in">
          <WifiOff size={15} />
          Still connecting — try moving closer to the WiFi point
        </div>
      )}
    </div>
  );
}
