import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "user";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "expenseflow.auth";

// Demo: any email containing "admin" gets the admin role.
function deriveRole(email: string): Role {
  return /admin/i.test(email) ? "admin" : "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        // Backfill role for older stored sessions
        if (parsed.user && !parsed.user.role) parsed.user.role = deriveRole(parsed.user.email);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch {}
    setLoading(false);
  }, []);

  const persist = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
  };

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const u: User = { id: "u_1", name: email.split("@")[0] || "User", email, role: deriveRole(email) };
    persist(u, "mock.jwt.token");
  };

  const register = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const u: User = { id: "u_1", name, email, role: deriveRole(email) };
    persist(u, "mock.jwt.token");
  };

  const forgotPassword = async (_email: string) => {
    await new Promise((r) => setTimeout(r, 600));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
