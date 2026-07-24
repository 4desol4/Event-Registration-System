import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import { getEvents } from "../lib/api";
import { getUsers } from "../lib/api";
import { MinistryEvent } from "../lib/types";
import adminHero from "../assets/IT (2).jpg";

export function AdminDashboardPage() {
  const [events, setEvents] = useState<MinistryEvent[]>([]);
  const [usersCount, setUsersCount] = useState<number | null>(null);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
    getUsers()
      .then((u) => setUsersCount(u.length))
      .catch(() => setUsersCount(null));
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-brand-lime-50/30 p-6 shadow-2xl shadow-brand-lime-400/10 dark:bg-brand-dark-900/80 dark:shadow-brand-dark-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_35%)]" />
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-lime-400/20 blur-3xl" />
        <div className="relative grid gap-4 md:grid-cols-[1.8fr_1fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-dark-500 dark:text-brand-lime-400">
              Admin Hub
            </p>
            <h1 className="mt-3 text-4xl  text-brand-dark-900 dark:text-brand-lime-50">
              Administrator Overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-brand-dark-600 dark:text-brand-dark-300">
              Quickly monitor active programs, staff activity, and event
              readiness with animated insight cards and fast links.
            </p>
          </div>
          <div className="hidden md:block rounded-3xl border border-brand-dark-100 bg-white/80 p-4 shadow-lg shadow-brand-dark-900/10 dark:border-brand-dark-700 dark:bg-brand-dark-950/80">
            <img
              src={adminHero}
              alt="admin illustration"
              className="h-40 w-full object-cover rounded-3xl"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="group rounded-[1.75rem] border border-brand-dark-100 bg-white p-6 shadow-lg transition-transform hover:-translate-y-1 dark:border-brand-dark-800 dark:bg-brand-dark-900">
          <p className="text-sm text-brand-dark-500 dark:text-brand-dark-400">
            Events
          </p>
          <p className="mt-4 text-4xl font-semibold text-brand-dark-900 dark:text-brand-lime-50">
            {events.length}
          </p>
          <p className="mt-2 text-xs text-brand-dark-400 dark:text-brand-dark-400">
            Live and scheduled programs visible to your unit.
          </p>
        </div>
        <div className="group rounded-[1.75rem] border border-brand-dark-100 bg-white p-6 shadow-lg transition-transform hover:-translate-y-1 dark:border-brand-dark-800 dark:bg-brand-dark-900">
          <p className="text-sm text-brand-dark-500 dark:text-brand-dark-400">
            Staff Accounts
          </p>
          <p className="mt-4 text-4xl font-semibold text-brand-dark-900 dark:text-brand-lime-50">
            {usersCount ?? "—"}
          </p>
          <p className="mt-2 text-xs text-brand-dark-400 dark:text-brand-dark-400">
            Active administrators and staff members.
          </p>
        </div>
        <Link
          to="/staff"
          className="group rounded-[1.75rem] border border-brand-dark-100 bg-white p-6 shadow-lg transition-transform hover:-translate-y-1 dark:border-brand-dark-800 dark:bg-brand-dark-900"
        >
          <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
            Staff Management
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-lg font-semibold text-brand-dark-900 dark:text-brand-lime-50">
              Open
            </span>
            <ChevronRight className="text-brand-dark-400" />
          </div>
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg  text-brand-dark-900 dark:text-brand-lime-50">
            Recent events
          </h2>
          <p className="text-sm text-brand-dark-500 dark:text-brand-dark-400">
            Latest programs needing review or support.
          </p>
        </div>
        <div className="mt-4 grid gap-3">
          {events.slice(0, 5).map((e, index) => (
            <Link
              key={e.id}
              to={`/events/${e.id}`}
              className="group flex items-center justify-between gap-4 rounded-[1.75rem] border border-brand-dark-100 bg-white p-4 text-brand-dark-900 transition-all hover:-translate-y-1 hover:border-brand-lime-400 hover:shadow-lg dark:border-brand-dark-800 dark:bg-brand-dark-900 dark:text-brand-lime-50"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="mt-1 text-xs text-brand-dark-500 dark:text-brand-dark-400">
                  {new Date(e.date).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="text-brand-dark-400 dark:text-brand-dark-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
