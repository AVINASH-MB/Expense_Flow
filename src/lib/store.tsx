import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { apiEnabled } from "@/lib/api";
import {
  AdminAPI, BudgetsAPI, GoalsAPI, NotificationsAPI, SettingsAPI, TransactionsAPI,
} from "@/lib/api-services";
import { useAuth } from "@/context/auth";

export type TxnType = "income" | "expense";
export interface Transaction {
  id: string;
  name: string;
  category: string;
  type: TxnType;
  amount: number; // always positive
  date: string;   // ISO yyyy-mm-dd
  note?: string;
}
export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: "monthly";
}
export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
}
export interface Notification {
  id: string;
  type: "budget" | "goal" | "system";
  title: string;
  message: string;
  date: string; // ISO
  read: boolean;
}
export interface NotifySettings {
  emailBudgetAlerts: boolean;
  emailGoalAlerts: boolean;
  emailWeeklyDigest: boolean;
  emailProductUpdates: boolean;
  currency: string;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "suspended";
  joined: string;
  spend: number;
}

export const CATEGORIES = [
  "Groceries", "Dining", "Transport", "Bills", "Entertainment",
  "Shopping", "Health", "Travel", "Education", "Other", "Income",
];

const KEY = "expenseflow.data.v1";
const SEEDED_KEY = "expenseflow.seeded.v1";

interface StoreData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  notifications: Notification[];
  settings: NotifySettings;
  users: AdminUser[];
}

function uid() { return Math.random().toString(36).slice(2, 10); }

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seed(): StoreData {
  const t: Transaction[] = [
    { id: uid(), name: "Salary — Acme Inc.", category: "Income", type: "income", amount: 4200, date: daysAgo(1) },
    { id: uid(), name: "Freelance project", category: "Income", type: "income", amount: 1200, date: daysAgo(8) },
    { id: uid(), name: "Whole Foods", category: "Groceries", type: "expense", amount: 84.32, date: daysAgo(0) },
    { id: uid(), name: "Trader Joe's", category: "Groceries", type: "expense", amount: 62.10, date: daysAgo(4) },
    { id: uid(), name: "Costco run", category: "Groceries", type: "expense", amount: 184.5, date: daysAgo(12) },
    { id: uid(), name: "Starbucks", category: "Dining", type: "expense", amount: 6.5, date: daysAgo(1) },
    { id: uid(), name: "Sushi night", category: "Dining", type: "expense", amount: 72.0, date: daysAgo(5) },
    { id: uid(), name: "Pizza", category: "Dining", type: "expense", amount: 28.4, date: daysAgo(9) },
    { id: uid(), name: "Uber", category: "Transport", type: "expense", amount: 18.4, date: daysAgo(2) },
    { id: uid(), name: "Gas", category: "Transport", type: "expense", amount: 52.0, date: daysAgo(7) },
    { id: uid(), name: "Rent", category: "Bills", type: "expense", amount: 1450, date: daysAgo(3) },
    { id: uid(), name: "Electric bill", category: "Bills", type: "expense", amount: 92.4, date: daysAgo(11) },
    { id: uid(), name: "Netflix", category: "Entertainment", type: "expense", amount: 15.99, date: daysAgo(6) },
    { id: uid(), name: "Concert tickets", category: "Entertainment", type: "expense", amount: 120, date: daysAgo(14) },
    { id: uid(), name: "Amazon", category: "Shopping", type: "expense", amount: 73.2, date: daysAgo(10) },
    { id: uid(), name: "Pharmacy", category: "Health", type: "expense", amount: 24.6, date: daysAgo(15) },
    // older months
    { id: uid(), name: "Salary", category: "Income", type: "income", amount: 4200, date: daysAgo(32) },
    { id: uid(), name: "Salary", category: "Income", type: "income", amount: 4200, date: daysAgo(62) },
    { id: uid(), name: "Salary", category: "Income", type: "income", amount: 4200, date: daysAgo(92) },
    { id: uid(), name: "Groceries", category: "Groceries", type: "expense", amount: 720, date: daysAgo(35) },
    { id: uid(), name: "Groceries", category: "Groceries", type: "expense", amount: 690, date: daysAgo(65) },
    { id: uid(), name: "Rent", category: "Bills", type: "expense", amount: 1450, date: daysAgo(33) },
    { id: uid(), name: "Rent", category: "Bills", type: "expense", amount: 1450, date: daysAgo(63) },
    { id: uid(), name: "Dining", category: "Dining", type: "expense", amount: 320, date: daysAgo(40) },
    { id: uid(), name: "Dining", category: "Dining", type: "expense", amount: 410, date: daysAgo(70) },
    { id: uid(), name: "Transport", category: "Transport", type: "expense", amount: 180, date: daysAgo(45) },
    { id: uid(), name: "Transport", category: "Transport", type: "expense", amount: 220, date: daysAgo(75) },
  ];
  const b: Budget[] = [
    { id: uid(), category: "Groceries", limit: 800, period: "monthly" },
    { id: uid(), category: "Dining", limit: 250, period: "monthly" },
    { id: uid(), category: "Transport", limit: 300, period: "monthly" },
    { id: uid(), category: "Entertainment", limit: 200, period: "monthly" },
    { id: uid(), category: "Shopping", limit: 400, period: "monthly" },
  ];
  const g: Goal[] = [
    { id: uid(), name: "Emergency Fund", target: 10000, current: 4800, deadline: daysAgo(-180) },
    { id: uid(), name: "Japan Trip", target: 4000, current: 1750, deadline: daysAgo(-240) },
    { id: uid(), name: "New Laptop", target: 1800, current: 980, deadline: daysAgo(-90) },
  ];
  const n: Notification[] = [
    { id: uid(), type: "system", title: "Welcome to ExpenseFlow", message: "Get started by adding your first transaction.", date: daysAgo(0), read: false },
  ];
  const users: AdminUser[] = [
    { id: "u_1", name: "Demo User", email: "demo@expenseflow.app", role: "admin", status: "active", joined: daysAgo(120), spend: 8420 },
    { id: "u_2", name: "Sarah Chen", email: "sarah@acme.co", role: "user", status: "active", joined: daysAgo(85), spend: 5210 },
    { id: "u_3", name: "Marcus Lee", email: "marcus@nova.io", role: "user", status: "active", joined: daysAgo(56), spend: 3120 },
    { id: "u_4", name: "Priya Patel", email: "priya@delta.com", role: "user", status: "suspended", joined: daysAgo(200), spend: 1840 },
    { id: "u_5", name: "Jonas Weber", email: "jonas@weber.de", role: "user", status: "active", joined: daysAgo(20), spend: 640 },
  ];
  return {
    transactions: t,
    budgets: b,
    goals: g,
    notifications: n,
    settings: { emailBudgetAlerts: true, emailGoalAlerts: true, emailWeeklyDigest: false, emailProductUpdates: false, currency: "USD" },
    users,
  };
}

function emptyData(): StoreData {
  return {
    transactions: [],
    budgets: [],
    goals: [],
    notifications: [],
    settings: { emailBudgetAlerts: true, emailGoalAlerts: true, emailWeeklyDigest: false, emailProductUpdates: false, currency: "USD" },
    users: [],
  };
}

interface StoreContextValue extends StoreData {
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  pushNotification: (n: Omit<Notification, "id" | "date" | "read">) => void;
  updateSettings: (s: Partial<NotifySettings>) => void;
  updateUser: (id: string, u: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  reseed: () => void;
  clearAll: () => Promise<void>;
}

const Ctx = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const useApi = apiEnabled();

  const [data, setData] = useState<StoreData>(() => {
    if (typeof window === "undefined") return seed();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
      // Only seed on the very first visit; once cleared, never re-seed.
      if (window.localStorage.getItem(SEEDED_KEY)) return emptyData();
      window.localStorage.setItem(SEEDED_KEY, "1");
    } catch {}
    return seed();
  });

  // Persist locally only when running in mock mode
  useEffect(() => {
    if (useApi) return;
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  }, [data, useApi]);

  // Keep module-level currency in sync with settings so fmtCurrency() reflects user choice everywhere
  useEffect(() => {
    setActiveCurrency(data.settings.currency || "USD");
  }, [data.settings.currency]);

  // Hydrate from API on login
  useEffect(() => {
    if (!useApi || !token || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const [transactions, budgets, goals, notifications, settings, users] = await Promise.all([
          TransactionsAPI.list(),
          BudgetsAPI.list(),
          GoalsAPI.list(),
          NotificationsAPI.list(),
          SettingsAPI.get(),
          user.role === "admin" ? AdminAPI.listUsers() : Promise.resolve([] as AdminUser[]),
        ]);
        if (cancelled) return;
        setData((d) => ({ ...d, transactions, budgets, goals, notifications, settings, users }));
      } catch (err: any) {
        if (!cancelled) toast.error(`Failed to load data: ${err?.response?.data?.error ?? err.message}`);
      }
    })();
    return () => { cancelled = true; };
  }, [useApi, token, user]);

  // Client-side alert generation (mock mode only — server should do this when API is on)
  useEffect(() => {
    if (useApi) return;
    const now = new Date();
    const month = now.getMonth(); const year = now.getFullYear();
    const spentByCat = new Map<string, number>();
    for (const t of data.transactions) {
      if (t.type !== "expense") continue;
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        spentByCat.set(t.category, (spentByCat.get(t.category) || 0) + t.amount);
      }
    }
    const newAlerts: Notification[] = [];
    for (const b of data.budgets) {
      const spent = spentByCat.get(b.category) || 0;
      if (spent > b.limit) {
        const sig = `budget:${b.id}:${year}-${month}`;
        if (!data.notifications.some((n) => n.message.includes(sig))) {
          newAlerts.push({
            id: uid(), type: "budget", read: false, date: new Date().toISOString(),
            title: `Budget exceeded: ${b.category}`,
            message: `You've spent $${spent.toFixed(0)} of your $${b.limit} ${b.category} budget this month. [${sig}]`,
          });
        }
      }
    }
    for (const g of data.goals) {
      if (g.current >= g.target) {
        const sig = `goal:${g.id}`;
        if (!data.notifications.some((n) => n.message.includes(sig))) {
          newAlerts.push({
            id: uid(), type: "goal", read: false, date: new Date().toISOString(),
            title: `Goal achieved: ${g.name} 🎉`,
            message: `You've reached your $${g.target} target for ${g.name}. [${sig}]`,
          });
        }
      }
    }
    if (newAlerts.length) {
      setData((d) => ({ ...d, notifications: [...newAlerts, ...d.notifications] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.transactions, data.budgets, data.goals, useApi]);

  /** Run an API call; on error, surface a toast and rethrow so optimistic state can roll back. */
  const tryApi = async <T,>(fn: () => Promise<T>, label: string): Promise<T | null> => {
    try { return await fn(); }
    catch (err: any) {
      toast.error(`${label} failed: ${err?.response?.data?.error ?? err.message}`);
      return null;
    }
  };

  const value = useMemo<StoreContextValue>(() => ({
    ...data,
    addTransaction: (t) => {
      const temp: Transaction = { ...t, id: `tmp_${uid()}` };
      setData((d) => ({ ...d, transactions: [temp, ...d.transactions] }));
      if (useApi) {
        tryApi(() => TransactionsAPI.create(t), "Create transaction").then((real) => {
          if (real) setData((d) => ({ ...d, transactions: d.transactions.map((x) => x.id === temp.id ? real : x) }));
          else setData((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== temp.id) }));
        });
      }
    },
    updateTransaction: (id, t) => {
      setData((d) => ({ ...d, transactions: d.transactions.map((x) => x.id === id ? { ...x, ...t } : x) }));
      if (useApi) tryApi(() => TransactionsAPI.update(id, t), "Update transaction");
    },
    deleteTransaction: (id) => {
      setData((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) }));
      if (useApi) tryApi(() => TransactionsAPI.remove(id), "Delete transaction");
    },
    addBudget: (b) => {
      const temp: Budget = { ...b, id: `tmp_${uid()}` };
      setData((d) => ({ ...d, budgets: [...d.budgets, temp] }));
      if (useApi) {
        tryApi(() => BudgetsAPI.create(b), "Create budget").then((real) => {
          if (real) setData((d) => ({ ...d, budgets: d.budgets.map((x) => x.id === temp.id ? real : x) }));
          else setData((d) => ({ ...d, budgets: d.budgets.filter((x) => x.id !== temp.id) }));
        });
      }
    },
    updateBudget: (id, b) => {
      setData((d) => ({ ...d, budgets: d.budgets.map((x) => x.id === id ? { ...x, ...b } : x) }));
      if (useApi) tryApi(() => BudgetsAPI.update(id, b), "Update budget");
    },
    deleteBudget: (id) => {
      setData((d) => ({ ...d, budgets: d.budgets.filter((x) => x.id !== id) }));
      if (useApi) tryApi(() => BudgetsAPI.remove(id), "Delete budget");
    },
    addGoal: (g) => {
      const temp: Goal = { ...g, id: `tmp_${uid()}` };
      setData((d) => ({ ...d, goals: [...d.goals, temp] }));
      if (useApi) {
        tryApi(() => GoalsAPI.create(g), "Create goal").then((real) => {
          if (real) setData((d) => ({ ...d, goals: d.goals.map((x) => x.id === temp.id ? real : x) }));
          else setData((d) => ({ ...d, goals: d.goals.filter((x) => x.id !== temp.id) }));
        });
      }
    },
    updateGoal: (id, g) => {
      setData((d) => ({ ...d, goals: d.goals.map((x) => x.id === id ? { ...x, ...g } : x) }));
      if (useApi) tryApi(() => GoalsAPI.update(id, g), "Update goal");
    },
    deleteGoal: (id) => {
      setData((d) => ({ ...d, goals: d.goals.filter((x) => x.id !== id) }));
      if (useApi) tryApi(() => GoalsAPI.remove(id), "Delete goal");
    },
    markNotificationRead: (id) => {
      setData((d) => ({ ...d, notifications: d.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
      if (useApi) tryApi(() => NotificationsAPI.markRead(id), "Mark read");
    },
    markAllRead: () => {
      setData((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
      if (useApi) tryApi(() => NotificationsAPI.markAllRead(), "Mark all read");
    },
    deleteNotification: (id) => {
      setData((d) => ({ ...d, notifications: d.notifications.filter((n) => n.id !== id) }));
      if (useApi) tryApi(() => NotificationsAPI.remove(id), "Delete notification");
    },
    pushNotification: (n) => {
      setData((d) => ({ ...d, notifications: [{ ...n, id: uid(), date: new Date().toISOString(), read: false }, ...d.notifications] }));
      if (useApi) tryApi(() => NotificationsAPI.broadcast(n), "Broadcast notification");
    },
    updateSettings: (s) => {
      setData((d) => ({ ...d, settings: { ...d.settings, ...s } }));
      if (useApi) tryApi(() => SettingsAPI.update(s), "Update settings");
    },
    updateUser: (id, u) => {
      setData((d) => ({ ...d, users: d.users.map((x) => x.id === id ? { ...x, ...u } : x) }));
      if (useApi) tryApi(() => AdminAPI.updateUser(id, u), "Update user");
    },
    deleteUser: (id) => {
      setData((d) => ({ ...d, users: d.users.filter((x) => x.id !== id) }));
      if (useApi) tryApi(() => AdminAPI.deleteUser(id), "Delete user");
    },
    reseed: () => {
      try { window.localStorage.removeItem(SEEDED_KEY); } catch {}
      setData(seed());
    },
    clearAll: async () => {
      setData((d) => ({ ...d, transactions: [], budgets: [], goals: [], notifications: [] }));
      try { window.localStorage.setItem(SEEDED_KEY, "1"); } catch {}
      if (useApi) {
        await Promise.allSettled([
          TransactionsAPI.clearAll(),
          BudgetsAPI.clearAll(),
          GoalsAPI.clearAll(),
          NotificationsAPI.clearAll(),
        ]);
      }
    },
  }), [data, useApi]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

// Helpers
import { findCurrency } from "@/lib/currencies";
let _activeCurrency = "USD";
export function setActiveCurrency(code: string) { _activeCurrency = code || "USD"; }
export function getActiveCurrency() { return _activeCurrency; }
export function fmtCurrency(n: number, code?: string) {
  const c = findCurrency(code || _activeCurrency);
  const decimals = c.code === "JPY" ? 0 : (n % 1 === 0 ? 0 : 2);
  try {
    return n.toLocaleString(c.locale, { style: "currency", currency: c.code, maximumFractionDigits: decimals, minimumFractionDigits: decimals });
  } catch {
    return `${c.symbol}${n.toLocaleString("en-US", { maximumFractionDigits: decimals })}`;
  }
}

export function categorySpend(transactions: Transaction[], month?: number, year?: number) {
  const m = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    if (month !== undefined && year !== undefined) {
      const d = new Date(t.date);
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;
    }
    m.set(t.category, (m.get(t.category) || 0) + t.amount);
  }
  return m;
}

export function monthlyTotals(transactions: Transaction[], months = 7) {
  const out: { m: string; income: number; expense: number; key: string }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ m: d.toLocaleString("en-US", { month: "short" }), income: 0, expense: 0, key: `${d.getFullYear()}-${d.getMonth()}` });
  }
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const row = out.find((r) => r.key === key);
    if (!row) continue;
    if (t.type === "income") row.income += t.amount; else row.expense += t.amount;
  }
  return out;
}
