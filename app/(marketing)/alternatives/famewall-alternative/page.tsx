import type { Metadata } from "next";
import { AlternativePage } from "@/components/marketing/AlternativePage";

export const metadata: Metadata = {
  title: "Best Famewall Alternative in 2026 — WallTrust",
  description:
    "Looking for a Famewall alternative with Google Rich Snippets? WallTrust includes star ratings in Google from $7/mo. Famewall never will.",
  alternates: { canonical: "/alternatives/famewall-alternative" },
};

export default function FamewallAlternativePage() {
  return (
    <AlternativePage
      competitorName="Famewall"
      h1="The Best Famewall Alternative in 2026"
      subheading="Get your star ratings into Google — something Famewall can't do."
      comparisonRows={[
        { feature: "Starting price", competitor: "Free, then paid", walltrust: "Free (5) then $7/mo", win: true },
        { feature: "Unlimited testimonials", competitor: "Paid plan", walltrust: "From $7/mo", win: true },
        { feature: "Google Rich Snippets", competitor: "Not available", walltrust: "From $7/mo", win: true },
        { feature: "No widget branding", competitor: "Paid plan", walltrust: "From $7/mo", win: true },
        { feature: "Cancel anytime", competitor: "Yes", walltrust: "Yes", win: true },
      ]}
      reasonsToLeave={[
        {
          title: "No Google Rich Snippets",
          body: "Famewall has no Google Rich Snippet star ratings at any price point — your reviews can't show stars in search.",
        },
        {
          title: "Missing search visibility",
          body: "Without AggregateRating markup, you lose the click-through boost that star ratings give in Google results.",
        },
        {
          title: "Branding and limits on lower tiers",
          body: "Removing branding and lifting testimonial limits means moving up to paid plans.",
        },
      ]}
      differentiators={[
        {
          title: "Google Rich Snippets — the thing Famewall doesn't have",
          body: "This is the headline difference: WallTrust auto-generates AggregateRating JSON-LD so your star ratings can appear in Google search. Famewall offers no equivalent at any price.",
        },
        {
          title: "Unlimited testimonials from $7/mo",
          body: "Collect as many testimonials as you want on the entry paid plan, with no per-testimonial metering.",
        },
        {
          title: "No branding, simple pricing",
          body: "Remove WallTrust branding from $7/mo and cancel in one click whenever you like.",
        },
      ]}
      faqItems={[
        {
          question: "Is WallTrust a good Famewall alternative?",
          answer:
            "Yes. The biggest difference is Google Rich Snippets: WallTrust includes star-rating JSON-LD from $7/mo, while Famewall offers no Rich Snippets at any price. WallTrust also gives unlimited testimonials and no branding from $7/mo.",
        },
        {
          question: "Does Famewall support Google star ratings?",
          answer:
            "No. Famewall does not provide Google Rich Snippet (AggregateRating JSON-LD) star ratings at any plan. WallTrust includes them from $7/mo.",
        },
        {
          question: "Can I migrate from Famewall to WallTrust?",
          answer:
            "Yes. Export your testimonials and re-import them on WallTrust. Setup takes under 10 minutes.",
        },
      ]}
    />
  );
}
