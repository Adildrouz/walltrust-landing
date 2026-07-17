import type { Metadata } from "next";
import { AlternativePage } from "@/components/marketing/AlternativePage";

export const metadata: Metadata = {
  title: "Best WiserReview Alternative 2026 — WallTrust for Freelancers",
  description:
    "WiserReview is built for e-commerce stores. WallTrust is built for freelancers and solopreneurs — simpler setup, no product catalog needed, from $7/mo.",
  alternates: { canonical: "/compare/wiserreview-alternative" },
};

export default function WiserReviewAlternativePage() {
  return (
    <AlternativePage
      competitorName="WiserReview"
      h1="WiserReview Alternative: Built for Freelancers, Not Just E-commerce"
      subheading="WiserReview is a solid e-commerce review tool. But if you're a freelancer, coach, or solopreneur without a product catalog, WallTrust fits your workflow better."
      comparisonRows={[
        { feature: "Starting price", competitor: "$9/mo (100 reviews/mo on free)", walltrust: "$7/mo", win: true },
        { feature: "Free plan", competitor: "100 reviews/month, resets monthly", walltrust: "5 testimonials, no reset needed", win: true },
        { feature: "Built for", competitor: "E-commerce (Shopify, WooCommerce)", walltrust: "Freelancers, coaches, solopreneurs" },
        { feature: "Google Rich Snippets", competitor: "Included on free", walltrust: "Included from $7/mo" },
        { feature: "Setup complexity", competitor: "Product catalog integration required", walltrust: "1 collection link, no catalog needed", win: true },
        { feature: "Unlimited testimonials", competitor: "$9/mo tier (5,000/mo cap)", walltrust: "$7/mo, truly unlimited", win: true },
        { feature: "No branding", competitor: "Not clearly stated", walltrust: "$7/mo ✓", win: true },
        { feature: "Widget types", competitor: "18+ styles", walltrust: "Grid, Carousel, Single, Badge" },
      ]}
      reasonsToLeave={[
        { title: "Everything assumes a product catalog", body: "WiserReview's onboarding assumes you have products, SKUs, and order data to attach reviews to — a model that doesn't map to freelancers or coaches selling time and sessions." },
        { title: "Free reviews reset every month", body: "WiserReview's free plan caps out at 100 reviews per month and resets monthly, instead of letting existing reviews stay live for free." },
        { title: "Built for stores, not service businesses", body: "Order-based review requests and product page widgets are built for e-commerce — features a solopreneur without a store will never use." },
      ]}
      differentiators={[
        { title: "No product catalog required", body: "WallTrust skips the catalog entirely: one shareable link, your client submits a testimonial, you approve it, done." },
        { title: "Free testimonials that don't expire", body: "WallTrust's free plan lets your 5 testimonials stay live permanently — no monthly reset, no expiry pressure like WiserReview's 100/month cap." },
        { title: "Built specifically for freelancers and solopreneurs", body: "No SKUs, no order data, no store integration — just a simple collection link that fits how service businesses actually collect feedback." },
      ]}
      faqItems={[
        { question: "Is WallTrust a good WiserReview alternative for freelancers?", answer: "Yes. WiserReview is optimized for e-commerce stores with product catalogs. WallTrust is built for freelancers and solopreneurs who need a simple testimonial link without any store setup." },
        { question: "Does WallTrust have Google Rich Snippets like WiserReview?", answer: "Yes. Both WiserReview and WallTrust include Google Rich Snippets, but WallTrust includes unlimited testimonials from $7/mo without a monthly reset cap." },
        { question: "Can I use WallTrust without a Shopify or WooCommerce store?", answer: "Yes, that's exactly what WallTrust is built for. No product catalog, no e-commerce platform needed — just a shareable collection link." },
      ]}
    />
  );
}
