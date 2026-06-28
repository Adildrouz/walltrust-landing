import Link from "next/link";
import type { Metadata } from "next";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pricing — WallTrust",
  description:
    "Unlimited testimonials and Google Rich Snippets from $7/mo. No widget branding on paid plans. Cancel in one click.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    cta: "Start free",
    highlighted: false,
    features: [
      "5 testimonials",
      "1 collection page",
      "Embeddable widget",
      "Wall of love page",
    ],
    notIncluded: ["Google Rich Snippets", "Remove WallTrust branding"],
  },
  {
    name: "Starter",
    price: "$7",
    period: "/mo",
    cta: "Get Starter",
    highlighted: true,
    features: [
      "Unlimited testimonials",
      "3 collection pages",
      "Google Rich Snippets (JSON-LD)",
      "No widget branding",
      "Email notifications",
    ],
    notIncluded: [],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    cta: "Get Pro",
    highlighted: false,
    features: [
      "Everything in Starter",
      "Unlimited collection pages",
      "Priority support",
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="text-primary" size={22} />
            <span className="text-lg font-bold tracking-tight">WallTrust</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/auth/signup">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple, honest pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Unlimited testimonials and Google Rich Snippets from $7/mo. Cancel in one click.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlighted ? "relative border-primary shadow-md" : ""}
            >
              {tier.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
              )}
              <CardHeader>
                <div className="text-sm font-medium text-muted-foreground">{tier.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <Button
                  asChild
                  className="w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <Link href="/auth/signup">{tier.cta}</Link>
                </Button>
                <ul className="space-y-2.5 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {f}
                    </li>
                  ))}
                  {tier.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-slate-400">
                      <span className="mt-0.5 shrink-0">—</span> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All paid plans are billed via Lemon Squeezy. No card required for the Free plan.
        </p>
      </main>
    </div>
  );
}
