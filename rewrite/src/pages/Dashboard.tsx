import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { LoadingPage } from "@/components/ui/Spinner";
import { DashboardAPI } from "@/services/endpoints";
import { useSettings } from "@/context/SettingsContext";
import { formatDate } from "@/utils/format";
import type { DashboardData } from "@/types";

export function DashboardPage() {
  const { format } = useSettings();
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { DashboardAPI.get().then(setData).catch(() => setData(null)); }, []);
  if (!data) return <LoadingPage />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Balance" value={format(data.totals.balance)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Income"  value={format(data.totals.income)}  icon={<ArrowUpRight className="h-5 w-5" />} tone="success" />
        <StatCard label="Expense" value={format(data.totals.expense)} icon={<ArrowDownRight className="h-5 w-5" />} tone="danger" />
      </div>
      <Card>
        <CardHeader title="Income vs Expense" subtitle="Last 12 months" />
        <TrendChart data={data.monthly} />
      </Card>
      <Card>
        <CardHeader title="Recent transactions" />
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {data.recent.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-slate-500">{t.category} · {formatDate(t.date)}</p>
              </div>
              <span className={t.type === "income" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                {t.type === "income" ? "+" : "-"}{format(t.amount)}
              </span>
            </li>
          ))}
          {data.recent.length === 0 && <li className="py-6 text-center text-slate-500">No transactions yet</li>}
        </ul>
      </Card>
    </div>
  );
}
