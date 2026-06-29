import { Check } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { Cta, CtaBanner } from "./Cta";
import { Faq, type FaqItem } from "./Faq";

export interface ArticleSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  /** numbered step-by-step list */
  steps?: string[];
  /** a code block (rendered monospace, dark) */
  code?: string;
  /** small muted note under the section */
  note?: string;
}

export interface MarketingArticleProps {
  h1: string;
  lede: string;
  badge?: string;
  sections: ArticleSection[];
  faqItems: FaqItem[];
  ctaHeading?: string;
  ctaSub?: string;
}

export function MarketingArticle({
  h1,
  lede,
  badge,
  sections,
  faqItems,
  ctaHeading = "Ready to start collecting testimonials?",
  ctaSub = "Unlimited testimonials and Google Rich Snippets from $7/mo. Cancel in one click.",
}: MarketingArticleProps) {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl space-y-14 px-4 py-16">
        {/* Hero */}
        <header className="text-center">
          {badge && (
            <span className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-primary">
              {badge}
            </span>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{lede}</p>
          <div className="mt-8 flex justify-center">
            <Cta size="lg" />
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={i} className="space-y-3">
              {s.heading && (
                <h2 className="text-2xl font-bold tracking-tight">{s.heading}</h2>
              )}
              {s.paragraphs?.map((p, j) => (
                <p key={j} className="text-base leading-relaxed text-slate-600">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="space-y-2">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-base text-slate-600">
                      <Check size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.steps && (
                <ol className="space-y-3">
                  {s.steps.map((st, j) => (
                    <li key={j} className="flex gap-3 text-base text-slate-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {j + 1}
                      </span>
                      <span className="pt-0.5">{st}</span>
                    </li>
                  ))}
                </ol>
              )}
              {s.code && (
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
                  <code>{s.code}</code>
                </pre>
              )}
              {s.note && <p className="text-sm text-muted-foreground">{s.note}</p>}
            </section>
          ))}
        </div>

        <CtaBanner heading={ctaHeading} sub={ctaSub} />

        <Faq items={faqItems} />
      </div>
    </MarketingShell>
  );
}
