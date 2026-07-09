import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import { Select } from "@/components/ui/Select";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { SettingsAPI } from "@/services/endpoints";

export function SettingsPage() {
  const { settings, update } = useSettings();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const nav = useNavigate();
  const [delOpen, setDelOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    setBusy(true);
    try { await SettingsAPI.deleteAccount(); await logout(); nav("/login", { replace: true }); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader title="Preferred currency" subtitle="Used everywhere monetary values are shown" />
        <CurrencySelect value={settings.currency} onChange={(c) => update({ currency: c })} />
      </Card>

      <Card>
        <CardHeader title="Appearance" />
        <Select value={theme} onChange={(e) => { const t = e.target.value as any; setTheme(t); update({ theme: t }).catch(() => {}); }}>
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>
      </Card>

      <Card>
        <CardHeader title="Email notifications" />
        {[
          ["emailBudgetAlerts", "Budget alerts"],
          ["emailGoalAlerts", "Goal alerts"],
          ["emailWeeklyDigest", "Weekly digest"],
          ["emailProductUpdates", "Product updates"],
        ].map(([k, label]) => (
          <label key={k} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-200 dark:border-slate-800">
            <span>{label}</span>
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={(settings as any)[k]}
              onChange={(e) => update({ [k]: e.target.checked } as any)}
            />
          </label>
        ))}
      </Card>

      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader title="Danger zone" subtitle="Permanently delete your account and data" />
        <Button variant="danger" onClick={() => setDelOpen(true)}>Delete account</Button>
      </Card>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title="Delete account?">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This will permanently delete your account, transactions, budgets, goals and receipts. This cannot be undone.
        </p>
        <p className="mt-3 text-sm">Type <b>DELETE</b> to confirm:</p>
        <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2" />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
          <Button variant="danger" disabled={confirm !== "DELETE"} loading={busy} onClick={deleteAccount}>Delete forever</Button>
        </div>
      </Modal>
    </div>
  );
}
