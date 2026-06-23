import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Check, Trash2, AlertTriangle, Trophy, Info, Mail } from "lucide-react";
import { toast } from "sonner";
import { useStore, type Notification } from "@/lib/store";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ExpenseFlow" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { notifications, settings, markNotificationRead, markAllRead, deleteNotification, updateSettings } = useStore();
  const [filter, setFilter] = useState<"all" | "unread" | Notification["type"]>("all");

  const list = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const icon = (t: Notification["type"]) => t === "budget" ? AlertTriangle : t === "goal" ? Trophy : Info;
  const tone = (t: Notification["type"]) => t === "budget" ? "text-brand-rose bg-brand-rose/15" : t === "goal" ? "text-yellow-400 bg-yellow-400/15" : "text-brand-blue bg-brand-blue/15";

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Budget alerts, goal milestones, and system updates</p>
        </div>
        <button onClick={() => { markAllRead(); toast.success("All marked as read"); }} className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2.5 text-sm font-medium">
          <Check className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex gap-1 overflow-x-auto">
            {(["all", "unread", "budget", "goal", "system"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:bg-white/[0.04]"}`}>
                {f}
              </button>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="card-glass p-12 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No notifications.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {list.map((n) => {
                const Icon = icon(n.type);
                return (
                  <li key={n.id} className={`card-glass flex items-start gap-3 p-4 ${!n.read ? "border-brand-purple/30" : ""}`}>
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone(n.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{n.title}</p>
                        {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-purple" />}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.message.replace(/\s*\[[^\]]+\]\s*$/, "")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(n.date).toLocaleString()}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!n.read && (
                        <button onClick={() => markNotificationRead(n.id)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]" aria-label="Mark read">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand-rose/15 hover:text-brand-rose" aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card-glass h-fit p-5">
          <h3 className="font-semibold inline-flex items-center gap-2"><Mail className="h-4 w-4 text-brand-purple" /> Email preferences</h3>
          <p className="mt-1 text-xs text-muted-foreground">Choose which alerts get emailed to you.</p>
          <div className="mt-4 space-y-3">
            <Toggle
              checked={settings.emailBudgetAlerts}
              onChange={(v) => { updateSettings({ emailBudgetAlerts: v }); toast.success("Saved"); }}
              label="Budget exceeded alerts"
              desc="Email me when a category goes over budget."
            />
            <Toggle
              checked={settings.emailGoalAlerts}
              onChange={(v) => { updateSettings({ emailGoalAlerts: v }); toast.success("Saved"); }}
              label="Goal milestones"
              desc="Email me when I reach a savings goal."
            />
            <Toggle
              checked={settings.emailWeeklyDigest}
              onChange={(v) => { updateSettings({ emailWeeklyDigest: v }); toast.success("Saved"); }}
              label="Weekly digest"
              desc="A summary of spending every Monday."
            />
            <Toggle
              checked={settings.emailProductUpdates}
              onChange={(v) => { updateSettings({ emailProductUpdates: v }); toast.success("Saved"); }}
              label="Product updates"
              desc="New features and tips from ExpenseFlow."
            />
          </div>
          <Link to="/settings" className="mt-5 inline-flex text-xs text-brand-purple hover:underline">Manage all settings →</Link>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-purple" : "bg-white/10"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
