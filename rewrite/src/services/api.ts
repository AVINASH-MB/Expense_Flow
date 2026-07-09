import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export const API_BASE: string = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "expenseflow.auth";

interface StoredAuth { token?: string; user?: unknown }

export function readAuth(): StoredAuth {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || "{}"); }
  catch { return {}; }
}
export function writeAuth(next: StoredAuth) {
  const prev = readAuth();
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ ...prev, ...next }));
}
export function clearAuth() { localStorage.removeItem(TOKEN_KEY); }

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const t = readAuth().token;
  if (t) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any).Authorization = `Bearer ${t}`;
  }
  return cfg;
});

let refreshing: Promise<string | null> | null = null;
async function doRefresh(): Promise<string | null> {
  try {
    const r = await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true });
    const token = r.data?.token as string | undefined;
    if (!token) return null;
    writeAuth({ token, user: r.data?.user });
    return token;
  } catch { return null; }
}
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null; });
  return refreshing;
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err?.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = err?.response?.status;
    const url = original?.url || "";
    const isAuth = /\/api\/auth\/(login|register|refresh|logout|forgot-password|reset-password)/.test(url);
    if (status === 401 && original && !original._retry && !isAuth) {
      original._retry = true;
      const t = await refreshAccessToken();
      if (t) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${t}` };
        return api.request(original);
      }
      clearAuth();
      if (!location.pathname.startsWith("/login")) location.assign("/login");
    }
    return Promise.reject(err);
  },
);
