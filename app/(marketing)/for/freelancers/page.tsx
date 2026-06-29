import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/MarketingArticle";

export const metadata: Metadata = {
  title: "Best Testimonial Tool for Freelancers 2026 — WallTrust",
  description:
    "Collect client testimonials and display them on your portfolio. WallTrust helps freelancers build trust and win more clients — from $7/mo.",
  alternates: { canonical: "/for/freelancers" },
};

export default function ForFreelancersPage() {
  return (
    <MarketingArticle
      badge="For Freelancers"
      h1="Testimonial Tool Built for Freelancers"
      lede="You do great work. But prospects don't know that yet. WallTrust turns happy clients into proof that wins your next project."
      sections={[
        {
          heading: "How WallTrust helps freelancers",
          bullets: [
            "Share a collection link in your invoice footer or project wrap-up email",
            "Clients submit in 60 seconds — no account needed",
            "Embed the widget on your portfolio site with one line of code",
            "Google star ratings appear in search results (Rich Snippets) from $7/mo",
          ],
        },
        {
          heading: "A simple ask that actually works",
          paragraphs: [
            'After completing a project, send: "I\'d love a quick testimonial — it only takes 60 seconds: walltrust.app/c/yourname". That\'s it. No login, no friction, no chasing.',
          ],
        },
        {
          heading: "Better than asking for a Google review",
          paragraphs: [
            "Clients rarely follow through on \"please leave a Google review\" — it means logging into an account and writing a public post. A WallTrust link takes 60 seconds and lands the testimonial straight in your dashboard, ready to approve and display.",
          ],
        },
      ]}
      faqItems={[
        { question: "How do I collect testimonials as a freelancer?", answer: "Create a collection page in WallTrust, then share its link (or QR code) with clients after a project. They submit a rating, text, and optional photo in about 60 seconds — no account required." },
        { question: "Can I add testimonials to my portfolio?", answer: "Yes. Copy your one-line embed code and paste it into any portfolio site (WordPress, Webflow, Framer, plain HTML) to display an auto-updating widget of approved testimonials." },
        { question: "Do I need coding skills to embed the widget?", answer: "No. The widget is a single <script> tag you paste once. It loads asynchronously and styles itself to match your site." },
      ]}
      ctaHeading="Win your next client with proof"
    />
  );
}
