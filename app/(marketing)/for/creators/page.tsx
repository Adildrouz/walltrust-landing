import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Testimonial Wall for Creators & Newsletters 2026 — WallTrust",
  description:
    "Build a wall of love from your audience. Collect reader and subscriber testimonials and display them to attract more fans — from $7/mo.",
  alternates: { canonical: "/for/creators" },
};

export default function ForCreatorsPage() {
  return (
    <MarketingArticle
      badge="For Creators"
      h1="Turn Audience Love Into Social Proof"
      lede="Your audience already loves what you make. WallTrust helps you capture that love and show it off to attract even more fans."
      sections={[
        {
          heading: "Made for every kind of creator",
          bullets: [
            "Newsletter writers — collect subscriber testimonials",
            "YouTubers — gather viewer shout-outs",
            "Course creators — turn student wins into enrollments",
            "Podcasters — show listener love on your site",
          ],
        },
        {
          heading: "Your shareable Wall of Love",
          paragraphs: [
            "Every account gets a public wall at /wall/yourname — a beautiful, shareable page of your best testimonials. Post it to social, link it in your bio, or feature it on your landing page.",
          ],
        },
        {
          heading: "One link, everywhere you publish",
          paragraphs: [
            'Add your collection link to your newsletter footer — "Enjoying this? Leave a quick note: walltrust.app/c/yourname" — and watch testimonials roll in from your most engaged readers.',
          ],
        },
      ]}
      faqItems={[
        { question: "How do creators collect testimonials from their audience?", answer: "Share your WallTrust collection link in your newsletter footer, video description, or social bio. Fans submit a short testimonial in about a minute — no account needed." },
        { question: "What is a Wall of Love?", answer: "It's a public page (/wall/yourname) that displays all your approved testimonials in an attractive grid you can share anywhere to build credibility." },
        { question: "Can I display audience testimonials on my site?", answer: "Yes. Embed the widget with one line of code on any creator site, course page, or landing page to show approved testimonials automatically." },
      ]}
      ctaHeading="Build your wall of love"
    />
  );
}
