"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { Menu, ShieldCheck } from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

type SidebarUser = { name?: string | null; plan?: string; username?: string };

export default function DashboardLayoutClient({
  children,
  user,
  session,
}: {
  children: React.ReactNode;
  user: SidebarUser;
  session: Session;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // Scoped to the dashboard tree (not the whole app) — the only client
    // code that needs useSession()/update() right now is
    // components/billing/PlanSyncOnSuccess.tsx, rendered from the billing
    // page under this layout.
    //
    // Passing the server-fetched `session` here (rather than omitting it)
    // matters, not just as an optimization: without it, SessionProvider
    // initializes with loading=true and does its own client-side session
    // fetch on mount. next-auth's own update() implementation early-returns
    // as a silent no-op while loading is true (see node_modules/next-auth/
    // react.js), so calling update() from PlanSyncOnSuccess before that
    // initial fetch resolves would do NOTHING regardless of arguments —
    // this bit us for real (see auth.ts's jwt callback comment) before
    // this prop was added.
    <SessionProvider session={session}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-2 p-2 text-slate-600"
          >
            <Menu size={22} />
          </button>
          <div className="ml-2 flex items-center gap-2">
            <ShieldCheck className="text-primary" size={20} />
            <span className="text-base font-bold tracking-tight">WallTrust</span>
          </div>
        </div>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            data-testid="mobile-nav-backdrop"
          />
        )}

        {/* Sidebar: overlay on mobile, static on desktop */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:static md:z-auto md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            user={user}
            onNavigate={() => setMobileMenuOpen(false)}
            onClose={() => setMobileMenuOpen(false)}
          />
        </div>

        <main className="w-full flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
      </div>
    </SessionProvider>
  );
}
