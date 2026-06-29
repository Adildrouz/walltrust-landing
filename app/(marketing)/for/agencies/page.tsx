import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Testimonial Management for Agencies 2026 — WallTrust",
  description:
    "Collect client testimonials across all your projects. Multiple collection pages, unlimited testimonials, white-label widgets — from $19/mo.",
  alternates: { canonical: "/for/agencies" },
};

export default function ForAgenciesPage() {
  return (
    <MarketingArticle
      badge="For Agencies"
      h1="One Tool for All Your Client Testimonials"
      lede="You manage 10 clients but have no system for collecting their testimonials. WallTrust Pro gives every client their own collection page under one account."
      sections={[
        {
          heading: "Built for managing multiple clients",
          bullets: [
            "Multiple collection pages — one per client or campaign",
            "Unlimited testimonials across all projects",
            "White-label widget — your agency brand, not WallTrust's",
            "Approve and feature the best testimonials per client",
          ],
        },
        {
          heading: "Why agencies choose WallTrust Pro",
          paragraphs: [
            "Stop juggling spreadsheets and screenshots. Spin up a dedicated collection page for each client, send them the link, and let testimonials flow into one dashboard. Embed each client's widget on their site with one line of code.",
            "WallTrust Pro is $19/mo for unlimited collection pages and no branding — a fraction of what enterprise testimonial platforms charge per seat.",
          ],
        },
      ]}
      faqItems={[
        { question: "Can I manage testimonials for multiple clients?", answer: "Yes. WallTrust Pro supports unlimited collection pages, so you can create a separate page per client and collect their testimonials independently under one account." },
        { question: "Does WallTrust offer white-label widgets?", answer: "Yes. On paid plans the WallTrust branding is removed from the widget, so it shows only your client's (or your agency's) content." },
        { question: "How much does WallTrust cost for agencies?", answer: "WallTrust Pro is $19/mo and includes unlimited collection pages, unlimited testimonials, and no branding." },
      ]}
      ctaHeading="Centralize every client's testimonials"
      ctaSub="WallTrust Pro: unlimited collection pages and no branding from $19/mo."
    />
  );
}
