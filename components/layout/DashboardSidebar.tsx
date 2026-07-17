"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Star,
  FileText,
  Code2,
  Search,
  Settings,
  CreditCard,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/testimonials", label: "Testimonials", icon: Star },
  { href: "/dashboard/pages", label: "Collection Pages", icon: FileText },
  { href: "/dashboard/widget", label: "Widget", icon: Code2 },
  { href: "/dashboard/rich-snippets", label: "Rich Snippets", icon: Search },
];

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

const planLabel: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export default function DashboardSidebar({
  user,
  onNavigate,
  onClose,
}: {
  user: { name?: string | null; plan?: string; username?: string };
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const plan = user.plan ?? "free";

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: typeof Star;
  }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors md:py-2",
          active
            ? "bg-primary text-primary-foreground"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white px-4 py-5">
      <div className="flex items-center gap-2 px-2">
        <ShieldCheck className="text-primary" size={22} />
        <span className="text-lg font-bold tracking-tight">WallTrust</span>
        <Badge variant="secondary" className="ml-auto">
          {planLabel[plan] ?? "Free"}
        </Badge>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="ml-2 p-1 text-slate-500 md:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {mainNav.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        <div className="mt-auto flex flex-col gap-1">
          {plan === "free" && (
            <Link
              href="/dashboard/billing"
              onClick={onNavigate}
              className="mb-2 rounded-md bg-indigo-50 px-3 py-2 text-xs font-medium text-primary hover:bg-indigo-100"
            >
              ⚡ Upgrade for unlimited testimonials
            </Link>
          )}
          <div className="my-2 h-px bg-slate-200" />
          {bottomNav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <Button
            variant="ghost"
            className="mt-1 justify-start gap-3 px-3 text-slate-600 hover:text-slate-900"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <LogOut size={18} />
            Sign out
          </Button>
        </div>
      </nav>
    </aside>
  );
}
