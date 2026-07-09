import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/format";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className, id, ...rest }, ref,
) {
  const inputId = id || rest.name;
  return (
    <label className="block" htmlFor={inputId}>
      {label && <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900",
          "px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          error && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
