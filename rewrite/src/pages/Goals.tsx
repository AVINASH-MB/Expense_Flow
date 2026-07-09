import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { GoalForm } from "@/components/forms/GoalForm";
import { GoalsAPI } from "@/services/endpoints";
import { useSettings } from "@/context/SettingsContext";
import type { Goal } from "@/types";

export function GoalsPage() {
  const { format } = useSettings();
  const [rows, setRows] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const load = () => GoalsAPI.list().then(setRows);
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Goals</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((g) => {
          const pct = Math.min(100, Math.round((g.current / (g.target || 1)) * 100));
          return (
            <Card key={g.id}>
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-sm text-slate-500">
                    {format(g.current)} of {format(g.target)}
                    {g.deadline && <> · by {g.deadline}</>}
                  </p>
                </div>
                <button onClick={() => GoalsAPI.remove(g.id).then(load)} className="p-1 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{pct}% complete</p>
            </Card>
          );
        })}
        {rows.length === 0 && <Card><p className="text-center text-slate-500">No goals yet</p></Card>}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add goal">
        <GoalForm onSubmit={async (v) => { await GoalsAPI.create(v); setOpen(false); load(); }} onCancel={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
