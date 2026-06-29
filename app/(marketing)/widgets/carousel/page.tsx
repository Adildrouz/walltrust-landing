import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Testimonial Carousel Widget — Auto-Rotating Reviews | WallTrust",
  description:
    "Display testimonials in an auto-rotating carousel. Smooth animations, mobile-friendly, one line of code.",
  alternates: { canonical: "/widgets/carousel" },
};

export default function CarouselWidgetPage() {
  return (
    <MarketingArticle
      badge="Widget"
      h1="Testimonial Carousel Widget"
      lede="Rotate through your best testimonials in a compact, eye-catching carousel — perfect when you want social proof without taking up much space."
      sections={[
        {
          heading: "Smooth, respectful animation",
          paragraphs: [
            "The carousel auto-advances through your testimonials with a smooth scroll, then loops back to the start. It honors the visitor's reduced-motion preference, so it never animates for people who've asked their device to limit motion.",
          ],
        },
        {
          heading: "Embed it in one line",
          code: `<div id="walltrust-widget"></div>
<script src="https://www.walltrust.app/api/widget/YOUR_ID" async></script>`,
          note: "Select the Carousel style on your dashboard Widget page, then copy your code.",
        },
        {
          heading: "Mobile-friendly by default",
          paragraphs: [
            "On smaller screens the carousel becomes a horizontal swipe, so it stays usable and fast on phones without any extra configuration.",
          ],
        },
      ]}
      faqItems={[
        { question: "How do I add a rotating testimonial carousel to my site?", answer: "Choose the Carousel style on your dashboard Widget page, copy the one-line embed code, and paste it into your site. It auto-rotates and is swipeable on mobile." },
        { question: "Does the carousel respect reduced-motion settings?", answer: "Yes. If a visitor has enabled reduced motion, the carousel won't auto-animate — it stays accessible." },
        { question: "Can I control how many testimonials appear?", answer: "Yes. Set the maximum number of items and a minimum rating filter on the Widget page in your dashboard." },
      ]}
      ctaHeading="Add a testimonial carousel today"
    />
  );
}
