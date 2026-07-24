import { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";

export function LiveCounter({ count }: { count: number }) {
  const [displayCount, setDisplayCount] = useState(count);
  const prevCount = useRef(count);

  useEffect(() => {
    // Animate count changes with a quick tween rather than an instant jump —
    // makes each new registration feel noticed on the big screen staff glance at.
    if (count === prevCount.current) return;
    const start = prevCount.current;
    const end = count;
    const duration = 400;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayCount(Math.round(start + (end - start) * progress));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    prevCount.current = count;
  }, [count]);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-lime-500/30 bg-brand-lime-500/10 px-5 py-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-lime-500">
        <Users size={20} className="text-brand-dark-950" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-brand-dark-900 dark:text-brand-lime-50">
          {displayCount}
        </p>
        <p className="text-xs text-brand-dark-500 dark:text-brand-dark-300">Registered so far</p>
      </div>
    </div>
  );
}
