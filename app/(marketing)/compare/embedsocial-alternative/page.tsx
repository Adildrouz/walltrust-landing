import type { Metadata } from "next";
import { AlternativePage } from "@/components/marketing/AlternativePage";

export const metadata: Metadata = {
  title: "Best EmbedSocial Alternative 2026 — WallTrust",
  description:
    "EmbedSocial bundles social media aggregation with reviews. WallTrust does one thing — testimonials — simply and affordably from $7/mo.",
  alternates: { canonical: "/compare/embedsocial-alternative" },
};

export default function EmbedSocialAlternativePage() {
  return (
    <AlternativePage
      competitorName="EmbedSocial"
      h1="EmbedSocial Alternative: One Tool, One Job"
      subheading="EmbedSocial is a broad social media aggregation platform that includes testimonial features as one part of a larger toolkit. If testimonials are all you need, WallTrust is simpler and cheaper."
      comparisonRows={[
        { feature: "Starting price", competitor: "$29/mo, no free plan", walltrust: "$7/mo, free plan available", win: true },
        { feature: "Core focus", competitor: "Social media aggregation (Instagram, Facebook, Google) + reviews", walltrust: "Testimonials only" },
        { feature: "Setup complexity", competitor: "Connect multiple social accounts, configure feeds", walltrust: "1 collection link, no integrations required", win: true },
        { feature: "Google Rich Snippets", competitor: "Available on paid plans", walltrust: "Included from $7/mo", win: true },
        { feature: "Best for", competitor: "Brands managing UGC across social platforms", walltrust: "Freelancers and solopreneurs collecting client testimonials" },
        { feature: "Free plan", competitor: "None", walltrust: "5 testimonials free, no card required", win: true },
        { feature: "No branding", competitor: "Paid tiers", walltrust: "$7/mo ✓", win: true },
      ]}
      reasonsToLeave={[
        { title: "Paying for a toolkit you won't use", body: "EmbedSocial's pricing covers a much bigger toolkit — social feed aggregation, UGC rights management, Instagram/TikTok widgets — most of which a freelancer collecting client testimonials will never touch." },
        { title: "No free plan to try first", body: "There's no way to try EmbedSocial before committing to $29/mo, since it has no free tier at all." },
        { title: "Overkill for a simple testimonial page", body: "If all you need is to collect and display client testimonials, a full social media aggregation platform is more than the job requires." },
      ]}
      differentiators={[
        { title: "One tool, one job", body: "WallTrust does one job — collect and display testimonials — and charges accordingly, instead of bundling in features you'll never use." },
        { title: "Try before you commit", body: "WallTrust's free plan gives you 5 testimonials with no card required, so you can see if it fits before paying anything." },
        { title: "Simple setup, no integrations", body: "One shareable collection link replaces connecting multiple social accounts and configuring feeds." },
      ]}
      faqItems={[
        { question: "Is there a cheaper alternative to EmbedSocial for testimonials only?", answer: "Yes. WallTrust starts at $7/mo with a free plan available, compared to EmbedSocial's $29/mo minimum with no free tier, if you only need testimonial collection and display." },
        { question: "Does WallTrust aggregate social media content like EmbedSocial?", answer: "No. WallTrust focuses exclusively on testimonial collection and display. If you need Instagram, Facebook, or TikTok feed aggregation, EmbedSocial's broader toolkit is built for that." },
        { question: "Can I try WallTrust before paying, unlike EmbedSocial?", answer: "Yes. WallTrust has a free plan with 5 testimonials and no credit card required. EmbedSocial has no free plan." },
      ]}
    />
  );
}
