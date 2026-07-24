import { useEffect, useState } from "react";
import { UserPlus, Circle, ShieldOff, ShieldCheck } from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  AdminUser,
  ApiRequestError,
} from "../lib/api";
import { Modal } from "../components/Modal";

const roleStyles: Record<string, string> = {
  SUPER_ADMIN:
    "bg-brand-lime-500/15 text-brand-lime-700 dark:text-brand-lime-300",
  ADMIN: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  STAFF:
    "bg-brand-dark-100 text-brand-dark-500 dark:bg-brand-dark-800 dark:text-brand-dark-300",
};

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as "ADMIN" | "STAFF",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    getUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createUser(form);
      setModalOpen(false);
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      load();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not create account",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: AdminUser) {
    await updateUser(user.id, { isActive: !user.isActive });
    load();
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="mb-6 rounded-3xl border border-brand-dark-100 bg-white dark:border-brand-dark-800 dark:bg-brand-dark-950 p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl  text-brand-dark-900 dark:text-brand-lime-50">
              Staff Accounts
            </h1>
            <p className="mt-1 text-sm text-brand-dark-400 dark:text-brand-dark-400">
              Provision and manage ICT unit access
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 shadow-md shadow-brand-lime-500/20 transition-all hover:bg-brand-lime-400 active:scale-95"
          >
            <UserPlus size={17} />
            New Account
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-brand-dark-50 dark:bg-brand-dark-900 shimmer-bg animate-shimmer"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center justify-between rounded-2xl border border-brand-dark-100 bg-white p-4 transition-shadow hover:shadow-md dark:border-brand-dark-800 dark:bg-brand-dark-900 animate-slide-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
                style={{ animationFillMode: "forwards" }}
              >
                <div>
                  <p className="font-medium text-brand-dark-900 dark:text-brand-lime-50">
                    {u.name}
                  </p>
                  <p className="text-xs text-brand-dark-400 dark:text-brand-dark-400">
                    {u.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[u.role]}`}
                  >
                    {u.role.replace("_", " ")}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs ${u.isActive ? "text-brand-lime-600" : "text-brand-dark-400 dark:text-brand-dark-400"}`}
                  >
                    <Circle size={6} className="fill-current" />
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                  {u.role !== "SUPER_ADMIN" && (
                    <button
                      onClick={() => toggleActive(u)}
                      className="rounded-lg p-1.5 text-brand-dark-400 transition-colors hover:bg-brand-dark-50 dark:hover:bg-brand-dark-800"
                      title={
                        u.isActive ? "Disable account" : "Reactivate account"
                      }
                    >
                      {u.isActive ? (
                        <ShieldOff size={15} />
                      ) : (
                        <ShieldCheck size={15} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Account"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-xl border border-brand-dark-100 bg-white px-4 py-2.5 text-brand-dark-900 outline-none transition focus:border-brand-lime-400 focus:ring-2 focus:ring-brand-lime-500/20 dark:border-brand-dark-700 dark:bg-brand-dark-800 dark:text-brand-lime-50"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full rounded-xl border border-brand-dark-100 bg-white px-4 py-2.5 text-brand-dark-900 outline-none transition focus:border-brand-lime-400 focus:ring-2 focus:ring-brand-lime-500/20 dark:border-brand-dark-700 dark:bg-brand-dark-800 dark:text-brand-lime-50"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Temporary Password
            </label>
            <input
              type="text"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-brand-dark-100 bg-white px-4 py-2.5 text-brand-dark-900 outline-none transition focus:border-brand-lime-400 focus:ring-2 focus:ring-brand-lime-500/20 dark:border-brand-dark-700 dark:bg-brand-dark-800 dark:text-brand-lime-50"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-brand-dark-700 dark:text-brand-lime-200">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as "ADMIN" | "STAFF",
                }))
              }
              className="w-full rounded-xl border border-brand-dark-100 bg-white px-4 py-2.5 text-brand-dark-900 outline-none transition focus:border-brand-lime-400 focus:ring-2 focus:ring-brand-lime-500/20 dark:border-brand-dark-700 dark:bg-brand-dark-800 dark:text-brand-lime-50"
            >
              <option value="STAFF">
                Staff — view & assist registration only
              </option>
              <option value="ADMIN">
                Admin — full event & form management
              </option>
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-lime-500 px-4 py-2.5 text-sm font-semibold text-brand-dark-950 transition-all hover:bg-brand-lime-400 active:scale-95 disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Account"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
