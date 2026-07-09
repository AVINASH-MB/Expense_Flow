import { Bell, LogOut, Menu, Moon, Sun, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NotificationsAPI } from "@/services/endpoints";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const { resolved, setTheme } = useTheme();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    NotificationsAPI.list().then((n) => setUnread(n.filter((x) => !x.read).length)).catch(() => {});
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 lg:px-6">
      <button onClick={onMenu} className="lg:hidden rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link to="/notifications" className="relative rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 h-4 min-w-[16px] rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white text-center leading-4">
              {unread}
            </span>
          )}
        </Link>
        <Link to="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
          </span>
          <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name}</span>
        </Link>
        <button
          onClick={logout}
          className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
