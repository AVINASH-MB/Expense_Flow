import { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { LoadingPage } from "@/components/ui/Spinner";
import { TxAPI } from "@/services/endpoints";
import { useSettings } from "@/context/SettingsContext";
import { formatDate } from "@/utils/format";
import type { Transaction } from "@/types";

export function IncomePage() {
  const { format } = useSettings();
  const [rows, setRows] = useState<Transaction[] | null>(null);
  useEffect(() => { TxAPI.list({ type: "income" }).then(setRows); }, []);
  if (!rows) return <LoadingPage />;
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Income</h1>
      <Card>
        <CardHeader title="Total income" subtitle={`${rows.length} entries`} />
        <p className="text-3xl font-semibold text-emerald-600">{format(total)}</p>
      </Card>
      <Card>
        <CardHeader title="All income" />
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((r) => (
            <li key={r.id} className="flex justify-between py-3">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-slate-500">{r.category} · {formatDate(r.date)}</p>
              </div>
              <span className="text-emerald-600 font-medium">+{format(r.amount)}</span>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-slate-500">No income yet</li>}
        </ul>
      </Card>
    </div>
  );
}
