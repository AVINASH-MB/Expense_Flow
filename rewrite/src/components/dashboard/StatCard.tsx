import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label, value, icon, hint, tone = "brand",
}: { label: string; value: ReactNode; icon: ReactNode; hint?: string; tone?: "brand" | "success" | "danger" }) {
  const bg =
    tone === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
    tone === "danger"  ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" :
                         "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-500";
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${bg}`}>{icon}</div>
      </div>
    </Card>
  );
}
