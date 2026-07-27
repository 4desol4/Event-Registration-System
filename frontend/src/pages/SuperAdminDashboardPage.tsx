import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, BarChart2, ShieldCheck } from "lucide-react";
import { getEvents, getUsers } from "../lib/api";
import { MinistryEvent } from "../lib/types";
import superAdminHero from "../assets/IT (6).jpg";

export function SuperAdminDashboardPage() {
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
    <div className="animate-fade-in">
      <div className="relative mb-6 overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-dark-900/10">
        <img
          src={superAdminHero}
          alt="super admin control"
          className="w-full h-40 sm:h-56 md:h-72 lg:h-[320px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/10 to-brand-lime-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_35%)]" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
          <div>
            <p className="inline-flex rounded-full bg-brand-lime-400/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-brand-lime-100 shadow-sm">
              Super Admin
            </p>
            <h1 className="mt-4 text-4xl  tracking-tight drop-shadow-lg">
              Control Center
            </h1>
            <p className="mt-3 max-w-2xl text-base text-brand-lime-100/90 sm:text-lg">
              Oversee platform access, monitor event activity, and keep the
              registration system running smoothly from a single control hub.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl transition-all hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-lime-200">
                Platform accounts
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {usersCount ?? "—"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl transition-all hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-lime-200">
                Active events
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {events.length}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl transition-all hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-lime-200">
                System status
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">Live</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-brand-dark-100 bg-white p-6 dark:border-brand-dark-800 dark:bg-brand-dark-900 shadow-sm transform transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-lime-500/10 p-3">
              <Users className="text-brand-lime-600" />
            </div>
            <div>
              <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
                Platform Accounts
              </p>
              <div className="mt-1 text-2xl font-bold text-brand-dark-900 dark:text-brand-lime-50">
                {usersCount ?? "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-dark-100 bg-white p-6 dark:border-brand-dark-800 dark:bg-brand-dark-900 shadow-sm transform transition-transform hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
              <BarChart2 className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
                Active Events
              </p>
              <div className="mt-1 text-2xl font-bold text-brand-dark-900 dark:text-brand-lime-50">
                {events.length}
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/staff"
          className="rounded-2xl border border-brand-dark-100 bg-white p-6 dark:border-brand-dark-800 dark:bg-brand-dark-900 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
              Account Access
            </p>
            <div className="mt-1 text-lg font-medium text-brand-dark-900 dark:text-brand-lime-50">
              Open staff and admin management
            </div>
          </div>
          <FileText />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-brand-dark-100 bg-white p-4 dark:border-brand-dark-800 dark:bg-brand-dark-900">
          <h3 className="font-medium text-brand-dark-900 dark:text-brand-lime-50">
            Recent Activity
          </h3>
          <p className="mt-3 text-sm text-brand-dark-500 dark:text-brand-dark-300">
            Review the latest platform activity and user actions to keep
            operations transparent and secure.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-dark-100 bg-white p-4 dark:border-brand-dark-800 dark:bg-brand-dark-900">
          <h3 className="font-medium text-brand-dark-900 dark:text-brand-lime-50">
            Platform Administration
          </h3>
          <p className="mt-3 text-sm text-brand-dark-500 dark:text-brand-dark-300">
            Use this space for maintenance tasks, data exports, and broader
            system administration needs.
          </p>
        </div>
      </div>

      {/* Capabilities + Illustration */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 items-start">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-brand-dark-900 dark:text-brand-lime-50">
            Super Admin Responsibilities
          </h2>
          <p className="text-sm text-brand-dark-500 dark:text-brand-dark-300">
            Full platform oversight is arranged here so you can manage access,
            review activity, and support event operations efficiently.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-brand-dark-100 bg-white p-4 dark:border-brand-dark-800 dark:bg-brand-dark-900 shadow hover:scale-[1.02] transition-transform">
              <div className="rounded-lg bg-brand-lime-500/10 p-3">
                <Users className="text-brand-lime-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark-900 dark:text-brand-lime-50">
                  Manage Access
                </p>
                <p className="text-xs text-brand-dark-500 dark:text-brand-dark-300">
                  Create, activate, deactivate, and assign roles to staff and
                  administrators.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-dark-100 bg-white p-4 dark:border-brand-dark-800 dark:bg-brand-dark-900 shadow hover:scale-[1.02] transition-transform">
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
                <FileText className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark-900 dark:text-brand-lime-50">
                  Review Activity
                </p>
                <p className="text-xs text-brand-dark-500 dark:text-brand-dark-300">
                  Inspect system and user activity logs for compliance,
                  auditing, and troubleshooting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-brand-dark-100 bg-white p-4 dark:border-brand-dark-800 dark:bg-brand-dark-900 shadow hover:scale-[1.02] transition-transform">
              <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <BarChart2 className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-dark-900 dark:text-brand-lime-50">
                  Platform Overview
                </p>
                <p className="text-xs text-brand-dark-500 dark:text-brand-dark-300">
                  Keep track of live events, active users, and platform health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
