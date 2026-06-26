import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export const API_BASE: string =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) || "";

/** True when a real backend is configured; false ⇒ frontend runs on local mock data. */
export const apiEnabled = (): boolean => Boolean(API_BASE);

const TOKEN_KEY = "expenseflow.auth";

function readToken(): string | null {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

function writeToken(token: string, user?: unknown) {
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({ ...prev, token, user: user ?? prev.user }),
    );
  } catch {}
}

function clearToken() {
  try { window.localStorage.removeItem(TOKEN_KEY); } catch {}
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE || "/",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // refresh-token cookie
});

api.interceptors.request.use((config) => {
  const t = readToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

// ---- Refresh-token rotation ----
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const r = await axios.post(
      `${API_BASE}/api/auth/refresh`,
      {},
      { withCredentials: true, headers: { "Content-Type": "application/json" } },
    );
    const token: string | undefined = r.data?.token;
    if (!token) return null;
    writeToken(token, r.data?.user);
    return token;
  } catch {
    return null;
  }
}

/** Public helper so AuthProvider can attempt a silent refresh on boot. */
export function refreshAccessToken(): Promise<string | null> {
  if (!apiEnabled()) return Promise.resolve(null);
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err?.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = err?.response?.status;
    const url: string = original?.url || "";
    const isAuthEndpoint = /\/api\/auth\/(login|register|refresh|logout|forgot-password)/.test(url);

    if (status === 401 && original && !original._retry && !isAuthEndpoint && apiEnabled()) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      }
      // Refresh failed — clear and bounce
      clearToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  },
);
