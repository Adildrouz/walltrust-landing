import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "How to Add Testimonials to Wix — WallTrust Widget",
  description:
    "Embed testimonials on your Wix website using the Wix HTML iframe element. Collect and display customer reviews in minutes.",
  alternates: { canonical: "/integrations/wix" },
};

export default function WixIntegrationPage() {
  return (
    <MarketingArticle
      badge="Integration"
      h1="Add Testimonials to Wix"
      lede="Wix's Embed HTML element lets you add the WallTrust widget to any page in a few clicks."
      sections={[
        {
          heading: "Step-by-step",
          steps: [
            "Copy your embed code from the WallTrust dashboard Widget page.",
            "In the Wix Editor, click Add → Embed Code → Embed HTML (iframe/widget).",
            "Paste the snippet, then position and resize the element.",
            "Publish your site. Done.",
          ],
        },
        {
          heading: "Your embed code",
          code: `<div id="walltrust-widget"></div>
<script src="https://walltrust.app/api/widget/YOUR_ID" async></script>`,
          note: "Wix renders custom embeds inside an iframe — give the element enough height so the testimonials aren't clipped.",
        },
      ]}
      faqItems={[
        { question: "How do I add testimonials to Wix?", answer: "Use Add → Embed Code → Embed HTML in the Wix Editor and paste the one-line WallTrust snippet. Resize the element to fit your testimonials." },
        { question: "Does WallTrust work inside the Wix HTML element?", answer: "Yes. Wix renders the embed in an iframe; the widget loads and displays your approved testimonials. Just make sure the element is tall enough." },
        { question: "Do I need the Wix premium plan?", answer: "Embedding custom HTML is available on Wix premium plans; the WallTrust widget itself works the same regardless." },
      ]}
      ctaHeading="Add testimonials to Wix now"
    />
  );
}
