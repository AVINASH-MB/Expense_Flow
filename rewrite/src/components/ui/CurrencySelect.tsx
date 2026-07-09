import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { CURRENCIES, findCurrency } from "@/utils/currency";
import { cn } from "@/utils/format";

interface Props {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function CurrencySelect({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = findCurrency(value);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return CURRENCIES;
    return CURRENCIES.filter((c) =>
      c.name.toLowerCase().includes(t) || c.code.toLowerCase().includes(t) || c.symbol.includes(t),
    );
  }, [q]);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-slate-300 dark:border-slate-700",
          "bg-white dark:bg-slate-900 h-10 px-3 text-sm",
        )}
      >
        <span className="flex items-center gap-2">
          <span className="text-lg leading-none">{current.flag}</span>
          <span className="font-medium">{current.symbol}</span>
          <span className="text-slate-600 dark:text-slate-300">{current.name}</span>
          <span className="text-slate-400">({current.code})</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search currency…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-auto py-1">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setQ(""); }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span className="font-medium w-8">{c.symbol}</span>
                    <span>{c.name}</span>
                    <span className="text-slate-400">({c.code})</span>
                  </span>
                  {c.code === value && <Check className="h-4 w-4 text-brand-600" />}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-slate-500">No match</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
