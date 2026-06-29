import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Testimonial Widget for SaaS Products 2026 — WallTrust",
  description:
    "Add social proof to your SaaS landing page. Collect user testimonials, embed them with one line of code, and get Google Rich Snippets — from $7/mo.",
  alternates: { canonical: "/for/saas" },
};

export default function ForSaasPage() {
  return (
    <MarketingArticle
      badge="For SaaS"
      h1="Social Proof for SaaS — Collect, Display, Convert"
      lede="Visitors land on your pricing page and leave because they don't trust you yet. WallTrust turns happy users into the proof that converts them."
      sections={[
        {
          heading: "How it works for SaaS founders",
          steps: [
            "Embed the collection form in your onboarding or post-trial email (e.g. after the 14-day trial).",
            "Approve incoming testimonials from your dashboard.",
            "Display them on your landing page with the embeddable widget.",
            "Show star ratings in Google when prospects search your product name (Rich Snippets).",
          ],
        },
        {
          heading: "One line of code — works with your stack",
          paragraphs: [
            "Drop the widget into your marketing site or app with a single script tag. It's framework-agnostic and loads async, so it never blocks your page.",
          ],
          code: `// In your React / Next.js page
export default function Proof() {
  return (
    <>
      <div id="walltrust-widget" />
      <script
        src="https://www.walltrust.app/api/widget/YOUR_ID"
        async
      />
    </>
  );
}`,
        },
        {
          heading: "Rich Snippets your competitors skip",
          paragraphs: [
            "WallTrust auto-generates AggregateRating JSON-LD from $7/mo, so your product's star rating can appear in Google search results — free click-through lift most testimonial tools lock behind $80/mo tiers.",
          ],
        },
      ]}
      faqItems={[
        { question: "How do I add testimonials to my SaaS landing page?", answer: "Collect testimonials via a WallTrust collection page, approve them, then paste the one-line widget embed into your landing page. The widget updates automatically as you approve new testimonials." },
        { question: "Does WallTrust work with Next.js / React?", answer: "Yes. The widget is a plain script tag, so it works in any framework — Next.js, React, Vue, plain HTML — and loads asynchronously." },
        { question: "Can I get Google star ratings for my SaaS?", answer: "Yes. WallTrust generates AggregateRating structured data from $7/mo so star ratings can show in Google search for your product." },
      ]}
      ctaHeading="Add social proof to your SaaS today"
    />
  );
}
