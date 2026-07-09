import type { ReactNode } from "react";
import { Wallet } from "lucide-react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Wallet className="h-6 w-6" /> ExpenseFlow
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight">Take control of every dollar you earn and spend.</h1>
          <p className="mt-4 text-white/80 max-w-md">Budgets, goals, categories, receipts and analytics — in one place.</p>
        </div>
        <div className="text-sm text-white/70">© {new Date().getFullYear()} ExpenseFlow</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden text-slate-900 dark:text-white">
            <Wallet className="h-5 w-5 text-brand-600" /> ExpenseFlow
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
