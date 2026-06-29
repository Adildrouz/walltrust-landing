import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={22} />
            <span className="text-lg font-bold tracking-tight">WallTrust</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/auth/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 WallTrust. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/reviews" className="hover:text-slate-900">Reviews</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
