import { api } from "./api";
import type { Role, User } from "@/context/auth";
import type {
  AdminUser, Budget, Goal, NotifySettings, Notification, Transaction,
} from "@/lib/store";

export interface AuthResponse { user: User & { role: Role }; token: string }

export const AuthAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/login", { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/register", { name, email, password }).then((r) => r.data),
  forgot: (email: string) =>
    api.post<{ ok: true }>("/api/auth/forgot-password", { email }).then((r) => r.data),
  me: () => api.get<User & { role: Role }>("/api/auth/me").then((r) => r.data),
  refresh: () => api.post<AuthResponse>("/api/auth/refresh").then((r) => r.data),
  logout: () => api.post<{ ok: true }>("/api/auth/logout").then((r) => r.data),
};

export const TransactionsAPI = {
  list: () => api.get<Transaction[]>("/api/transactions").then((r) => r.data),
export const TransactionsAPI = {
  list: () => api.get<Transaction[]>("/api/transactions").then((r) => r.data),
  create: (t: Omit<Transaction, "id">) =>
    api.post<Transaction>("/api/transactions", t).then((r) => r.data),
  update: (id: string, t: Partial<Transaction>) =>
    api.put<Transaction>(`/api/transactions/${id}`, t).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/transactions/${id}`).then(() => true),
  clearAll: () => api.delete(`/api/transactions`).then(() => true),
};
  list: () => api.get<Budget[]>("/api/budgets").then((r) => r.data),
  create: (b: Omit<Budget, "id">) => api.post<Budget>("/api/budgets", b).then((r) => r.data),
  update: (id: string, b: Partial<Budget>) =>
    api.put<Budget>(`/api/budgets/${id}`, b).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/budgets/${id}`).then(() => true),
};

export const GoalsAPI = {
  list: () => api.get<Goal[]>("/api/goals").then((r) => r.data),
  create: (g: Omit<Goal, "id">) => api.post<Goal>("/api/goals", g).then((r) => r.data),
  update: (id: string, g: Partial<Goal>) =>
    api.put<Goal>(`/api/goals/${id}`, g).then((r) => r.data),
  remove: (id: string) => api.delete(`/api/goals/${id}`).then(() => true),
};

export const NotificationsAPI = {
  list: () => api.get<Notification[]>("/api/notifications").then((r) => r.data),
  markRead: (id: string) => api.post(`/api/notifications/${id}/read`).then(() => true),
  markAllRead: () => api.post(`/api/notifications/read-all`).then(() => true),
  remove: (id: string) => api.delete(`/api/notifications/${id}`).then(() => true),
  broadcast: (n: { title: string; message: string; type?: "system" | "budget" | "goal" }) =>
    api.post("/api/notifications/broadcast", n).then(() => true),
};

export const SettingsAPI = {
  get: () => api.get<NotifySettings>("/api/settings").then((r) => r.data),
  update: (s: Partial<NotifySettings>) =>
    api.put<NotifySettings>("/api/settings", s).then((r) => r.data),
};

export const AdminAPI = {
  listUsers: () => api.get<AdminUser[]>("/api/admin/users").then((r) => r.data),
  updateUser: (id: string, u: Partial<AdminUser>) =>
    api.put<AdminUser>(`/api/admin/users/${id}`, u).then((r) => r.data),
  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`).then(() => true),
};
