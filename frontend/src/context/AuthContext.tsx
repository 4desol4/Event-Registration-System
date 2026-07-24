import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export type Role = "SUPER_ADMIN" | "ADMIN" | "STAFF";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("authToken"),
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify the stored token is still valid on app load, rather than
    // trusting it blindly — it may have expired since the last visit.
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid session");
        return res.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email: string, password: string): Promise<AuthUser> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => undefined);
      throw new Error(body?.message || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("authToken", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user as AuthUser;
  }

  function logout() {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
