import type { Metadata } from "next";
import { AlternativePage } from "@/components/marketing/AlternativePage";

export const metadata: Metadata = {
  title: "Best Trustmary Alternative 2026 — WallTrust",
  description:
    "Trustmary starts at $19/mo and targets enterprise. WallTrust gives freelancers and small businesses unlimited testimonials and Rich Snippets from $7/mo.",
  alternates: { canonical: "/compare/trustmary-alternative" },
};

export default function TrustmaryAlternativePage() {
  return (
    <AlternativePage
      competitorName="Trustmary"
      h1="The Best Trustmary Alternative for Solopreneurs"
      subheading="Trustmary is built for enterprise. WallTrust is built for you — from $7/mo."
      comparisonRows={[
        { feature: "Starting price", competitor: "$19/mo", walltrust: "$7/mo", win: true },
        { feature: "Target audience", competitor: "Enterprise / agencies", walltrust: "Freelancers, solopreneurs", win: true },
        { feature: "Google Rich Snippets", competitor: "Yes (paid)", walltrust: "$7/mo", win: true },
        { feature: "Unlimited testimonials", competitor: "Paid plan", walltrust: "$7/mo", win: true },
        { feature: "Setup time", competitor: "Complex", walltrust: "Under 10 minutes", win: true },
        { feature: "No branding", competitor: "Paid plan", walltrust: "$7/mo", win: true },
      ]}
      reasonsToLeave={[
        { title: "Enterprise pricing", body: "Trustmary's plans are aimed at agencies and enterprise — overkill (and overpriced) for a solo operator." },
        { title: "Complex setup", body: "Powerful, but heavy. Getting value out of Trustmary takes time most solopreneurs don't have." },
        { title: "Features you won't use", body: "You pay for an enterprise feature set when you really just need to collect and embed testimonials." },
      ]}
      differentiators={[
        { title: "Built for solopreneurs, not enterprise", body: "WallTrust is designed for freelancers and small businesses who need results fast — without paying enterprise prices or learning a complex platform." },
        { title: "Rich Snippets from $7/mo", body: "Trustmary offers Google star ratings on paid plans; WallTrust includes them from $7/mo with no per-testimonial limits." },
        { title: "Live in under 10 minutes", body: "Create a collection page, share the link, embed the widget with one line of code. That's it." },
      ]}
      faqItems={[
        { question: "Is Trustmary too expensive for freelancers?", answer: "For most freelancers, yes — Trustmary targets enterprise and agencies. WallTrust is built for solopreneurs at $7/mo." },
        { question: "Does Trustmary have Google Rich Snippets?", answer: "Yes, but on paid plans. WallTrust includes Google Rich Snippets from $7/mo." },
        { question: "Can I switch from Trustmary to WallTrust?", answer: "Yes. Export your testimonials and re-import them on WallTrust — setup takes under 10 minutes." },
      ]}
    />
  );
}
