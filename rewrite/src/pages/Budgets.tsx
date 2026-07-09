import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { BudgetForm } from "@/components/forms/BudgetForm";
import { BudgetsAPI, CategoriesAPI } from "@/services/endpoints";
import { useSettings } from "@/context/SettingsContext";
import type { Budget, Category } from "@/types";

export function BudgetsPage() {
  const { format } = useSettings();
  const [rows, setRows] = useState<Budget[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const load = () => BudgetsAPI.list().then(setRows);
  useEffect(() => { load(); CategoriesAPI.list().then(setCats).catch(() => setCats([])); }, []);
  const catNames = useMemo(() => cats.length ? cats.map((c) => c.name) : ["General", "Food", "Transport"], [cats]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((b) => (
          <Card key={b.id}>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-slate-500">{b.period}</p>
                <p className="font-semibold">{b.category}</p>
              </div>
              <button onClick={() => BudgetsAPI.remove(b.id).then(load)} className="p-1 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-2xl font-semibold text-brand-600">{format(b.limit)}</p>
          </Card>
        ))}
        {rows.length === 0 && <Card><p className="text-center text-slate-500">No budgets yet</p></Card>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add budget">
        <BudgetForm categories={catNames} onSubmit={async (v) => { await BudgetsAPI.create(v); setOpen(false); load(); }} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
