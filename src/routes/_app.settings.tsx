import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, ChevronsUpDown, Search, ShieldAlert, X } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useStore } from "@/lib/store";
import { CURRENCIES, findCurrency } from "@/lib/currencies";
import { apiEnabled } from "@/lib/api";
import { AuthAPI } from "@/lib/api-services";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — ExpenseFlow" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useAuth();
  const { settings, updateSettings, reseed, clearAll } = useStore();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <section className="card-glass p-6">
        <h2 className="font-semibold">Profile</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name" value={user?.name || ""} />
          <Field label="Email" value={user?.email || ""} />
          <Field label="Role" value={user?.role || ""} />
          <Field label="User ID" value={user?.id || ""} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Tip: sign in with an email containing "admin" to access the admin panel.</p>
      </section>

      <section className="card-glass p-6">
        <h2 className="font-semibold">Email notifications</h2>
        <div className="mt-4 space-y-3">
          {([
            ["emailBudgetAlerts", "Budget exceeded alerts"],
            ["emailGoalAlerts", "Goal achievement alerts"],
            ["emailWeeklyDigest", "Weekly spending digest"],
            ["emailProductUpdates", "Product updates & tips"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <span className="text-sm">{label}</span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[oklch(0.65_0.22_295)]"
                checked={settings[key]}
                onChange={(e) => { updateSettings({ [key]: e.target.checked } as any); toast.success("Saved"); }}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="card-glass p-6">
        <h2 className="font-semibold">Preferred currency</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applied across the dashboard, transactions, budgets, goals, analytics, and exports.
        </p>
        <div className="mt-4 max-w-sm">
          <CurrencyPicker
            value={settings.currency}
            onChange={(code) => { updateSettings({ currency: code }); toast.success(`Currency set to ${code}`); }}
          />
        </div>
      </section>

      <section className="card-glass p-6">
        <h2 className="font-semibold">Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Reset restores the demo seed. Clear wipes everything — including the demo data — and won't re-seed on reload.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => { if (confirm("Reset all data to the demo seed?")) { reseed(); toast.success("Demo data restored"); } }}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
          >Reset to demo</button>
          <button
            onClick={async () => {
              if (!confirm("Delete ALL your transactions, budgets, goals and notifications? This cannot be undone.")) return;
              await clearAll();
              toast.success("All data cleared");
            }}
            className="rounded-lg border border-brand-rose/40 px-4 py-2 text-sm text-brand-rose hover:bg-brand-rose/10"
          >Clear all data</button>
        </div>
      </section>

      <section className="card-glass p-6 border border-brand-rose/40">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-rose/15 text-brand-rose">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-brand-rose">Danger zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              onClick={() => setDeleteOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-brand-rose/50 bg-brand-rose/10 px-4 py-2 text-sm font-semibold text-brand-rose hover:bg-brand-rose/20"
            >
              <AlertTriangle className="h-4 w-4" /> Delete account
            </button>
          </div>
        </div>
      </section>

      {deleteOpen && (
        <DeleteAccountDialog
          onClose={() => setDeleteOpen(false)}
          onConfirmed={async () => {
            await clearAll();
            logout();
            toast.success("Account deleted");
            // hard navigate so all in-memory state is reset
            window.location.assign("/login");
          }}
        />
      )}
    </div>
  );
}

function CurrencyPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = findCurrency(value);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CURRENCIES;
    return CURRENCIES.filter((c) =>
      c.code.toLowerCase().includes(s) ||
      c.name.toLowerCase().includes(s) ||
      c.symbol.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm hover:bg-white/[0.06]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-lg leading-none">{selected.flag}</span>
          <span className="truncate">{selected.name}</span>
          <span className="text-muted-foreground">({selected.code})</span>
          <span className="text-muted-foreground">{selected.symbol}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[oklch(0.18_0.04_265)] shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search currency…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul className="max-h-72 overflow-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-xs text-muted-foreground">No currencies found</li>
              )}
              {filtered.map((c) => {
                const active = c.code === value;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => { onChange(c.code); setOpen(false); setQ(""); }}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-white/[0.06] ${active ? "bg-white/[0.04]" : ""}`}
                    >
                      <span className="text-lg leading-none">{c.flag}</span>
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.code}</span>
                      <span className="w-8 text-right text-muted-foreground">{c.symbol}</span>
                      {active && <Check className="h-4 w-4 text-brand-purple" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function DeleteAccountDialog({ onClose, onConfirmed }: { onClose: () => void; onConfirmed: () => void | Promise<void> }) {
  const useApi = apiEnabled();
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirm === "DELETE" && (!useApi || password.length > 0) && !pending;

  const handleDelete = async () => {
    setError(null);
    setPending(true);
    try {
      if (useApi) {
        await AuthAPI.deleteAccount(password);
      }
      await onConfirmed();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? "Failed to delete account");
      setPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in-0"
      onClick={() => !pending && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl glass-strong border border-brand-rose/30 p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-rose/15 text-brand-rose">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">Delete account</h2>
            <p className="mt-1 text-xs text-muted-foreground">This action is permanent.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06] disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 rounded-lg border border-brand-rose/30 bg-brand-rose/5 p-3 text-sm text-brand-rose">
          Deleting your account is permanent. All transactions, budgets, reports, categories, AI history, and profile
          data will be permanently removed. This action cannot be undone.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Type <span className="font-mono text-brand-rose">DELETE</span> to confirm
            </span>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              disabled={pending}
              className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-rose/60"
              placeholder="DELETE"
            />
          </label>
          {useApi && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirm with password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={pending}
                className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-brand-rose/60"
                placeholder="Your password"
              />
            </label>
          )}
          {error && <p className="text-xs text-brand-rose">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-rose px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-rose/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {pending ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">{value || "—"}</p>
    </div>
  );
}
