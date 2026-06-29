import type { Metadata } from "next";
import { AlternativePage } from "@/components/marketing/AlternativePage";

export const metadata: Metadata = {
  title: "Best Senja Alternative in 2026 — WallTrust",
  description:
    "Looking for a Senja alternative? WallTrust has no testimonial cap, includes Google Rich Snippets, and costs $7/mo flat. No tricks.",
  alternates: { canonical: "/compare/senja-alternative" },
};

export default function SenjaAlternativePage() {
  return (
    <AlternativePage
      competitorName="Senja"
      h1="The Best Senja Alternative in 2026"
      subheading="No testimonial cap. Real Google star ratings. $7/mo flat."
      comparisonRows={[
        { feature: "Starting price", competitor: "Free (15 max)", walltrust: "Free (5) then $7/mo", win: true },
        { feature: "Unlimited testimonials", competitor: "Paid plan only", walltrust: "From $7/mo", win: true },
        { feature: "Google Rich Snippets", competitor: "Not available", walltrust: "From $7/mo", win: true },
        { feature: "No widget branding", competitor: "Paid plan", walltrust: "From $7/mo", win: true },
        { feature: "Video testimonials", competitor: "Yes", walltrust: "Coming soon" },
      ]}
      reasonsToLeave={[
        { title: "15-testimonial free cap", body: "The free plan stops at 15 testimonials, which fills up fast once people start submitting." },
        { title: "No rich snippets at any price", body: "Senja doesn't offer Google Rich Snippet (JSON-LD) star ratings, so reviews can't show stars in search." },
        { title: "Limited widget customization", body: "Users wanting deeper control over how the widget looks on their site often hit walls." },
      ]}
      differentiators={[
        { title: "No artificial testimonial caps", body: "Start free with 5 testimonials, then go unlimited from $7/mo — instead of being boxed in at 15 on the free tier." },
        { title: "Google Rich Snippets that Senja simply doesn't have", body: "WallTrust generates AggregateRating JSON-LD so your star ratings can appear directly in Google results — a capability Senja doesn't offer at any price." },
        { title: "Flat, predictable pricing", body: "One simple $7/mo plan unlocks the essentials. No confusing tiers, no surprise add-ons, cancel in one click." },
      ]}
      faqItems={[
        { question: "Is WallTrust a good Senja alternative?", answer: "Yes. WallTrust removes Senja's 15-testimonial free cap, adds Google Rich Snippets that Senja doesn't offer, and goes unlimited from $7/mo with no widget branding." },
        { question: "Does WallTrust support Google star ratings like Senja?", answer: "WallTrust includes Google Rich Snippets (AggregateRating JSON-LD) from $7/mo. Senja does not offer Google Rich Snippets at any plan level." },
        { question: "Can I migrate from Senja to WallTrust?", answer: "Yes. Export your testimonials from Senja and re-import them on WallTrust. Setup takes under 10 minutes." },
      ]}
    />
  );
}
