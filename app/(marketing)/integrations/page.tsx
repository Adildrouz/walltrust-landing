import type { Metadata } from "next";
import { IndexPage } from "@/components/marketing/IndexPage";

export const metadata: Metadata = {
  title: "WallTrust Integrations — Works with WordPress, Webflow, Shopify & More",
  description:
    "Add WallTrust testimonial widgets to any website. Works with WordPress, Webflow, Shopify, Framer, Squarespace, Wix, and any HTML site.",
  alternates: { canonical: "/integrations" },
};

export default function IntegrationsIndexPage() {
  return (
    <IndexPage
      h1="Add WallTrust to Any Website"
      lede="The WallTrust widget is a single line of code, so it works anywhere you can paste HTML. Here's how to add it to the most popular platforms."
      cards={[
        { title: "WordPress", description: "Add testimonials with a Custom HTML block — no plugin required.", href: "/integrations/wordpress" },
        { title: "Webflow", description: "Paste the widget into a Webflow Embed element and publish.", href: "/integrations/webflow" },
        { title: "Shopify", description: "Show social proof on product and home pages in minutes.", href: "/integrations/shopify" },
        { title: "Framer", description: "Embed testimonials in any Framer template with one line.", href: "/integrations/framer" },
        { title: "Squarespace", description: "Use a Code Block to add testimonials — no developer needed.", href: "/integrations/squarespace" },
        { title: "Wix", description: "Embed reviews using the Wix HTML iframe element.", href: "/integrations/wix" },
      ]}
      ctaHeading="Embed testimonials on your platform"
    />
  );
}
