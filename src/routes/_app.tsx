import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, Target, PiggyBank, BarChart3, Settings, LogOut, Wallet, Bell, Shield, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/auth";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { to: "/budgets", label: "Budgets", icon: Target },
    { to: "/goals", label: "Goals", icon: PiggyBank },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/notifications", label: "Notifications", icon: Bell, badge: unread },
    { to: "/settings", label: "Settings", icon: Settings },
    ...(user.role === "admin" ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ] as const;

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/5 px-4 py-6 lg:block">
          <Link to="/" className="flex items-center gap-2 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl btn-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">ExpenseFlow</span>
          </Link>
          <nav className="mt-8 space-y-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{n.label}</span>
                  {"badge" in n && (n as any).badge ? (
                    <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-rose px-1.5 text-[10px] font-semibold text-white">
                      {(n as any).badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => { logout(); navigate({ to: "/" }); }}
            className="mt-8 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-8">
              <div className="flex min-w-0 items-center gap-3 lg:hidden">
                <Link to="/" className="flex items-center gap-2">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg btn-primary">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span className="font-bold">ExpenseFlow</span>
                </Link>
              </div>
              <div className="hidden lg:block min-w-0">
                <p className="truncate text-sm text-muted-foreground">Welcome back, <span className="text-foreground font-medium">{user.name}</span>{user.role === "admin" && <span className="ml-2 rounded-full bg-brand-purple/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-brand-purple">Admin</span>}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-lg glass">
                  <Bell className="h-4 w-4" />
                  {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-brand-rose px-1 text-[10px] font-bold text-white">{unread}</span>}
                </Link>
                <div className="grid h-9 w-9 place-items-center rounded-full font-semibold text-white" style={{ background: "var(--gradient-primary)" }}>
                  {user.name[0]?.toUpperCase()}
                </div>
                <button
                  onClick={() => { logout(); navigate({ to: "/" }); }}
                  className="lg:hidden inline-flex items-center gap-2 rounded-lg glass px-3 py-2 text-xs font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
            {/* Mobile nav */}
            <div className="overflow-x-auto border-t border-white/5 px-4 lg:hidden">
              <div className="flex gap-1 py-2">
                {nav.map((n) => {
                  const active = pathname === n.to;
                  const Icon = n.icon;
                  return (
                    <Link key={n.label} to={n.to} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${active ? "bg-white/[0.08] text-foreground" : "text-muted-foreground"}`}>
                      <Icon className="h-3.5 w-3.5" /> {n.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
