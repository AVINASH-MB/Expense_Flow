import axios, { type AxiosInstance } from "axios";

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

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE || "/",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const t = readToken();
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      // token rejected by server — clear and bounce to /login
      try { window.localStorage.removeItem(TOKEN_KEY); } catch {}
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  },
);
