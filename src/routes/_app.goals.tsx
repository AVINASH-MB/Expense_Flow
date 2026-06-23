import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, PiggyBank, X, Trophy } from "lucide-react";
import { toast } from "sonner";
import { fmtCurrency, useStore, type Goal } from "@/lib/store";

export const Route = createFileRoute("/_app/goals")({
  head: () => ({ meta: [{ title: "Goals — ExpenseFlow" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const totals = goals.reduce((acc, g) => {
    acc.target += g.target; acc.current += g.current;
    if (g.current >= g.target) acc.achieved += 1;
    return acc;
  }, { target: 0, current: 0, achieved: 0 });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Savings Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track progress toward what matters</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg btn-primary px-4 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" /> New goal
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Total saved" value={fmtCurrency(totals.current)} />
        <Summary label="Total target" value={fmtCurrency(totals.target)} />
        <Summary label="Goals achieved" value={`${totals.achieved} / ${goals.length}`} accent="var(--success)" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.length === 0 && (
          <div className="card-glass col-span-full p-10 text-center">
            <PiggyBank className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No goals yet. Set one to start saving.</p>
          </div>
        )}
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          const done = g.current >= g.target;
          return (
            <div key={g.id} className="card-glass p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{g.name}</h3>
                    {done && <Trophy className="h-4 w-4 text-yellow-400" />}
                  </div>
                  {g.deadline && <p className="mt-0.5 text-xs text-muted-foreground">By {g.deadline}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => { setEditing(g); setOpen(true); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { if (confirm("Delete this goal?")) { deleteGoal(g.id); toast.success("Deleted"); } }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand-rose/15 hover:text-brand-rose"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold">{fmtCurrency(g.current)}</span>
                <span className="text-sm text-muted-foreground">of {fmtCurrency(g.target)}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: done ? "linear-gradient(135deg, oklch(0.72 0.17 160), oklch(0.65 0.18 255))" : "var(--gradient-primary)" }} />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-muted-foreground">{pct}%</span>
                <span className={done ? "text-success font-medium" : "text-muted-foreground"}>
                  {done ? "Goal achieved!" : `${fmtCurrency(g.target - g.current)} to go`}
                </span>
              </div>
              {!done && (
                <button
                  onClick={() => { const v = prompt(`Add to ${g.name} (USD)`); const n = v ? parseFloat(v) : 0; if (n > 0) { updateGoal(g.id, { current: g.current + n }); toast.success("Contribution added"); } }}
                  className="mt-4 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium hover:bg-white/[0.06]"
                >+ Add contribution</button>
              )}
            </div>
          );
        })}
      </div>

      {open && (
        <GoalDialog
          initial={editing}
          onClose={() => setOpen(false)}
          onSave={(g) => {
            if (editing) { updateGoal(editing.id, g); toast.success("Goal updated"); }
            else { addGoal(g); toast.success("Goal created"); }
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card-glass p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={accent ? { color: accent } : undefined}>{value}</p>
    </div>
  );
}

function GoalDialog({ initial, onClose, onSave }: { initial: Goal | null; onClose: () => void; onSave: (g: Omit<Goal, "id">) => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [target, setTarget] = useState(initial?.target?.toString() || "");
  const [current, setCurrent] = useState(initial?.current?.toString() || "0");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tg = parseFloat(target); const cur = parseFloat(current) || 0;
    if (!name.trim() || !tg || tg <= 0) { toast.error("Enter a name and positive target"); return; }
    onSave({ name: name.trim(), target: tg, current: cur, deadline: deadline || undefined });
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? "Edit goal" : "New goal"}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Goal name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-purple/60" placeholder="e.g. Emergency Fund" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Target (USD)</span>
              <input type="number" min="0" step="1" value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" placeholder="10000" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Saved so far</span>
              <input type="number" min="0" step="1" value={current} onChange={(e) => setCurrent(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" placeholder="0" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Deadline (optional)</span>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm">Cancel</button>
          <button type="submit" className="rounded-lg btn-primary px-4 py-2 text-sm font-semibold">{initial ? "Save" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
