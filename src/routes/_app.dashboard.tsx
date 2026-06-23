import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Plus, Target, PiggyBank, ArrowLeftRight, ShoppingBag, Coffee, Car, Home, Briefcase } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ExpenseFlow" }, { name: "description", content: "Your finance overview." }] }),
  component: DashboardPage,
});

const monthly = [
  { m: "Jan", income: 6200, expense: 3100 },
  { m: "Feb", income: 6400, expense: 3300 },
  { m: "Mar", income: 7100, expense: 4200 },
  { m: "Apr", income: 6800, expense: 3800 },
  { m: "May", income: 7400, expense: 3500 },
  { m: "Jun", income: 7900, expense: 4100 },
  { m: "Jul", income: 8200, expense: 3720 },
];

const breakdown = [
  { name: "Groceries", value: 820, color: "var(--brand-purple)" },
  { name: "Transport", value: 410, color: "var(--brand-blue)" },
  { name: "Dining", value: 640, color: "var(--brand-rose)" },
  { name: "Bills", value: 1200, color: "oklch(0.72 0.17 160)" },
  { name: "Other", value: 650, color: "oklch(0.78 0.15 80)" },
];

const txns = [
  { id: 1, name: "Whole Foods", cat: "Groceries", date: "Today", amount: -84.32, icon: ShoppingBag },
  { id: 2, name: "Salary — Acme Inc.", cat: "Income", date: "Yesterday", amount: 4200, icon: Briefcase },
  { id: 3, name: "Starbucks", cat: "Dining", date: "Yesterday", amount: -6.50, icon: Coffee },
  { id: 4, name: "Uber", cat: "Transport", date: "2 days ago", amount: -18.40, icon: Car },
  { id: 5, name: "Rent", cat: "Bills", date: "3 days ago", amount: -1450, icon: Home },
  { id: 6, name: "Trader Joe's", cat: "Groceries", date: "4 days ago", amount: -62.10, icon: ShoppingBag },
];

const budgets = [
  { cat: "Groceries", spent: 820, limit: 1000, color: "var(--brand-purple)" },
  { cat: "Dining", spent: 640, limit: 500, color: "var(--brand-rose)" },
  { cat: "Transport", spent: 410, limit: 600, color: "var(--brand-blue)" },
];

const goals = [
  { name: "Emergency Fund", current: 4800, target: 10000 },
  { name: "Japan Trip", current: 1750, target: 4000 },
  { name: "New Laptop", current: 980, target: 1800 },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function DashboardPage() {
  const { user } = useAuth();
  const totalIncome = 8200;
  const totalExpense = 3720;
  const balance = 12480;
  const savings = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's how your finances look this month, {user?.name}.</p>
        </div>
        <button className="inline-flex shrink-0 items-center gap-2 rounded-lg btn-primary px-4 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add transaction</span>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current Balance" value={fmt(balance)} icon={Wallet} accent="var(--brand-purple)" trend="+8.2%" up />
        <StatCard label="Total Income" value={fmt(totalIncome)} icon={ArrowDownRight} accent="oklch(0.72 0.17 160)" trend="+12.4%" up />
        <StatCard label="Total Expenses" value={fmt(totalExpense)} icon={ArrowUpRight} accent="var(--brand-rose)" trend="-3.1%" up />
        <StatCard label="Savings" value={fmt(savings)} icon={TrendingUp} accent="var(--brand-blue)" trend="+18.6%" up />
      </div>

      {/* Chart + breakdown */}
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
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip
                  contentStyle={{ background: "oklch(0.22 0.04 265 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "oklch(0.97 0.01 250)" }}
                />
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} stroke="none">
                  {breakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.22 0.04 265 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {breakdown.map((b) => (
              <div key={b.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: b.color }} />
                <span className="text-muted-foreground">{b.name}</span>
                <span className="ml-auto font-medium">{fmt(b.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budgets + Goals + Quick actions */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold inline-flex items-center gap-2"><Target className="h-4 w-4 text-brand-purple" /> Budget Progress</h3>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">View all</a>
          </div>
          <div className="mt-4 space-y-4">
            {budgets.map((b) => {
              const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
              const over = b.spent > b.limit;
              return (
                <div key={b.cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{b.cat}</span>
                    <span className={over ? "text-brand-rose" : "text-muted-foreground"}>
                      {fmt(b.spent)} / {fmt(b.limit)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? "var(--gradient-rose)" : b.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold inline-flex items-center gap-2"><PiggyBank className="h-4 w-4 text-brand-blue" /> Goals</h3>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">View all</a>
          </div>
          <div className="mt-4 space-y-4">
            {goals.map((g) => {
              const pct = Math.round((g.current / g.target) * 100);
              return (
                <div key={g.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{fmt(g.current)} of {fmt(g.target)}</div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { l: "Add income", i: ArrowDownRight },
              { l: "Add expense", i: ArrowUpRight },
              { l: "New budget", i: Target },
              { l: "New goal", i: PiggyBank },
            ].map((a) => (
              <button key={a.l} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm transition-colors hover:bg-white/[0.06]">
                <a.i className="h-4 w-4 text-brand-purple" />
                <span>{a.l}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-lg p-4" style={{ background: "var(--gradient-primary)" }}>
            <p className="text-sm font-semibold text-white">Savings rate this month</p>
            <p className="mt-1 text-3xl font-bold text-white">{Math.round((savings / totalIncome) * 100)}%</p>
            <p className="mt-1 text-xs text-white/80">Up from 48% last month</p>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold inline-flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-brand-purple" /> Recent Transactions</h3>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground">View all</a>
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
              {txns.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05]">
                        <t.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.cat}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{t.date}</td>
                  <td className={`py-3 pr-4 text-right font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                    {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
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
        <span className={`text-xs font-medium ${up ? "text-success" : "text-brand-rose"}`}>{trend}</span>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
