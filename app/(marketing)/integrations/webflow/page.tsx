import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "How to Add Testimonials to Webflow — WallTrust Widget",
  description:
    "Embed a testimonial widget in your Webflow site. No code, no plugin — just paste one line into a Webflow Embed block.",
  alternates: { canonical: "/integrations/webflow" },
};

export default function WebflowIntegrationPage() {
  return (
    <MarketingArticle
      badge="Integration"
      h1="Add Testimonials to Webflow"
      lede="Webflow's Embed element makes adding the WallTrust widget a 30-second job. No code, no plugin."
      sections={[
        {
          heading: "Step-by-step",
          steps: [
            "Copy your embed code from the WallTrust dashboard Widget page.",
            "In the Webflow Designer, add an Embed element where you want the testimonials.",
            "Paste the code into the Embed and save.",
            "Publish your site. Done.",
          ],
        },
        {
          heading: "Your embed code",
          code: `<div id="walltrust-widget"></div>
<script src="https://walltrust.app/api/widget/YOUR_ID" async></script>`,
        },
      ]}
      faqItems={[
        { question: "Can I add testimonials to Webflow without code?", answer: "Yes. Use Webflow's built-in Embed element and paste the one-line WallTrust snippet — no custom coding required." },
        { question: "Does the widget work inside Webflow's Embed element?", answer: "Yes. The script loads asynchronously inside the Embed and renders your approved testimonials." },
        { question: "Will the testimonials update automatically?", answer: "Yes. As you approve new testimonials in WallTrust, the widget reflects them without any changes in Webflow." },
      ]}
      ctaHeading="Add testimonials to Webflow now"
    />
  );
}
