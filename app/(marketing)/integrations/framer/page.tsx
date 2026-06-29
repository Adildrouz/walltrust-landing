import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "How to Add Testimonials to Framer — WallTrust Widget",
  description:
    "Embed testimonials in your Framer site with one line of code. Works with any Framer template.",
  alternates: { canonical: "/integrations/framer" },
};

export default function FramerIntegrationPage() {
  return (
    <MarketingArticle
      badge="Integration"
      h1="Add Testimonials to Framer"
      lede="Framer's Embed component lets you drop the WallTrust widget into any template in seconds."
      sections={[
        {
          heading: "Step-by-step",
          steps: [
            "Copy your embed code from the WallTrust dashboard Widget page.",
            "In Framer, insert an Embed component (HTML) where you want the testimonials.",
            "Paste the code and publish your site. Done.",
          ],
        },
        {
          heading: "Your embed code",
          code: `<div id="walltrust-widget"></div>
<script src="https://walltrust.app/api/widget/YOUR_ID" async></script>`,
        },
      ]}
      faqItems={[
        { question: "Can I add testimonials to Framer without code?", answer: "Yes. Use Framer's Embed (HTML) component and paste the one-line WallTrust snippet — no custom development required." },
        { question: "Does WallTrust work with any Framer template?", answer: "Yes. Because it's a standard HTML embed, it works in any Framer project or template." },
        { question: "Will the testimonials stay up to date?", answer: "Yes. The widget pulls your latest approved testimonials automatically — no need to re-publish when you add new ones." },
      ]}
      ctaHeading="Add testimonials to Framer now"
    />
  );
}
