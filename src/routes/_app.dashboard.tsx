import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Plus, Target, PiggyBank, ArrowLeftRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/context/auth";
import { categorySpend, fmtCurrency, monthlyTotals, useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ExpenseFlow" }, { name: "description", content: "Your finance overview." }] }),
  component: DashboardPage,
});

const PIE_COLORS = ["oklch(0.65 0.22 295)", "oklch(0.65 0.18 255)", "oklch(0.66 0.23 12)", "oklch(0.72 0.17 160)", "oklch(0.78 0.15 80)", "oklch(0.7 0.18 200)"];
const tt = { background: "oklch(0.22 0.04 265 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 } as const;

function DashboardPage() {
  const { user } = useAuth();
  const { transactions, budgets, goals } = useStore();
  const now = new Date();

  const monthly = useMemo(() => monthlyTotals(transactions, 7), [transactions]);
  const last = monthly[monthly.length - 1] || { income: 0, expense: 0 };
  const prev = monthly[monthly.length - 2] || { income: 0, expense: 0 };
  const monthSpend = useMemo(() => categorySpend(transactions, now.getMonth(), now.getFullYear()), [transactions]);
  const breakdown = Array.from(monthSpend.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const totalIncome = last.income;
  const totalExpense = last.expense;
  const savings = totalIncome - totalExpense;
  const balance = transactions.reduce((a, t) => a + (t.type === "income" ? t.amount : -t.amount), 0);

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const trendPct = (cur: number, p: number) => p ? Math.round(((cur - p) / p) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's how your finances look this month, {user?.name}.</p>
        </div>
        <Link to="/transactions" className="inline-flex shrink-0 items-center gap-2 rounded-lg btn-primary px-4 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add transaction</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net Balance" value={fmtCurrency(balance)} icon={Wallet} accent="var(--brand-purple)" trend="" />
        <StatCard label="Income (mo)" value={fmtCurrency(totalIncome)} icon={ArrowDownRight} accent="var(--success)" trend={`${trendPct(last.income, prev.income) >= 0 ? "+" : ""}${trendPct(last.income, prev.income)}%`} up={trendPct(last.income, prev.income) >= 0} />
        <StatCard label="Expenses (mo)" value={fmtCurrency(totalExpense)} icon={ArrowUpRight} accent="var(--brand-rose)" trend={`${trendPct(last.expense, prev.expense) >= 0 ? "+" : ""}${trendPct(last.expense, prev.expense)}%`} up={trendPct(last.expense, prev.expense) <= 0} />
        <StatCard label="Savings" value={fmtCurrency(savings)} icon={TrendingUp} accent="var(--brand-blue)" trend={totalIncome ? `${Math.round((savings / totalIncome) * 100)}% rate` : ""} up />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card-glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Monthly Overview</h3>
              <p className="text-xs text-muted-foreground">Income vs. expenses, last 7 months</p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-purple" /> Income</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-rose" /> Expense</span>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.66 0.23 12)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="oklch(0.66 0.23 12)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} formatter={(v: number) => fmtCurrency(v)} />
                <Area type="monotone" dataKey="income" stroke="oklch(0.65 0.22 295)" strokeWidth={2} fill="url(#inc)" />
                <Area type="monotone" dataKey="expense" stroke="oklch(0.66 0.23 12)" strokeWidth={2} fill="url(#exp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="font-semibold">Expense Breakdown</h3>
          <p className="text-xs text-muted-foreground">This month by category</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} stroke="none">
                  {breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tt} formatter={(v: number) => fmtCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {breakdown.map((b, i) => (
              <div key={b.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-muted-foreground">{b.name}</span>
                <span className="ml-auto font-medium">{fmtCurrency(b.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold inline-flex items-center gap-2"><Target className="h-4 w-4 text-brand-purple" /> Budget Progress</h3>
            <Link to="/budgets" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          <div className="mt-4 space-y-4">
            {budgets.slice(0, 4).map((b) => {
              const spent = monthSpend.get(b.category) || 0;
              const pct = Math.min(100, Math.round((spent / b.limit) * 100));
              const over = spent > b.limit;
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{b.category}</span>
                    <span className={over ? "text-brand-rose" : "text-muted-foreground"}>{fmtCurrency(spent)} / {fmtCurrency(b.limit)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? "var(--gradient-rose)" : "var(--gradient-primary)" }} />
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && <p className="text-sm text-muted-foreground">No budgets yet.</p>}
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold inline-flex items-center gap-2"><PiggyBank className="h-4 w-4 text-brand-blue" /> Goals</h3>
            <Link to="/goals" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
          </div>
          <div className="mt-4 space-y-4">
            {goals.slice(0, 4).map((g) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{fmtCurrency(g.current)} of {fmtCurrency(g.target)}</div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet.</p>}
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/transactions" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm hover:bg-white/[0.06]"><ArrowDownRight className="h-4 w-4 text-success" /> Income</Link>
            <Link to="/transactions" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm hover:bg-white/[0.06]"><ArrowUpRight className="h-4 w-4 text-brand-rose" /> Expense</Link>
            <Link to="/budgets" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm hover:bg-white/[0.06]"><Target className="h-4 w-4 text-brand-purple" /> Budget</Link>
            <Link to="/goals" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-sm hover:bg-white/[0.06]"><PiggyBank className="h-4 w-4 text-brand-blue" /> Goal</Link>
          </div>
          <div className="mt-5 rounded-lg p-4" style={{ background: "var(--gradient-primary)" }}>
            <p className="text-sm font-semibold text-white">Savings rate this month</p>
            <p className="mt-1 text-3xl font-bold text-white">{totalIncome ? Math.round((savings / totalIncome) * 100) : 0}%</p>
            <p className="mt-1 text-xs text-white/80">Based on this month's flows</p>
          </div>
        </div>
      </div>

      <div className="card-glass p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold inline-flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-brand-purple" /> Recent Transactions</h3>
          <Link to="/transactions" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recent.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 font-medium">{t.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.category}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.date}</td>
                  <td className={`py-3 pr-4 text-right font-semibold ${t.type === "income" ? "text-success" : ""}`}>
                    {t.type === "income" ? "+" : "-"}{fmtCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, trend, up }: { label: string; value: string; icon: any; accent: string; trend: string; up?: boolean }) {
  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${accent} 22%, transparent)` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        {trend && <span className={`text-xs font-medium ${up ? "text-success" : "text-brand-rose"}`}>{trend}</span>}
      </div>
      <div className="mt-4 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
