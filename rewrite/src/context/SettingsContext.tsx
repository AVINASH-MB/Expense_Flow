import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { SettingsAPI } from "@/services/endpoints";
import { useAuth } from "./AuthContext";
import type { Settings } from "@/types";
import { formatCurrency as fmt } from "@/utils/currency";

const DEFAULTS: Settings = {
  emailBudgetAlerts: true, emailGoalAlerts: true,
  emailWeeklyDigest: false, emailProductUpdates: false,
  currency: "USD", theme: "system",
};

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => Promise<void>;
  format: (amount: number) => string;
}
const SettingsCtx = createContext<Ctx | undefined>(undefined);
const LS_CURRENCY = "expenseflow.currency";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    ...DEFAULTS,
    currency: localStorage.getItem(LS_CURRENCY) || DEFAULTS.currency,
  });

  useEffect(() => {
    if (!user) return;
    SettingsAPI.get().then((s) => {
      setSettings(s);
      localStorage.setItem(LS_CURRENCY, s.currency);
    }).catch(() => {});
  }, [user]);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const next = await SettingsAPI.update(patch);
    setSettings(next);
    localStorage.setItem(LS_CURRENCY, next.currency);
  }, []);

  const format = useCallback((amount: number) => fmt(amount, settings.currency), [settings.currency]);

  return <SettingsCtx.Provider value={{ settings, update, format }}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const v = useContext(SettingsCtx);
  if (!v) throw new Error("useSettings must be within SettingsProvider");
  return v;
}
