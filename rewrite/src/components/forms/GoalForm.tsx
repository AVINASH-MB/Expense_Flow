import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Goal } from "@/types";

interface Props {
  initial?: Partial<Goal>;
  onSubmit: (g: Omit<Goal, "id">) => Promise<void> | void;
  onCancel?: () => void;
}

export function GoalForm({ initial, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Omit<Goal, "id">>({
    defaultValues: {
      name: initial?.name || "",
      target: initial?.target ?? 0,
      current: initial?.current ?? 0,
      deadline: initial?.deadline,
    },
  });
  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (v) => { await onSubmit(v); })}>
      <Input label="Name" error={errors.name?.message}
        {...register("name", { required: "Required" })} />
      <div className="grid grid-cols-2 gap-3">
        <Input type="number" step="0.01" label="Target" error={errors.target?.message}
          {...register("target", { required: "Required", valueAsNumber: true, min: 0 })} />
        <Input type="number" step="0.01" label="Saved so far"
          {...register("current", { valueAsNumber: true, min: 0 })} />
      </div>
      <Input type="date" label="Deadline (optional)" {...register("deadline")} />
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={isSubmitting}>Save</Button>
      </div>
    </form>
  );
}
