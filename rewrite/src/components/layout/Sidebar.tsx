import { NavLink } from "react-router-dom";
import {
  BarChart3, CreditCard, Home, LayoutList, PiggyBank, Receipt, Settings,
  Target, Users, Wallet, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/format";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/transactions", label: "Transactions", icon: CreditCard },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/categories", label: "Categories", icon: LayoutList },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/receipts", label: "Receipts", icon: Receipt },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-6 py-5 text-lg font-semibold text-slate-900 dark:text-white">
        <Wallet className="h-5 w-5 text-brand-600" /> ExpenseFlow
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-500"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <it.icon className="h-4 w-4" /> {it.label}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-500"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <Users className="h-4 w-4" /> Admin
          </NavLink>
        )}
      </nav>
      <div className="p-4 text-xs text-slate-400">v1.0.0</div>
    </aside>
  );
}
