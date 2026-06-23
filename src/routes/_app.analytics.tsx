import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { categorySpend, fmtCurrency, monthlyTotals, useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — ExpenseFlow" }] }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["oklch(0.65 0.22 295)", "oklch(0.65 0.18 255)", "oklch(0.66 0.23 12)", "oklch(0.72 0.17 160)", "oklch(0.78 0.15 80)", "oklch(0.7 0.18 200)", "oklch(0.75 0.18 30)"];
const tt = { background: "oklch(0.22 0.04 265 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 } as const;

function AnalyticsPage() {
  const { transactions, budgets, goals } = useStore();

  const now = new Date();
  const monthSpend = useMemo(() => categorySpend(transactions, now.getMonth(), now.getFullYear()), [transactions]);
  const monthly = useMemo(() => monthlyTotals(transactions, 7), [transactions]);
  const breakdown = useMemo(() =>
    Array.from(monthSpend.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
  [monthSpend]);

  const totalIncome = monthly[monthly.length - 1]?.income || 0;
  const totalExpense = monthly[monthly.length - 1]?.expense || 0;
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome ? Math.round((savings / totalIncome) * 100) : 0;

  const budgetPerf = budgets.map((b) => {
    const spent = monthSpend.get(b.category) || 0;
    return { category: b.category, limit: b.limit, spent, pct: Math.round((spent / b.limit) * 100) };
  });

  const goalPerf = goals.map((g) => ({ name: g.name, pct: Math.round((g.current / g.target) * 100) }));

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deep-dive into your financial patterns</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Income (this month)" value={fmtCurrency(totalIncome)} color="var(--success)" />
        <Kpi label="Expenses (this month)" value={fmtCurrency(totalExpense)} color="var(--brand-rose)" />
        <Kpi label="Net savings" value={fmtCurrency(savings)} color="var(--brand-blue)" />
        <Kpi label="Savings rate" value={`${savingsRate}%`} color="var(--brand-purple)" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card-glass p-6 lg:col-span-2">
          <h3 className="font-semibold">Income vs Expense</h3>
          <p className="text-xs text-muted-foreground">Last 7 months</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} formatter={(v: number) => fmtCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="oklch(0.65 0.22 295)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="oklch(0.66 0.23 12)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="font-semibold">Expense Breakdown</h3>
          <p className="text-xs text-muted-foreground">This month</p>
          <div className="mt-2 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3} stroke="none">
                  {breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tt} formatter={(v: number) => fmtCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {breakdown.slice(0, 5).map((b, i) => (
              <div key={b.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-muted-foreground">{b.name}</span>
                <span className="ml-auto font-medium">{fmtCurrency(b.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="font-semibold">Monthly Savings Trend</h3>
        <p className="text-xs text-muted-foreground">Income minus expenses</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer>
            <AreaChart data={monthly.map((m) => ({ ...m, savings: m.income - m.expense }))}>
              <defs>
                <linearGradient id="sv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.17 160)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.72 0.17 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
              <XAxis dataKey="m" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tt} formatter={(v: number) => fmtCurrency(v)} />
              <Area type="monotone" dataKey="savings" stroke="oklch(0.72 0.17 160)" strokeWidth={2} fill="url(#sv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-glass p-6">
          <h3 className="font-semibold">Budget Performance</h3>
          <p className="text-xs text-muted-foreground">Spent vs limit this month</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={budgetPerf} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={tt} formatter={(v: number) => fmtCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="limit" fill="oklch(1 0 0 / 0.08)" radius={[0, 6, 6, 0]} />
                <Bar dataKey="spent" radius={[0, 6, 6, 0]}>
                  {budgetPerf.map((b, i) => <Cell key={i} fill={b.spent > b.limit ? "oklch(0.66 0.23 12)" : "oklch(0.65 0.22 295)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="font-semibold">Goal Progress</h3>
          <p className="text-xs text-muted-foreground">% of target reached</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <LineChart data={goalPerf}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tt} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="pct" stroke="oklch(0.65 0.18 255)" strokeWidth={2} dot={{ fill: "oklch(0.65 0.22 295)", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card-glass p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
