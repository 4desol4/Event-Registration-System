import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";
import { getEvents } from "../lib/api";
import { MinistryEvent } from "../lib/types";
import staffHero from "../assets/IT (1).jpg";

export function StaffDashboardPage() {
  const [events, setEvents] = useState<MinistryEvent[]>([]);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-dark-900/90 p-6 text-white shadow-2xl shadow-brand-dark-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_28%)]" />
        <div className="absolute left-4 top-4 h-20 w-20 rounded-full bg-brand-lime-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-lime-200/70">
              Staff Access
            </p>
            <h1 className="mt-3 text-3xl  tracking-tight">On-site Support</h1>
            <p className="mt-2 max-w-2xl text-sm text-brand-lime-100/80">
              Quickly join live events and support registrations without
              administrative controls.
            </p>
          </div>
          <div className="hidden h-32 w-32 overflow-hidden rounded-[1.75rem] border border-white/10 shadow-lg lg:block">
            <img
              src={staffHero}
              alt="staff"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {events.map((e, i) => (
          <Link
            key={e.id}
            to={`/events/${e.id}`}
            className="group flex items-center justify-between gap-4 rounded-[1.75rem] border border-brand-dark-800 bg-white/95 p-4 text-brand-dark-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-brand-dark-700 dark:bg-brand-dark-950 dark:text-brand-lime-50"
            style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-lime-500/10 ring-1 ring-brand-lime-500/20">
                <CalendarDays className="text-brand-lime-600" />
              </div>
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-brand-dark-500 dark:text-brand-dark-400">
                  {new Date(e.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <ChevronRight className="text-brand-dark-400 transition-all group-hover:text-brand-lime-600 dark:text-brand-dark-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
