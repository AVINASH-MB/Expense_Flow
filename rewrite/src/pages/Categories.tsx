import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { CategoriesAPI } from "@/services/endpoints";
import type { Category, TxType } from "@/types";

export function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const load = () => CategoriesAPI.list().then(setRows);
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <Card>
        <CardHeader title="Create category" />
        <form className="flex flex-col md:flex-row gap-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await CategoriesAPI.create({ name: name.trim(), type });
          setName(""); load();
        }}>
          <Input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Select value={type} onChange={(e) => setType(e.target.value as TxType)} className="md:w-40">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Button type="submit"><Plus className="h-4 w-4" /> Add</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Your categories" />
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.name}</span>
                <Badge tone={c.type === "income" ? "success" : "neutral"}>{c.type}</Badge>
              </div>
              <button onClick={() => CategoriesAPI.remove(c.id).then(load)} className="p-1 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-center text-slate-500">No categories</li>}
        </ul>
      </Card>
    </div>
  );
}
