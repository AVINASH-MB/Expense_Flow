import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { apiEnabled, API_BASE, refreshAccessToken } from "@/lib/api";
import { AuthAPI } from "@/lib/api-services";

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

function deriveRole(email: string): Role {
  return /admin/i.test(email) ? "admin" : "user";
}

function decodeJwtExp(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleProactiveRefresh = (t: string | null) => {
    if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; }
    if (!apiEnabled() || !t) return;
    const exp = decodeJwtExp(t);
    if (!exp) return;
    const ms = Math.max(5_000, exp - Date.now() - 60_000);
    refreshTimer.current = setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) {
        setToken(newToken);
        scheduleProactiveRefresh(newToken);
      }
    }, ms);
  };

  useEffect(() => {
    (async () => {
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.user && !parsed.user.role) parsed.user.role = deriveRole(parsed.user.email);
          setUser(parsed.user);
          setToken(parsed.token);

          if (apiEnabled() && parsed.token) {
            try {
              const me = await AuthAPI.me();
              setUser(me);
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: me, token: parsed.token }));
              scheduleProactiveRefresh(parsed.token);
            } catch {
              // try silent refresh before giving up
              const newToken = await refreshAccessToken();
              if (newToken) {
                try {
                  const me = await AuthAPI.me();
                  setUser(me);
                  setToken(newToken);
                  scheduleProactiveRefresh(newToken);
                } catch {
                  window.localStorage.removeItem(STORAGE_KEY);
                  setUser(null); setToken(null);
                }
              } else {
                window.localStorage.removeItem(STORAGE_KEY);
                setUser(null); setToken(null);
              }
            }
          }
        } else if (apiEnabled()) {
          // No stored session, but maybe a refresh cookie exists from a previous tab
          const newToken = await refreshAccessToken();
          if (newToken) {
            try {
              const me = await AuthAPI.me();
              persist(me, newToken);
              scheduleProactiveRefresh(newToken);
            } catch {}
          }
        }
      } catch {}
      setLoading(false);
    })();
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u, token: t }));
    scheduleProactiveRefresh(t);
  };

  const login = async (email: string, password: string) => {
    if (apiEnabled()) {
      const { user, token } = await AuthAPI.login(email, password);
      persist(user, token);
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
    persist({ id: "u_1", name: email.split("@")[0] || "User", email, role: deriveRole(email) }, "mock.jwt.token");
  };

  const register = async (name: string, email: string, password: string) => {
    if (apiEnabled()) {
      const { user, token } = await AuthAPI.register(name, email, password);
      persist(user, token);
      return;
    }
    await new Promise((r) => setTimeout(r, 500));
    persist({ id: "u_1", name, email, role: deriveRole(email) }, "mock.jwt.token");
  };

  const forgotPassword = async (email: string) => {
    if (apiEnabled()) { await AuthAPI.forgot(email); return; }
    await new Promise((r) => setTimeout(r, 600));
  };

  const logout = () => {
    if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; }
    if (apiEnabled()) { AuthAPI.logout().catch(() => {}); }
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

export const _apiBase = API_BASE;
