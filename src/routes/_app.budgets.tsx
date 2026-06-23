import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Target, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, categorySpend, fmtCurrency, useStore, type Budget } from "@/lib/store";

export const Route = createFileRoute("/_app/budgets")({
  head: () => ({ meta: [{ title: "Budgets — ExpenseFlow" }] }),
  component: BudgetsPage,
});

function BudgetsPage() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const now = new Date();
  const spendMap = useMemo(() => categorySpend(transactions, now.getMonth(), now.getFullYear()), [transactions]);

  const totals = budgets.reduce((acc, b) => {
    const s = spendMap.get(b.category) || 0;
    acc.limit += b.limit; acc.spent += s; if (s > b.limit) acc.over += 1;
    return acc;
  }, { limit: 0, spent: 0, over: 0 });

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monthly spending limits by category</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg btn-primary px-4 py-2.5 text-sm font-semibold">
          <Plus className="h-4 w-4" /> New budget
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary label="Total budgeted" value={fmtCurrency(totals.limit)} />
        <Summary label="Spent this month" value={fmtCurrency(totals.spent)} accent={totals.spent > totals.limit ? "var(--brand-rose)" : "var(--brand-purple)"} />
        <Summary label="Categories over limit" value={String(totals.over)} accent={totals.over ? "var(--brand-rose)" : "var(--success)"} />
      </div>

      {totals.over > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-brand-rose" />
          <div>
            <p className="font-semibold text-brand-rose">Budget exceeded</p>
            <p className="text-muted-foreground">You've gone over budget in {totals.over} {totals.over === 1 ? "category" : "categories"} this month. Check Notifications for details.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.length === 0 && (
          <div className="card-glass col-span-full p-10 text-center">
            <Target className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No budgets yet. Create one to start tracking.</p>
          </div>
        )}
        {budgets.map((b) => {
          const spent = spendMap.get(b.category) || 0;
          const pct = Math.min(100, Math.round((spent / b.limit) * 100));
          const over = spent > b.limit;
          const remaining = b.limit - spent;
          return (
            <div key={b.id} className="card-glass p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{b.category}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{b.period}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(b); setOpen(true); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { if (confirm("Delete this budget?")) { deleteBudget(b.id); toast.success("Deleted"); } }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand-rose/15 hover:text-brand-rose"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold">{fmtCurrency(spent)}</span>
                <span className="text-sm text-muted-foreground">of {fmtCurrency(b.limit)}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? "var(--gradient-rose)" : "var(--gradient-primary)" }} />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className={over ? "text-brand-rose font-medium" : "text-muted-foreground"}>{pct}% used</span>
                <span className={over ? "text-brand-rose font-medium" : "text-success"}>
                  {over ? `Over by ${fmtCurrency(-remaining)}` : `${fmtCurrency(remaining)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <BudgetDialog
          initial={editing}
          existing={budgets.map((b) => b.category)}
          onClose={() => setOpen(false)}
          onSave={(b) => {
            if (editing) { updateBudget(editing.id, b); toast.success("Budget updated"); }
            else { addBudget(b); toast.success("Budget created"); }
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

function BudgetDialog({ initial, existing, onClose, onSave }: { initial: Budget | null; existing: string[]; onClose: () => void; onSave: (b: Omit<Budget, "id">) => void }) {
  const available = CATEGORIES.filter((c) => c !== "Income" && (initial?.category === c || !existing.includes(c)));
  const [category, setCategory] = useState(initial?.category || available[0] || "Groceries");
  const [limit, setLimit] = useState(initial?.limit?.toString() || "");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(limit);
    if (!l || l <= 0) { toast.error("Enter a positive limit"); return; }
    onSave({ category, limit: l, period: "monthly" });
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? "Edit budget" : "New budget"}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm">
              {available.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Monthly limit (USD)</span>
            <input type="number" step="1" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-purple/60" placeholder="500" />
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
