import type { Metadata } from "next";
import { IndexPage } from "@/components/marketing/IndexPage";

export const metadata: Metadata = {
  title: "WallTrust vs Competitors — Honest Comparisons 2026",
  description:
    "Compare WallTrust with Testimonial.to, Senja, Famewall, SayWall and more. See pricing, features, and why WallTrust offers more for less.",
  alternates: { canonical: "/compare" },
};

export default function CompareIndexPage() {
  return (
    <IndexPage
      h1="WallTrust vs Every Testimonial Tool (Honest Comparisons)"
      lede="We compared every major testimonial tool so you don't have to. See how WallTrust stacks up on price, features, and Google Rich Snippets."
      cards={[
        {
          title: "WallTrust vs Testimonial.to",
          description: "Unlimited testimonials and Rich Snippets from $7/mo vs $60–80/mo.",
          href: "/compare/testimonial-to-alternative",
        },
        {
          title: "WallTrust vs Senja",
          description: "No 15-testimonial cap, plus Google Rich Snippets Senja doesn't offer.",
          href: "/compare/senja-alternative",
        },
        {
          title: "WallTrust vs Famewall",
          description: "Google star ratings from $7/mo — something Famewall doesn't have.",
          href: "/compare/famewall-alternative",
        },
        {
          title: "WallTrust vs SayWall",
          description: "Same features, half the price: $7/mo vs $19/mo.",
          href: "/compare/saywall-alternative",
        },
        {
          title: "WallTrust vs Trustmary",
          description: "Built for solopreneurs, not enterprise — from $7/mo.",
          href: "/compare/trustmary-alternative",
        },
      ]}
      ctaHeading="Switch to WallTrust in under 10 minutes"
    />
  );
}
