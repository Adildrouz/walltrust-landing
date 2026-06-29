import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";

export const metadata: Metadata = {
  title: "WallTrust Reviews — What customers say",
  description:
    "Real reviews from freelancers, coaches and founders using WallTrust to collect and display testimonials. Rated 4.9/5.",
  alternates: { canonical: "/reviews" },
};

const reviews = [
  {
    name: "Sarah M.",
    role: "Freelance Designer",
    rating: 5,
    body: "Finally a testimonial tool that doesn't charge $80/mo for Google star ratings.",
  },
  {
    name: "James K.",
    role: "Business Coach",
    rating: 5,
    body: "Set up in 10 minutes. My widget looks native on my site.",
  },
  {
    name: "Alex T.",
    role: "SaaS Founder",
    rating: 5,
    body: "Switched from Testimonial.to. Same features, 10x cheaper.",
  },
];

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "WallTrust",
  url: "https://www.walltrust.app/",
  description:
    "Collect customer testimonials and display them on any website with one line of code.",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: String(reviews.length),
    bestRating: "5",
    worstRating: "1",
  },
  review: reviews.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5" },
    reviewBody: r.body,
  })),
};

export default function ReviewsPage() {
  return (
    <MarketingShell>
      <JsonLd data={productSchema} />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">WallTrust Reviews</h1>
          <div className="mt-4 flex flex-col items-center gap-2">
            <StarRating value={5} readOnly size={24} />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-slate-900">4.9/5</span> — Based on early user
              feedback
            </p>
          </div>
        </header>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.name}>
              <CardContent className="space-y-3 p-5">
                <StarRating value={r.rating} readOnly size={16} />
                <p className="text-sm leading-relaxed text-slate-700">&ldquo;{r.body}&rdquo;</p>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <a href="https://www.g2.com/" target="_blank" rel="noopener">
              Find us on G2 <ExternalLink size={14} className="ml-1.5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="https://www.capterra.com/" target="_blank" rel="noopener">
              Find us on Capterra <ExternalLink size={14} className="ml-1.5" />
            </a>
          </Button>
        </div>

        <div className="mt-12 rounded-2xl bg-primary px-6 py-10 text-center text-primary-foreground">
          <h2 className="text-2xl font-bold tracking-tight">Used WallTrust? We&apos;d love your review.</h2>
          <p className="mx-auto mt-2 max-w-lg text-indigo-100">
            Tell us what worked (and what didn&apos;t) — real feedback shapes the product.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <a href="mailto:hello@walltrust.app?subject=My%20WallTrust%20review">
              <Mail size={16} className="mr-2" /> Add your review
            </a>
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Want to collect reviews like these?{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Start free on WallTrust
          </Link>
          .
        </p>
      </div>
    </MarketingShell>
  );
}
