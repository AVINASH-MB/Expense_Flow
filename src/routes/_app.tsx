import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, Target, PiggyBank, BarChart3, Settings, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard", label: "Transactions", icon: ArrowLeftRight, disabled: true },
  { to: "/dashboard", label: "Budgets", icon: Target, disabled: true },
  { to: "/dashboard", label: "Goals", icon: PiggyBank, disabled: true },
  { to: "/dashboard", label: "Analytics", icon: BarChart3, disabled: true },
  { to: "/dashboard", label: "Settings", icon: Settings, disabled: true },
];

function AppLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/5 px-4 py-6 lg:block">
          <Link to="/" className="flex items-center gap-2 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl btn-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">ExpenseFlow</span>
          </Link>
          <nav className="mt-8 space-y-1">
            {nav.map((n) => {
              const active = !n.disabled && pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active ? "bg-white/[0.06] text-foreground" : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                  } ${n.disabled ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{n.label}</span>
                  {n.disabled && <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Soon</span>}
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

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
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
                <p className="truncate text-sm text-muted-foreground">Welcome back, <span className="text-foreground font-medium">{user.name}</span></p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
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
          </header>
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
