import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "How to Add Testimonials to Squarespace — WallTrust Widget",
  description:
    "Add a testimonial widget to Squarespace using a Code Block. No developer needed — copy, paste, done.",
  alternates: { canonical: "/integrations/squarespace" },
};

export default function SquarespaceIntegrationPage() {
  return (
    <MarketingArticle
      badge="Integration"
      h1="Add Testimonials to Squarespace"
      lede="Squarespace's Code Block makes embedding the WallTrust widget simple — no developer required."
      sections={[
        {
          heading: "Step-by-step",
          steps: [
            "Copy your embed code from the WallTrust dashboard Widget page.",
            "Edit the Squarespace page and add a Code Block where you want the testimonials.",
            "Paste the snippet into the Code Block and save.",
            "Publish the page. Done.",
          ],
        },
        {
          heading: "Your embed code",
          code: `<div id="walltrust-widget"></div>
<script src="https://walltrust.app/api/widget/YOUR_ID" async></script>`,
          note: "Code Blocks are available on Squarespace Business and Commerce plans.",
        },
      ]}
      faqItems={[
        { question: "How do I add testimonials to Squarespace?", answer: "Add a Code Block to your page and paste the one-line WallTrust embed snippet. The widget renders your approved testimonials automatically." },
        { question: "Do I need a developer for this?", answer: "No. It's a copy-paste into a Code Block — no coding or developer needed." },
        { question: "Which Squarespace plan supports Code Blocks?", answer: "Code Blocks are available on Squarespace's Business and Commerce plans." },
      ]}
      ctaHeading="Add testimonials to Squarespace now"
    />
  );
}
