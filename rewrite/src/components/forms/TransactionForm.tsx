import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Transaction } from "@/types";

interface Props {
  categories: string[];
  initial?: Partial<Transaction>;
  onSubmit: (t: Omit<Transaction, "id">) => Promise<void> | void;
  onCancel?: () => void;
}

type FormValues = Omit<Transaction, "id">;

export function TransactionForm({ categories, initial, onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      name: initial?.name || "",
      category: initial?.category || categories[0] || "General",
      type: initial?.type || "expense",
      amount: initial?.amount ?? 0,
      date: initial?.date || today,
      note: initial?.note || "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (v) => { await onSubmit(v); })}>
      <Input label="Description" error={errors.name?.message}
        {...register("name", { required: "Required" })} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Type" {...register("type")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
        <Select label="Category" {...register("category")}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" step="0.01" label="Amount" error={errors.amount?.message}
          {...register("amount", { required: "Required", valueAsNumber: true, min: { value: 0.01, message: "Must be positive" } })} />
        <Input type="date" label="Date" {...register("date", { required: true })} />
      </div>
      <Input label="Note (optional)" {...register("note")} />
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={isSubmitting}>Save</Button>
      </div>
    </form>
  );
}
