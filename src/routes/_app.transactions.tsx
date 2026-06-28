import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Download, FileText, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, fmtCurrency, getActiveCurrency, useStore, type Transaction, type TxnType } from "@/lib/store";
import { exportTransactionsCsv, exportTransactionsPdf } from "@/lib/exporters";
import { findCurrency } from "@/lib/currencies";

export const Route = createFileRoute("/_app/transactions")({
  head: () => ({ meta: [{ title: "Transactions — ExpenseFlow" }] }),
  component: TransactionsPage,
});

const PAGE_SIZE = 10;

function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [type, setType] = useState<"all" | TxnType>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (q ? t.name.toLowerCase().includes(q.toLowerCase()) || t.category.toLowerCase().includes(q.toLowerCase()) : true))
      .filter((t) => (cat === "all" ? true : t.category === cat))
      .filter((t) => (type === "all" ? true : t.type === type))
      .filter((t) => (from ? t.date >= from : true))
      .filter((t) => (to ? t.date <= to : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, q, cat, type, from, to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportCSV = () => {
    exportTransactionsCsv(filtered);
    const cur = findCurrency(getActiveCurrency());
    toast.success(`Exported ${filtered.length} transactions as ${cur.code} CSV`);
  };

  const exportPDF = () => {
    exportTransactionsPdf(filtered);
    const cur = findCurrency(getActiveCurrency());
    toast.success(`Exported ${filtered.length} transactions as ${cur.code} PDF`);
  };


  const reset = () => { setQ(""); setCat("all"); setType("all"); setFrom(""); setTo(""); };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} of {transactions.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2.5 text-sm font-medium">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={exportPDF} className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2.5 text-sm font-medium">
            <FileText className="h-4 w-4" /> Export PDF
          </button>
          <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg btn-primary px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      <div className="card-glass p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search transactions…"
              className="w-full rounded-lg bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand-purple/60" />
          </div>
          <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={type} onChange={(e) => { setType(e.target.value as any); setPage(1); }} className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm">
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" />
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" />
          <button onClick={reset} className="rounded-lg border border-white/10 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">Reset</button>
        </div>
      </div>

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paged.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">No transactions match your filters.</td></tr>
              )}
              {paged.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{t.date}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-8 w-8 place-items-center rounded-lg ${t.type === "income" ? "bg-success/15 text-success" : "bg-brand-rose/15 text-brand-rose"}`}>
                        {t.type === "income" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <span className="font-medium">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{t.category}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${t.type === "income" ? "text-success" : ""}`}>
                    {t.type === "income" ? "+" : "-"}{fmtCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => { setEditing(t); setOpen(true); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]" aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { if (confirm("Delete this transaction?")) { deleteTransaction(t.id); toast.success("Deleted"); } }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand-rose/15 hover:text-brand-rose" aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-sm">
            <span className="text-muted-foreground">Page {safePage} of {totalPages}</span>
            <div className="flex gap-1">
              <button disabled={safePage === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs disabled:opacity-40">Previous</button>
              <button disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {open && (
        <TxnDialog
          initial={editing}
          onClose={() => setOpen(false)}
          onSave={(t) => {
            if (editing) { updateTransaction(editing.id, t); toast.success("Updated"); }
            else { addTransaction(t); toast.success("Added"); }
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TxnDialog({ initial, onClose, onSave }: { initial: Transaction | null; onClose: () => void; onSave: (t: Omit<Transaction, "id">) => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || "Groceries");
  const [type, setType] = useState<TxnType>(initial?.type || "expense");
  const [amount, setAmount] = useState(initial?.amount?.toString() || "");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(initial?.note || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || !amt || amt <= 0) { toast.error("Enter a name and a positive amount"); return; }
    onSave({ name: name.trim(), category, type, amount: amt, date, note: note.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md rounded-2xl glass-strong p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{initial ? "Edit transaction" : "New transaction"}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 space-y-3">
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-purple/60" placeholder="e.g. Whole Foods" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as TxnType)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </Field>
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (USD)"><input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-purple/60" placeholder="0.00" /></Field>
            <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" /></Field>
          </div>
          <Field label="Note (optional)"><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-purple/60" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm">Cancel</button>
          <button type="submit" className="rounded-lg btn-primary px-4 py-2 text-sm font-semibold">{initial ? "Save" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
