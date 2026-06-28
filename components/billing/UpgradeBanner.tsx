import Link from "next/link";
import { Sparkles } from "lucide-react";

export function UpgradeBanner({
  message = "You're on the Free plan. Upgrade for unlimited testimonials, Rich Snippets, and no branding.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2">
          <Sparkles className="text-primary" size={18} />
        </div>
        <p className="text-sm text-slate-700">{message}</p>
      </div>
      <Link
        href="/dashboard/billing"
        className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Upgrade
      </Link>
    </div>
  );
}
