import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Testimonial Tool for Coaches 2026 — WallTrust",
  description:
    "Collect client success stories and display them on your coaching website. Build credibility and fill your calendar — from $7/mo.",
  alternates: { canonical: "/for/coaches" },
};

export default function ForCoachesPage() {
  return (
    <MarketingArticle
      badge="For Coaches"
      h1="Turn Client Wins Into Your Best Sales Tool"
      lede="Prospects want proof before they commit to coaching. Testimonials are your proof — WallTrust makes collecting and showing them effortless."
      sections={[
        {
          heading: "Collect success stories on autopilot",
          paragraphs: [
            "Share your collection link after each session milestone or program completion, while the win is still fresh. Clients submit a rating and a few words in about a minute — no account, no friction.",
          ],
        },
        {
          heading: "Your shareable Wall of Love",
          paragraphs: [
            "Every WallTrust account gets a public wall page at /wall/yourname. Drop the link in your Instagram bio, share it in stories, or send it to warm leads — it's social proof you can share anywhere, not just on your site.",
          ],
        },
        {
          heading: "Appear as a 5-star coach in Google",
          paragraphs: [
            "WallTrust generates Google Rich Snippet (AggregateRating) markup from $7/mo, so your star rating can show directly in search results when prospects look you up — a credibility boost most coaching tools can't offer.",
          ],
        },
      ]}
      faqItems={[
        { question: "How do coaches collect testimonials automatically?", answer: "Create a collection page and share its link after each milestone or at program end. Clients submit a rating and short story in about a minute. New submissions land in your dashboard to approve." },
        { question: "Can I show testimonials on my booking page?", answer: "Yes. Paste the one-line widget embed onto your booking or landing page (Calendly embed page, Webflow, WordPress, etc.) to display approved testimonials." },
        { question: "Will testimonials help me get more coaching clients?", answer: "Social proof is one of the strongest conversion levers for high-trust services like coaching. Visible success stories and a Google star rating reduce hesitation for prospects on the fence." },
      ]}
      ctaHeading="Fill your calendar with proof that sells"
    />
  );
}
