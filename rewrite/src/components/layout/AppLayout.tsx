import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex">
        <div className="hidden lg:block sticky top-0 h-screen">
          <Sidebar />
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0"><Sidebar onNavigate={() => setMobileOpen(false)} /></div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Topbar onMenu={() => setMobileOpen(true)} />
          <main className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
