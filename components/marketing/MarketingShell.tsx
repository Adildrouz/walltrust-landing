import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourcesNav } from "./ResourcesNav";

const footerColumns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Compare",
    links: [
      { label: "vs Testimonial.to", href: "/compare/testimonial-to-alternative" },
      { label: "vs Senja", href: "/compare/senja-alternative" },
      { label: "vs SayWall", href: "/compare/saywall-alternative" },
      { label: "vs Famewall", href: "/compare/famewall-alternative" },
      { label: "vs Trustmary", href: "/compare/trustmary-alternative" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "For Freelancers", href: "/for/freelancers" },
      { label: "For Coaches", href: "/for/coaches" },
      { label: "For SaaS", href: "/for/saas" },
      { label: "For Agencies", href: "/for/agencies" },
      { label: "For Creators", href: "/for/creators" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { label: "WordPress", href: "/integrations/wordpress" },
      { label: "Webflow", href: "/integrations/webflow" },
      { label: "Shopify", href: "/integrations/shopify" },
      { label: "Framer", href: "/integrations/framer" },
      { label: "Squarespace", href: "/integrations/squarespace" },
    ],
  },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={22} />
            <span className="text-lg font-bold tracking-tight">WallTrust</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
            >
              Pricing
            </Link>
            <div className="hidden sm:block">
              <ResourcesNav />
            </div>
            <Link
              href="/auth/login"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block"
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
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                <span className="font-bold tracking-tight">WallTrust</span>
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                Collect testimonials. Display them anywhere.
              </p>
              <div className="mt-4 flex flex-col gap-1.5 text-sm">
                <Link href="/pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
                <Link href="/reviews" className="text-slate-600 hover:text-slate-900">Reviews</Link>
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <div className="text-sm font-semibold text-slate-900">{col.title}</div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-slate-600 hover:text-slate-900">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-muted-foreground sm:flex-row">
            <span>© 2026 WallTrust. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
