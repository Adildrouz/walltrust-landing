import type { Metadata } from "next";
import { IndexPage } from "@/components/marketing/IndexPage";

export const metadata: Metadata = {
  title: "WallTrust for Every Business Type — Testimonial Tool",
  description:
    "WallTrust works for freelancers, coaches, SaaS founders, agencies, e-commerce stores, and creators. See how.",
  alternates: { canonical: "/for" },
};

export default function ForIndexPage() {
  return (
    <IndexPage
      h1="WallTrust for Every Business Type"
      lede="However you sell, social proof closes the deal. See how WallTrust fits your exact use case."
      cards={[
        { title: "For Freelancers", description: "Collect client testimonials and win more work with proof on your portfolio.", href: "/for/freelancers" },
        { title: "For Coaches", description: "Turn client wins into your best sales tool and fill your calendar.", href: "/for/coaches" },
        { title: "For SaaS", description: "Add social proof to your landing page and convert more trials.", href: "/for/saas" },
        { title: "For Agencies", description: "Manage testimonials across every client from one tool.", href: "/for/agencies" },
        { title: "For Creators", description: "Build a wall of love from your audience and grow your following.", href: "/for/creators" },
      ]}
    />
  );
}
