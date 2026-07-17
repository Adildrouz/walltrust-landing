import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — WallTrust",
  description: "How WallTrust collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 28, 2026">
      <p>
        This Privacy Policy explains how WallTrust (&quot;we&quot;, &quot;us&quot;) collects, uses,
        and protects information when you use walltrust.app (the &quot;Service&quot;). By using the
        Service you agree to the practices described here.
      </p>

      <LegalSection heading="1. Information we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account data:</strong> your name, email address, and a securely hashed password
            when you create an account.
          </li>
          <li>
            <strong>Testimonial content:</strong> testimonials, ratings, names, titles, and images
            submitted to your collection pages by your customers.
          </li>
          <li>
            <strong>Usage data:</strong> aggregate, privacy-friendly analytics about how pages are
            visited (via Vercel Web Analytics — no cookies, no cross-site tracking).
          </li>
          <li>
            <strong>Payment data:</strong> handled entirely by our payment processor (Lemon
            Squeezy). We never see or store your full card details.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <p>
          We use your information to operate the Service, authenticate you, deliver transactional
          emails (account verification, testimonial notifications, billing reminders), process
          subscriptions, and improve the product. We do not sell your personal data.
        </p>
      </LegalSection>

      <LegalSection heading="3. Subprocessors">
        <p>We rely on a small number of trusted providers to run the Service:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>MongoDB / Railway — database hosting</li>
          <li>Vercel — application hosting and privacy-friendly analytics</li>
          <li>Resend — transactional email delivery</li>
          <li>Lemon Squeezy — subscription billing (Merchant of Record)</li>
          <li>Cloudinary — image storage for uploaded photos and logos</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Your rights">
        <p>
          Depending on your location (including under GDPR and CCPA), you may have the right to
          access, correct, export, or delete your personal data. You can delete your account and all
          associated data at any time from your dashboard settings, or by emailing us. Requests are
          honored promptly.
        </p>
      </LegalSection>

      <LegalSection heading="5. Data retention">
        <p>
          We retain your data for as long as your account is active. When you delete your account, we
          delete your user record, collection pages, testimonials, and widget configuration.
        </p>
      </LegalSection>

      <LegalSection heading="6. Contact">
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:hello@walltrust.app" className="text-primary hover:underline">
            hello@walltrust.app
          </a>
          .
        </p>
      </LegalSection>

      <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
        This document is a starting template and is not legal advice. Have it reviewed by a qualified
        professional before relying on it for compliance.
      </p>
    </LegalShell>
  );
}
