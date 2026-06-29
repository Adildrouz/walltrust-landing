import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "./MarketingShell";
import { ComparisonTable, type ComparisonRow } from "./ComparisonTable";
import { Faq, type FaqItem } from "./Faq";

export interface AlternativePageProps {
  competitorName: string;
  h1: string;
  subheading: string;
  comparisonRows: ComparisonRow[];
  reasonsToLeave: { title: string; body: string }[];
  differentiators: { title: string; body: string }[];
  faqItems: FaqItem[];
}

export function AlternativePage({
  competitorName,
  h1,
  subheading,
  comparisonRows,
  reasonsToLeave,
  differentiators,
  faqItems,
}: AlternativePageProps) {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-4xl space-y-16 px-4 py-16">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{h1}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Start free on WallTrust — no card needed <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Comparison */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            WallTrust vs {competitorName} at a glance
          </h2>
          <ComparisonTable competitorName={competitorName} rows={comparisonRows} />
        </section>

        {/* Why people leave */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Why people look for a {competitorName} alternative
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {reasonsToLeave.map((r) => (
              <div key={r.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How WallTrust is different */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">How WallTrust is different</h2>
          <div className="space-y-4">
            {differentiators.map((d) => (
              <div key={d.title}>
                <h3 className="font-semibold text-slate-900">{d.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to switch from {competitorName}?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-indigo-100">
            Unlimited testimonials and Google Rich Snippets from $7/mo. Cancel in one click.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link href="/auth/signup">Start free — no card needed</Link>
          </Button>
        </section>

        {/* FAQ */}
        <Faq items={faqItems} />
      </div>
    </MarketingShell>
  );
}
