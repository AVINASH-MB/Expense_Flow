import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthAPI } from "@/services/endpoints";
import { clearAuth, readAuth, refreshAccessToken, writeAuth } from "@/services/api";
import type { User } from "@/types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (readAuth().user as User) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!readAuth().token) await refreshAccessToken();
        if (readAuth().token) {
          const u = await AuthAPI.me();
          setUser(u);
          writeAuth({ user: u });
        } else setUser(null);
      } catch { setUser(null); }
      finally { setLoading(false); }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await AuthAPI.login(email, password);
    writeAuth({ token, user });
    setUser(user);
  };
  const register = async (name: string, email: string, password: string) => {
    const { token, user } = await AuthAPI.register(name, email, password);
    writeAuth({ token, user });
    setUser(user);
  };
  const logout = async () => {
    try { await AuthAPI.logout(); } catch {}
    clearAuth();
    setUser(null);
  };
  const refresh = async () => { setUser(await AuthAPI.me()); };

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be within AuthProvider");
  return v;
}
