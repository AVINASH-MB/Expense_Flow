import { api } from "./api";
import type {
  Budget, Category, DashboardData, Goal, Notification, Receipt, Settings, Transaction, User,
} from "@/types";

export const AuthAPI = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/api/auth/login", { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post<{ token: string; user: User }>("/api/auth/register", { name, email, password }).then((r) => r.data),
  logout: () => api.post("/api/auth/logout").then((r) => r.data),
  me: () => api.get<User>("/api/auth/me").then((r) => r.data),
  forgot: (email: string) => api.post("/api/auth/forgot-password", { email }).then((r) => r.data),
  reset: (token: string, password: string) =>
    api.post("/api/auth/reset-password", { token, password }).then((r) => r.data),
  updateProfile: (patch: Partial<User> & { password?: string }) =>
    api.put<User>("/api/auth/me", patch).then((r) => r.data),
};

export const DashboardAPI = {
  get: () => api.get<DashboardData>("/api/dashboard").then((r) => r.data),
};

export const TxAPI = {
  list: (q?: Record<string, string | undefined>) =>
    api.get<Transaction[]>("/api/transactions", { params: q }).then((r) => r.data),
  create: (t: Omit<Transaction, "id">) =>
    api.post<Transaction>("/api/transactions", t).then((r) => r.data),
  update: (id: string, patch: Partial<Transaction>) =>
    api.put<Transaction>(`/api/transactions/${id}`, patch).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/transactions/${id}`).then((r) => r.data),
};

export const CategoriesAPI = {
  list: () => api.get<Category[]>("/api/categories").then((r) => r.data),
  create: (c: Omit<Category, "id">) => api.post<Category>("/api/categories", c).then((r) => r.data),
  update: (id: string, p: Partial<Category>) =>
    api.put<Category>(`/api/categories/${id}`, p).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/categories/${id}`).then((r) => r.data),
};

export const BudgetsAPI = {
  list: () => api.get<Budget[]>("/api/budgets").then((r) => r.data),
  create: (b: Omit<Budget, "id">) => api.post<Budget>("/api/budgets", b).then((r) => r.data),
  update: (id: string, p: Partial<Budget>) =>
    api.put<Budget>(`/api/budgets/${id}`, p).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/budgets/${id}`).then((r) => r.data),
};

export const GoalsAPI = {
  list: () => api.get<Goal[]>("/api/goals").then((r) => r.data),
  create: (g: Omit<Goal, "id">) => api.post<Goal>("/api/goals", g).then((r) => r.data),
  update: (id: string, p: Partial<Goal>) => api.put<Goal>(`/api/goals/${id}`, p).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/goals/${id}`).then((r) => r.data),
};

export const NotificationsAPI = {
  list: () => api.get<Notification[]>("/api/notifications").then((r) => r.data),
  read: (id: string) => api.post(`/api/notifications/${id}/read`).then((r) => r.data),
  readAll: () => api.post("/api/notifications/read-all").then((r) => r.data),
  remove: (id: string) => api.delete(`/api/notifications/${id}`).then((r) => r.data),
};

export const ReceiptsAPI = {
  list: () => api.get<Receipt[]>("/api/receipts").then((r) => r.data),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("receipt", file);
    return api.post<Receipt>("/api/receipts", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
  remove: (id: string) => api.delete(`/api/receipts/${id}`).then((r) => r.data),
};

export const SettingsAPI = {
  get: () => api.get<Settings>("/api/settings").then((r) => r.data),
  update: (patch: Partial<Settings>) =>
    api.put<Settings>("/api/settings", patch).then((r) => r.data),
  deleteAccount: () => api.delete("/api/settings/account").then((r) => r.data),
};

export const AnalyticsAPI = {
  byCategory: () =>
    api.get<{ category: string; type: string; total: number }[]>(
      "/api/analytics/by-category",
    ).then((r) => r.data),
  trend: () =>
    api.get<{ month: string; income: number; expense: number }[]>(
      "/api/analytics/trend",
    ).then((r) => r.data),
};

export const AdminAPI = {
  users: () => api.get<any[]>("/api/admin/users").then((r) => r.data),
  updateUser: (id: string, p: any) => api.put(`/api/admin/users/${id}`, p).then((r) => r.data),
  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`).then((r) => r.data),
  broadcast: (title: string, message: string, type = "system") =>
    api.post("/api/notifications/broadcast", { title, message, type }).then((r) => r.data),
};
