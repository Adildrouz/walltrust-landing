import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "How to Add Testimonials to Shopify — WallTrust Widget",
  description:
    "Add customer testimonials to your Shopify store. Display social proof on product pages, homepage, or landing pages — in 5 minutes.",
  alternates: { canonical: "/integrations/shopify" },
};

export default function ShopifyIntegrationPage() {
  return (
    <MarketingArticle
      badge="Integration"
      h1="Add Testimonials to Shopify"
      lede="Put customer social proof right where it converts — on your product and home pages. Here's how to embed WallTrust on Shopify in about 5 minutes."
      sections={[
        {
          heading: "Step-by-step",
          steps: [
            "Copy your embed code from the WallTrust dashboard Widget page.",
            "In Shopify, go to Online Store → Themes → Edit code, and add the snippet to the section or template where you want testimonials.",
            "Or, in the page editor, add a Custom Liquid / Custom HTML block and paste the code there.",
            "Save and preview. Done.",
          ],
        },
        {
          heading: "Your embed code",
          code: `<div id="walltrust-widget"></div>
<script src="https://walltrust.app/api/widget/YOUR_ID" async></script>`,
        },
        {
          heading: "Best places to show testimonials on Shopify",
          bullets: ["Product pages, below the description", "Homepage, near your hero or featured products", "Landing pages for ad campaigns", "Cart or checkout-adjacent sections to reduce hesitation"],
        },
      ]}
      faqItems={[
        { question: "Can I add testimonials to Shopify product pages?", answer: "Yes. Add the WallTrust snippet to your product template (Edit code) or via a Custom HTML/Liquid block so the widget appears on product pages." },
        { question: "Do I need a Shopify app for testimonials?", answer: "No. WallTrust is a single embed snippet, so there's no app to install or monthly app fee on top." },
        { question: "Will the widget match my theme?", answer: "You can set the widget's background, text, and accent colors in your WallTrust dashboard to match your store's theme." },
      ]}
      ctaHeading="Add testimonials to Shopify now"
    />
  );
}
