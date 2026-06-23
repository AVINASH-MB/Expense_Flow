import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — ExpenseFlow" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { settings, updateSettings, reseed } = useStore();

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
        <h2 className="font-semibold">Data</h2>
        <p className="mt-1 text-sm text-muted-foreground">Reset all transactions, budgets, goals and notifications to the demo seed.</p>
        <button
          onClick={() => { if (confirm("Reset all demo data?")) { reseed(); toast.success("Data reset"); } }}
          className="mt-4 rounded-lg border border-brand-rose/40 px-4 py-2 text-sm text-brand-rose hover:bg-brand-rose/10"
        >Reset demo data</button>
      </section>
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
