export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
}

export type TxType = "income" | "expense";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  type: TxType;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  receipt_id?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TxType;
  color?: string | null;
  icon?: string | null;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: "weekly" | "monthly" | "yearly";
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
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Receipt {
  id: string;
  filename: string;
  original: string;
  mime: string;
  size_bytes: number;
  url: string;
  uploaded_at: string;
}

export interface Settings {
  emailBudgetAlerts: boolean;
  emailGoalAlerts: boolean;
  emailWeeklyDigest: boolean;
  emailProductUpdates: boolean;
  currency: string;
  theme: "light" | "dark" | "system";
}

export interface DashboardData {
  totals: { income: number; expense: number; balance: number };
  monthly: { month: string; income: number; expense: number }[];
  recent: Pick<Transaction, "id" | "name" | "category" | "type" | "amount" | "date">[];
}
