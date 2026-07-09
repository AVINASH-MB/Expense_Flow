import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { CategoriesAPI, TxAPI } from "@/services/endpoints";
import { useSettings } from "@/context/SettingsContext";
import { formatDate } from "@/utils/format";
import type { Category, Transaction } from "@/types";

export function TransactionsPage() {
  const { format } = useSettings();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [typeFilter, setType] = useState<string>("");
  const [open, setOpen] = useState(false);

  const load = () => TxAPI.list().then(setRows);
  useEffect(() => { load(); CategoriesAPI.list().then(setCats).catch(() => setCats([])); }, []);

  const catNames = useMemo(
    () => Array.from(new Set([...cats.map((c) => c.name), "General", "Food", "Transport", "Salary"])),
    [cats],
  );
  const filtered = useMemo(() => rows.filter((r) =>
    (!typeFilter || r.type === typeFilter) &&
    (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.category.toLowerCase().includes(q.toLowerCase())),
  ), [rows, typeFilter, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      <Card>
        <div className="mb-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={typeFilter} onChange={(e) => setType(e.target.value)} className="md:w-40">
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th className="py-2">Name</th><th>Category</th><th>Date</th><th className="text-right">Amount</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 font-medium">{t.name}</td>
                  <td><Badge>{t.category}</Badge></td>
                  <td>{formatDate(t.date)}</td>
                  <td className={"text-right " + (t.type === "income" ? "text-emerald-600" : "text-red-600")}>
                    {t.type === "income" ? "+" : "-"}{format(t.amount)}
                  </td>
                  <td className="text-right">
                    <button onClick={() => TxAPI.remove(t.id).then(load)} className="p-1 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-slate-500">No transactions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add transaction">
        <TransactionForm
          categories={catNames}
          onSubmit={async (v) => { await TxAPI.create(v); setOpen(false); load(); }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
