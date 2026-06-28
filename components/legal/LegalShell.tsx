import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={22} />
            <span className="text-lg font-bold tracking-tight">WallTrust</span>
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="legal-prose mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          {children}
        </div>
      </main>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
      {children}
    </section>
  );
}
