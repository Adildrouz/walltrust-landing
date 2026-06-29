import type { Metadata } from "next";
import { IndexPage } from "@/components/marketing/IndexPage";

export const metadata: Metadata = {
  title: "Testimonial Widget Types — Grid, Carousel, Badge & More | WallTrust",
  description:
    "Choose from Grid, Carousel, Single Quote, and Badge widgets. Embed testimonials anywhere with one line of code. No coding required.",
  alternates: { canonical: "/widgets" },
};

export default function WidgetsIndexPage() {
  return (
    <IndexPage
      h1="Testimonial Widget Types"
      lede="Pick the layout that fits your site. Every widget embeds with one line of code and updates automatically as you approve new testimonials."
      cards={[
        { title: "Grid Widget", description: "A responsive grid of testimonial cards — great for landing pages.", href: "/widgets/grid" },
        { title: "Carousel Widget", description: "Auto-rotating testimonials with smooth, mobile-friendly animation.", href: "/widgets/carousel" },
        { title: "Badge Widget", description: "A compact star-rating badge for headers, footers, and pricing pages.", href: "/widgets/badge" },
      ]}
      ctaHeading="Embed your widget in one line of code"
    />
  );
}
