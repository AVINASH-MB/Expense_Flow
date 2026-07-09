import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { LoadingPage } from "@/components/ui/Spinner";
import { AnalyticsAPI } from "@/services/endpoints";

export function AnalyticsPage() {
  const [byCat, setByCat] = useState<{ category: string; type: string; total: number }[] | null>(null);
  const [trend, setTrend] = useState<{ month: string; income: number; expense: number }[] | null>(null);
  useEffect(() => {
    AnalyticsAPI.byCategory().then(setByCat);
    AnalyticsAPI.trend().then(setTrend);
  }, []);
  if (!byCat || !trend) return <LoadingPage />;
  const expenseByCat = byCat.filter((x) => x.type === "expense");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <Card>
        <CardHeader title="Income vs Expense trend" />
        <ExpenseChart data={trend} />
      </Card>
      <Card>
        <CardHeader title="Expenses by category" />
        <CategoryChart data={expenseByCat.map((c) => ({ category: c.category, total: c.total }))} />
      </Card>
    </div>
  );
}
