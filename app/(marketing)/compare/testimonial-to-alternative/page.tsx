import type { Metadata } from "next";
import { AlternativePage } from "@/components/marketing/AlternativePage";

export const metadata: Metadata = {
  title: "Best Testimonial.to Alternative in 2026 — WallTrust",
  description:
    "Looking for a Testimonial.to alternative? WallTrust offers unlimited testimonials, Google Rich Snippets, and no widget branding — all from $7/mo vs $80/mo.",
  alternates: { canonical: "/compare/testimonial-to-alternative" },
};

export default function TestimonialToAlternativePage() {
  return (
    <AlternativePage
      competitorName="Testimonial.to"
      h1="The Best Testimonial.to Alternative in 2026"
      subheading="Same features. A fraction of the price."
      comparisonRows={[
        { feature: "Starting price", competitor: "$30/mo", walltrust: "$7/mo", win: true },
        { feature: "Unlimited testimonials", competitor: "From $60/mo", walltrust: "From $7/mo", win: true },
        { feature: "Google Rich Snippets", competitor: "$80/mo only", walltrust: "From $7/mo", win: true },
        { feature: "No widget branding", competitor: "$40/mo only", walltrust: "From $7/mo", win: true },
        { feature: "Cancel anytime", competitor: "Yes", walltrust: "Yes", win: true },
        { feature: "Free plan", competitor: "10 text only", walltrust: "5 testimonials", win: true },
      ]}
      reasonsToLeave={[
        { title: "Pricing jumps fast", body: "Plans escalate quickly — the features most people actually need sit behind $60–80/mo tiers." },
        { title: "Rich snippets locked away", body: "Google star ratings (JSON-LD) are only available on the top plan, at around $80/mo." },
        { title: "Limited customization", body: "Reviewers report the widget is hard to make feel native, and branding removal costs extra." },
      ]}
      differentiators={[
        { title: "Everything important is included from $7/mo", body: "Unlimited testimonials, Google Rich Snippets, and no widget branding are all in the entry paid plan — not gated behind $60–80/mo tiers." },
        { title: "Google star ratings out of the box", body: "WallTrust auto-generates the AggregateRating JSON-LD so your reviews can show star ratings in Google search results — included from the cheapest paid plan." },
        { title: "Honest, one-click cancellation", body: "Cancel any time in a single click — no retention chatbot, no waiting, no hoops." },
      ]}
      faqItems={[
        { question: "Is WallTrust a good Testimonial.to alternative?", answer: "Yes. WallTrust offers unlimited testimonials, Google Rich Snippets, and no widget branding from $7/mo — features that cost $60-80/mo on Testimonial.to." },
        { question: "How does WallTrust pricing compare to Testimonial.to?", answer: "Testimonial.to starts at $30/mo and charges $80/mo for Google Rich Snippets. WallTrust includes Rich Snippets from $7/mo with no per-testimonial limits." },
        { question: "Can I migrate from Testimonial.to to WallTrust?", answer: "Yes. You can export your testimonials and re-import them on WallTrust. Setup takes under 10 minutes." },
      ]}
    />
  );
}
