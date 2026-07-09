import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/format";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className, id, children, ...rest }, ref,
) {
  const sid = id || rest.name;
  return (
    <label className="block" htmlFor={sid}>
      {label && <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
      <select
        ref={ref}
        id={sid}
        className={cn(
          "w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900",
          "px-3 text-sm text-slate-900 dark:text-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-brand-500",
          error && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
