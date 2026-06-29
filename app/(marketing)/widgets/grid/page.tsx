import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Testimonial Grid Widget — Embed a Grid of Reviews | WallTrust",
  description:
    "Display customer testimonials in a responsive grid layout. Copy one line of code and embed anywhere. Free plan available.",
  alternates: { canonical: "/widgets/grid" },
};

export default function GridWidgetPage() {
  return (
    <MarketingArticle
      badge="Widget"
      h1="Testimonial Grid Widget"
      lede="Show off multiple testimonials at once in a clean, responsive grid — the most popular layout for landing pages and portfolios."
      sections={[
        {
          heading: "What the grid widget looks like",
          paragraphs: [
            "Approved testimonials are arranged in a responsive card grid that reflows from three columns on desktop down to a single column on mobile. Each card shows the rating, the testimonial text, and the author with their photo or initials.",
          ],
        },
        {
          heading: "Embed it in one line",
          code: `<div id="walltrust-widget"></div>
<script src="https://www.walltrust.app/api/widget/YOUR_ID" async></script>`,
          note: "Find your exact code (with your ID prefilled) on the Widget page in your dashboard.",
        },
        {
          heading: "Works everywhere",
          bullets: [
            "WordPress (Custom HTML block)",
            "Webflow (Embed element)",
            "Framer (Embed)",
            "Shopify (Custom HTML)",
            "Squarespace, Wix, and any plain HTML site",
          ],
        },
      ]}
      faqItems={[
        { question: "How do I add a testimonial grid to my website?", answer: "Configure the Grid style on your dashboard Widget page, copy the one-line embed code, and paste it where you want the grid to appear. It loads asynchronously and updates as you approve testimonials." },
        { question: "Is the grid widget mobile responsive?", answer: "Yes. The grid automatically reflows from multiple columns on desktop to a single column on mobile." },
        { question: "Can I customize the grid colors?", answer: "Yes. Set background, text, and accent colors (plus rating/avatar visibility and max items) on the Widget page in your dashboard." },
      ]}
      ctaHeading="Embed your testimonial grid today"
    />
  );
}
