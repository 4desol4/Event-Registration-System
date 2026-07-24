import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LayoutTemplate,
  GraduationCap,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Users,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSubmissions = location.pathname.includes("/submissions");
  // Hide navbar only on the standalone form builder page
  const isFormBuilder = /^\/forms\/[^/]+$/.test(location.pathname);
  const { logout, user } = useAuth();

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth >= 640 : true,
  );

  const role = user?.role;

  // Build role-specific sidebar nav so users only see permitted dashboards
  let navItems = [{ to: "/", label: "Events", icon: CalendarDays, end: true }];

  if (role === "STAFF") {
    // Staff: quick access to staff dashboard first
    navItems = [
      {
        to: "/staff-dashboard",
        label: "Staff",
        icon: GraduationCap,
        end: false,
      },
      { to: "/", label: "Events", icon: CalendarDays, end: true },
    ];
  } else if (role === "ADMIN") {
    // Admin: dashboard first, then templates and events
    navItems = [
      { to: "/admin", label: "Admin", icon: Users, end: false },
      {
        to: "/templates",
        label: "Templates",
        icon: LayoutTemplate,
        end: false,
      },
      { to: "/", label: "Events", icon: CalendarDays, end: true },
    ];
  } else if (role === "SUPER_ADMIN") {
    // Super Admin: surface Control first, then management links. Do NOT show the Admin dashboard here.
    navItems = [
      { to: "/super-admin", label: "Control", icon: ShieldCheck, end: false },
      { to: "/staff", label: "Staff Accounts", icon: Users, end: false },
      { to: "/", label: "Events", icon: CalendarDays, end: true },
      {
        to: "/templates",
        label: "Templates",
        icon: LayoutTemplate,
        end: false,
      },
    ];
  } else {
    // Guest / unknown role: show basic templates as well
    navItems.push({
      to: "/templates",
      label: "Templates",
      icon: LayoutTemplate,
      end: false,
    });
  }

  useEffect(() => {
    if (isFormBuilder) setSidebarOpen(false);
  }, [isFormBuilder]);

  useEffect(() => {
    function handleResize() {
      const small = window.innerWidth < 640;
      setIsMobile(small);
      // when switching to mobile default to closed; when switching to desktop default open
      setSidebarOpen((prev) => (small ? false : true));
    }
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
    return;
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark-950">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed left-0 top-0 h-screen transition-all duration-300 ease-out
            ${sidebarOpen ? (isMobile ? "translate-x-0 w-20 z-50" : "translate-x-0 w-72 z-40") : "-translate-x-full"}
            flex flex-col border-r border-brand-dark-100 dark:border-brand-dark-800 
            bg-white dark:bg-brand-dark-900 shadow-lg sm:shadow-none
          `}
        >
          {/* Logo Section */}
          <div className="flex items-center justify-between gap-2 border-b border-brand-dark-100 dark:border-brand-dark-800 px-4 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-lime-400 to-brand-lime-600 shadow-md">
                <GraduationCap
                  size={20}
                  className="text-brand-dark-950 font-bold"
                />
              </div>
              {sidebarOpen && !isMobile && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-brand-dark-900 dark:text-brand-lime-50 uppercase tracking-wider">
                    ICT Unit
                  </p>
                  <p className="text-xs text-brand-dark-400 dark:text-brand-dark-400 truncate">
                    Event Portal
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="hidden sm:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-dark-50 text-brand-dark-600 transition hover:bg-brand-dark-100 dark:bg-brand-dark-800 dark:text-brand-dark-300 dark:hover:bg-brand-dark-700"
              title={sidebarOpen ? "Collapse" : "Open"}
            >
              {sidebarOpen ? <X size={16} /> : <ChevronRight size={16} />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg text-brand-dark-600 dark:text-brand-dark-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300 shadow-sm"
                      : "text-brand-dark-500 dark:text-brand-dark-300 hover:bg-brand-dark-50 dark:hover:bg-brand-dark-800"
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && !isMobile && (
                  <span className="truncate">{label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-brand-dark-100 dark:border-brand-dark-800 px-3 py-4 space-y-3">
            {sidebarOpen && !isMobile && user && (
              <div className="px-1">
                <p className="text-xs font-medium text-brand-dark-400 dark:text-brand-dark-400 uppercase tracking-wide">
                  Account
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-brand-dark-900 dark:text-brand-lime-50">
                  {user?.name || user?.email}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-brand-dark-50 to-brand-dark-100 px-3 py-2.5 text-sm font-semibold text-brand-dark-700 transition hover:from-brand-dark-100 hover:to-brand-dark-200 dark:from-brand-dark-950 dark:to-brand-dark-900 dark:text-brand-dark-200 dark:hover:from-brand-dark-800 dark:hover:to-brand-dark-800"
            >
              <LogOut size={16} className="flex-shrink-0" />
              {sidebarOpen && !isMobile && "Log out"}
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${sidebarOpen && !isMobile ? "sm:ml-72" : ""}`}
        >
          {/* Header - show on all pages; include mobile menu for form builder */}
          <header className="flex items-center justify-between border-b border-brand-dark-100 dark:border-brand-dark-800 bg-white dark:bg-brand-dark-900 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              {!(sidebarOpen && !isMobile) && (
                <button
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-dark-50 text-brand-dark-600 transition hover:bg-brand-dark-100 dark:bg-brand-dark-800 dark:text-brand-dark-200 dark:hover:bg-brand-dark-700"
                >
                  <Menu size={20} />
                </button>
              )}
              {!isFormBuilder ? (
                isSubmissions ? (
                  <button
                    onClick={() => navigate(-1)}
                    className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium bg-brand-dark-50 dark:bg-brand-dark-800 text-brand-dark-700 dark:text-brand-lime-100 transition hover:bg-brand-dark-100 dark:hover:bg-brand-dark-700"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                ) : (
                  <div className="rounded-lg bg-gradient-to-r from-brand-lime-400 via-brand-lime-500 to-brand-lime-600 px-3.5 py-1.5 text-xs font-bold text-brand-dark-950 shadow-lg shadow-brand-lime-500/20 uppercase tracking-wide">
                    Ministry Registration
                  </div>
                )
              ) : (
                <div className="text-sm font-semibold">Form builder</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {isFormBuilder ? (
              // Full-screen form builder with sidebar only
              <Outlet />
            ) : (
              // Regular layout with navbar
              <div className="px-4 py-6 sm:px-6 sm:py-8">
                <Outlet />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
