import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { resetSocket } from "../lib/socket";
import { ThemeToggle } from "../components/ThemeToggle";

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const logged = await login(email, password);
      resetSocket(); // pick up the new token on the next socket connection
      // If a redirect origin was provided (user attempted to access a page), honor it.
      if (from && from !== "/") {
        navigate(from, { replace: true });
        return;
      }
      // Otherwise redirect based on role
      const role = (logged?.role as string) || "";
      if (role === "STAFF") navigate("/staff-dashboard", { replace: true });
      else if (role === "SUPER_ADMIN")
        navigate("/super-admin", { replace: true });
      else navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-brand-dark-950 px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lime-500">
            <GraduationCap size={26} className="text-brand-dark-950" />
          </div>
          <div>
            <h1 className="text-xl  text-brand-dark-900 dark:text-brand-lime-50">
              ICT Unit Admin
            </h1>
            <p className="text-sm text-brand-dark-400">
              Event Registration System
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 animate-slide-up"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Email
            </label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-brand-lime-500/60"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-brand-lime-500/60"
              required
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
              <AlertCircle size={14} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-brand-lime-500 px-4 py-3 text-sm font-semibold text-brand-dark-950 shadow-lg shadow-brand-lime-500/20 transition-all hover:bg-brand-lime-400 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-brand-dark-400">
          Accounts are provisioned by a Super Admin. Contact your ICT unit lead
          for access.
        </p>
      </div>
    </div>
  );
}
