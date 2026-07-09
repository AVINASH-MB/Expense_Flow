export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 ${className}`}
    />
  );
}

export function LoadingPage({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-64 items-center justify-center gap-3 text-slate-500">
      <Spinner /> {label}
    </div>
  );
}
