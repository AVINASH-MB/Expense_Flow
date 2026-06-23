import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shield, Users, DollarSign, Bell, Trash2, UserCog, Send, ShieldOff, ShieldCheck } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { fmtCurrency, monthlyTotals, useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — ExpenseFlow" }] }),
  component: AdminPage,
});

const tt = { background: "oklch(0.22 0.04 265 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 } as const;

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { users, transactions, notifications, updateUser, deleteUser, pushNotification } = useStore();

  useEffect(() => {
    if (!loading && user && user.role !== "admin") navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  if (!user || user.role !== "admin") {
    return (
      <div className="card-glass p-10 text-center">
        <Shield className="mx-auto h-8 w-8 text-brand-rose" />
        <p className="mt-3 font-semibold">Access denied</p>
        <p className="text-sm text-muted-foreground">Admin privileges required.</p>
      </div>
    );
  }

  const monthly = useMemo(() => monthlyTotals(transactions, 7), [transactions]);
  const platformTotal = users.reduce((a, u) => a + u.spend, 0);
  const activeUsers = users.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-purple/20 text-brand-purple">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Platform-wide management and reporting</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi icon={Users} label="Total users" value={String(users.length)} accent="var(--brand-purple)" />
        <Kpi icon={ShieldCheck} label="Active users" value={String(activeUsers)} accent="var(--success)" />
        <Kpi icon={DollarSign} label="Platform spend" value={fmtCurrency(platformTotal)} accent="var(--brand-blue)" />
        <Kpi icon={Bell} label="Notifications" value={String(notifications.length)} accent="var(--brand-rose)" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-glass p-6">
          <h3 className="font-semibold">Platform Income vs Expense</h3>
          <p className="text-xs text-muted-foreground">Aggregate across users (demo data)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} formatter={(v: number) => fmtCurrency(v)} />
                <Bar dataKey="income" fill="oklch(0.65 0.22 295)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="oklch(0.66 0.23 12)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="font-semibold">User Growth</h3>
          <p className="text-xs text-muted-foreground">Cumulative signups (demo)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={monthly.map((m, i) => ({ m: m.m, users: 50 + i * 18 + (i * i * 3) }))}>
                <defs>
                  <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.18 255)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.65 0.18 255)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.03 255)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="users" stroke="oklch(0.65 0.18 255)" strokeWidth={2} fill="url(#ug)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <UserManagement users={users} updateUser={updateUser} deleteUser={deleteUser} currentId={user.id} />

      <NotificationBroadcaster onSend={(title, message) => {
        pushNotification({ type: "system", title, message });
        toast.success("Notification sent to feed");
      }} />

      <FinancialReport users={users} transactions={transactions} />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <div className="card-glass p-5">
      <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${accent} 22%, transparent)` }}>
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function UserManagement({ users, updateUser, deleteUser, currentId }: any) {
  return (
    <div className="card-glass overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h3 className="font-semibold inline-flex items-center gap-2"><UserCog className="h-4 w-4 text-brand-purple" /> User Management</h3>
        <span className="text-xs text-muted-foreground">{users.length} users</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-white/5">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium text-right">Spend</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full font-semibold text-white" style={{ background: "var(--gradient-primary)" }}>{u.name[0]}</div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select value={u.role} onChange={(e) => { updateUser(u.id, { role: e.target.value }); toast.success("Role updated"); }} className="rounded-lg bg-white/[0.04] border border-white/10 px-2 py-1 text-xs">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${u.status === "active" ? "bg-success/15 text-success" : "bg-brand-rose/15 text-brand-rose"}`}>{u.status}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{u.joined}</td>
                <td className="px-5 py-3 text-right font-medium">{fmtCurrency(u.spend)}</td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => { updateUser(u.id, { status: u.status === "active" ? "suspended" : "active" }); toast.success("Status updated"); }}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/[0.06]"
                      aria-label="Toggle status"
                    >{u.status === "active" ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}</button>
                    <button
                      disabled={u.id === currentId}
                      onClick={() => { if (confirm(`Delete ${u.name}?`)) { deleteUser(u.id); toast.success("User deleted"); } }}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-brand-rose/15 hover:text-brand-rose disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="Delete"
                    ><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotificationBroadcaster({ onSend }: { onSend: (t: string, m: string) => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div className="card-glass p-6">
      <h3 className="font-semibold inline-flex items-center gap-2"><Send className="h-4 w-4 text-brand-blue" /> Notification Broadcaster</h3>
      <p className="text-xs text-muted-foreground">Push a system notification to the feed.</p>
      <form
        onSubmit={(e) => { e.preventDefault(); if (!title.trim() || !message.trim()) { toast.error("Fill both fields"); return; } onSend(title.trim(), message.trim()); setTitle(""); setMessage(""); }}
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr_auto]"
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" />
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm" />
        <button type="submit" className="rounded-lg btn-primary px-4 py-2.5 text-sm font-semibold">Send</button>
      </form>
    </div>
  );
}

function FinancialReport({ users, transactions }: any) {
  const exportReport = () => {
    const rows = [["User", "Email", "Role", "Status", "Joined", "Spend"]];
    for (const u of users) rows.push([u.name, u.email, u.role, u.status, u.joined, u.spend.toFixed(2)]);
    rows.push([], ["Transactions on platform:", String(transactions.length)]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "platform-report.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const totalIncome = transactions.filter((t: any) => t.type === "income").reduce((a: number, t: any) => a + t.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === "expense").reduce((a: number, t: any) => a + t.amount, 0);

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold inline-flex items-center gap-2"><DollarSign className="h-4 w-4 text-success" /> Financial Report</h3>
        <button onClick={exportReport} className="rounded-lg glass px-3 py-2 text-xs font-medium">Download CSV</button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <ReportStat label="Lifetime income tracked" value={fmtCurrency(totalIncome)} />
        <ReportStat label="Lifetime expenses tracked" value={fmtCurrency(totalExpense)} />
        <ReportStat label="Net flow" value={fmtCurrency(totalIncome - totalExpense)} />
      </div>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
