import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Testimonial Badge Widget — Show Your Star Rating | WallTrust",
  description:
    "Display a compact star rating badge from your testimonials. Perfect for headers, footers, and pricing pages.",
  alternates: { canonical: "/widgets/badge" },
};

export default function BadgeWidgetPage() {
  return (
    <MarketingArticle
      badge="Widget"
      h1="Testimonial Badge Widget"
      lede="A small, high-impact star-rating badge that summarizes all your testimonials in one glance — ideal for headers, footers, and pricing pages."
      sections={[
        {
          heading: "Social proof in a single line",
          paragraphs: [
            "The badge shows your average star rating and total review count in a compact pill. It's the lightest way to add credibility exactly where buying decisions happen — next to your CTA or pricing.",
          ],
        },
        {
          heading: "Embed it in one line",
          code: `<div id="walltrust-widget"></div>
<script src="https://www.walltrust.app/api/widget/YOUR_ID" async></script>`,
          note: "Pick the Badge style on your dashboard Widget page to get this layout.",
        },
        {
          heading: "Pairs with Google Rich Snippets",
          paragraphs: [
            "Show the badge on-site while WallTrust's Rich Snippet (AggregateRating) markup helps the same star rating appear in Google search results — on-page and in-search credibility together, from $7/mo.",
          ],
        },
      ]}
      faqItems={[
        { question: "How do I show a star rating badge on my website?", answer: "Select the Badge style on your dashboard Widget page, copy the one-line embed code, and paste it into your header, footer, or pricing section." },
        { question: "What does the badge display?", answer: "It shows your average rating (e.g. 4.9) and the number of reviews, with stars — a compact summary of all your approved testimonials." },
        { question: "Does the badge work with Google Rich Snippets?", answer: "Yes. Use the badge on-site and WallTrust's AggregateRating JSON-LD (from $7/mo) so the rating can also appear in Google search results." },
      ]}
      ctaHeading="Add a star-rating badge today"
    />
  );
}
