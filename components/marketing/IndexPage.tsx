import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingShell } from "./MarketingShell";
import { Cta, CtaBanner } from "./Cta";
import { JsonLd } from "./JsonLd";

const SITE = "https://www.walltrust.app";

export interface IndexCard {
  title: string;
  description: string;
  href: string;
}

export function IndexPage({
  h1,
  lede,
  cards,
  ctaHeading = "Start collecting testimonials today",
  ctaSub = "Unlimited testimonials and Google Rich Snippets from $7/mo. Cancel in one click.",
}: {
  h1: string;
  lede: string;
  cards: IndexCard[];
  ctaHeading?: string;
  ctaSub?: string;
}) {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: cards.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${SITE}${c.href}`,
    })),
  };

  return (
    <MarketingShell>
      <JsonLd data={itemListSchema} />
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-16">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{h1}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{lede}</p>
          <div className="mt-8 flex justify-center">
            <Cta size="lg" />
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.href} href={c.href} className="group">
              <Card className="h-full transition-colors hover:border-primary">
                <CardContent className="flex h-full flex-col p-5">
                  <h2 className="font-semibold text-slate-900">{c.title}</h2>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{c.description}</p>
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                    Learn more
                    <ArrowRight size={15} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <CtaBanner heading={ctaHeading} sub={ctaSub} />
      </div>
    </MarketingShell>
  );
}
