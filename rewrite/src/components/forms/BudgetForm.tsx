import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Budget } from "@/types";

interface Props {
  categories: string[];
  initial?: Partial<Budget>;
  onSubmit: (b: Omit<Budget, "id">) => Promise<void> | void;
  onCancel?: () => void;
}

export function BudgetForm({ categories, initial, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Omit<Budget, "id">>({
    defaultValues: {
      category: initial?.category || categories[0] || "General",
      limit: initial?.limit ?? 0,
      period: initial?.period || "monthly",
    },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (v) => { await onSubmit(v); })}>
      <Select label="Category" {...register("category", { required: true })}>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </Select>
      <Input type="number" step="0.01" label="Limit" error={errors.limit?.message}
        {...register("limit", { required: "Required", valueAsNumber: true, min: 0 })} />
      <Select label="Period" {...register("period")}>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </Select>
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={isSubmitting}>Save</Button>
      </div>
    </form>
  );
}
