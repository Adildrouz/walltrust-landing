import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "How to Add Testimonials to WordPress — WallTrust Widget",
  description:
    "Add a testimonial widget to your WordPress site in 2 minutes. No plugin needed. Just paste one line of code in any WordPress page or widget.",
  alternates: { canonical: "/integrations/wordpress" },
};

export default function WordPressIntegrationPage() {
  return (
    <MarketingArticle
      badge="Integration"
      h1="Add Testimonials to WordPress (No Plugin Required)"
      lede="You don't need a plugin to show testimonials on WordPress. Paste one line of code and you're done — here's the exact 5-step process."
      sections={[
        {
          heading: "Step-by-step",
          steps: [
            "Sign up for WallTrust (free) and collect your first testimonials.",
            "Approve the testimonials you want to display from your dashboard.",
            "Copy your embed code from the Widget page.",
            "In WordPress, go to Pages → Edit → add a Custom HTML block.",
            "Paste the script tag, then Save. Done.",
          ],
        },
        {
          heading: "Your embed code",
          code: `<div id="walltrust-widget"></div>
<script src="https://walltrust.app/api/widget/YOUR_ID" async></script>`,
        },
        {
          heading: "Works with every WordPress builder",
          bullets: ["Gutenberg (Custom HTML block)", "Elementor (HTML widget)", "Divi (Code module)", "Classic editor (Text/HTML tab)"],
        },
      ]}
      faqItems={[
        { question: "Do I need a WordPress plugin for WallTrust?", answer: "No. WallTrust embeds with a single HTML script tag, so there's no plugin to install, update, or maintain." },
        { question: "Will it slow down my WordPress site?", answer: "No. The widget script loads asynchronously, so it never blocks your page from rendering." },
        { question: "Where can I place the testimonial widget in WordPress?", answer: "Anywhere you can add a Custom HTML block — pages, posts, or a widget area like the sidebar or footer." },
      ]}
      ctaHeading="Add testimonials to WordPress now"
    />
  );
}
