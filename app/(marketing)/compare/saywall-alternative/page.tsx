import type { Metadata } from "next";
import { AlternativePage } from "@/components/marketing/AlternativePage";

export const metadata: Metadata = {
  title: "Best SayWall Alternative 2026 — WallTrust ($7/mo vs $19/mo)",
  description:
    "SayWall starts at $19/mo. WallTrust gives you unlimited testimonials and Google Rich Snippets from $7/mo. See the full comparison.",
  alternates: { canonical: "/compare/saywall-alternative" },
};

export default function SaywallAlternativePage() {
  return (
    <AlternativePage
      competitorName="SayWall"
      h1="SayWall Alternative: Same Features, Half the Price"
      subheading="SayWall $19/mo vs WallTrust $7/mo — the difference that matters."
      comparisonRows={[
        { feature: "Starting price", competitor: "$19/mo", walltrust: "$7/mo", win: true },
        { feature: "Free plan", competitor: "16 testimonials max", walltrust: "5 testimonials" },
        { feature: "Unlimited testimonials", competitor: "$19/mo", walltrust: "$7/mo", win: true },
        { feature: "Google Rich Snippets", competitor: "Not available", walltrust: "$7/mo", win: true },
        { feature: "No branding", competitor: "$19/mo", walltrust: "$7/mo", win: true },
        { feature: "Video testimonials", competitor: "Yes", walltrust: "Coming soon" },
        { feature: "Import Google/Trustpilot", competitor: "Yes", walltrust: "Coming soon" },
        { feature: "Cancel anytime", competitor: "Yes", walltrust: "Yes", win: true },
      ]}
      reasonsToLeave={[
        { title: "$19/mo entry price", body: "If you're just starting out, paying $19/mo before you've proven ROI is a lot — WallTrust starts at $7/mo." },
        { title: "No Google Rich Snippets", body: "SayWall doesn't offer Google star ratings. WallTrust includes them from $7/mo." },
        { title: "More than you need", body: "Many solopreneurs just want to collect and embed testimonials — not pay for an enterprise feature set." },
      ]}
      differentiators={[
        { title: "Price: $7 vs $19", body: "If you're just starting out, that difference matters every single month. WallTrust gives you the essentials for less than half of SayWall's entry price." },
        { title: "Rich Snippets included", body: "SayWall doesn't offer Google star ratings at all. WallTrust auto-generates AggregateRating JSON-LD so your reviews can show stars in search — from $7/mo." },
        { title: "Does one thing perfectly", body: "WallTrust focuses on collecting and embedding testimonials beautifully, with no bloat to pay for or learn." },
      ]}
      faqItems={[
        { question: "Is WallTrust cheaper than SayWall?", answer: "Yes — WallTrust starts at $7/mo versus SayWall's $19/mo, with unlimited testimonials and no branding included at that price." },
        { question: "Does SayWall have Google Rich Snippets?", answer: "No. SayWall doesn't offer Google Rich Snippets. WallTrust includes them from $7/mo." },
        { question: "Can I switch from SayWall to WallTrust?", answer: "Yes, setup takes under 10 minutes. Export your testimonials and re-import them on WallTrust." },
      ]}
    />
  );
}
