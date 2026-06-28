import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of WallTrust.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 28, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of walltrust.app
        (the &quot;Service&quot;). By creating an account or using the Service, you agree to these
        Terms.
      </p>

      <LegalSection heading="1. The Service">
        <p>
          WallTrust lets you collect customer testimonials via shareable links and display them on
          any website using an embeddable widget, a public wall page, and Google Rich Snippet
          (JSON-LD) markup.
        </p>
      </LegalSection>

      <LegalSection heading="2. Accounts">
        <p>
          You must provide accurate information and keep your password secure. You are responsible
          for all activity under your account. You must verify your email address before signing in.
        </p>
      </LegalSection>

      <LegalSection heading="3. Acceptable use">
        <p>
          You agree not to use the Service to publish unlawful, deceptive, or infringing content, to
          submit fabricated testimonials, or to abuse, overload, or attempt to disrupt the Service.
          You are responsible for the content you and your customers submit and for having the rights
          to display it.
        </p>
      </LegalSection>

      <LegalSection heading="4. Plans, billing, and cancellation">
        <p>
          Paid plans are billed in advance through our Merchant of Record, Lemon Squeezy. You can
          cancel at any time in one click from your billing settings; access continues until the end
          of the current billing period. Plan limits (testimonials and collection pages) are
          described on our pricing page.
        </p>
      </LegalSection>

      <LegalSection heading="5. Cancellation and termination">
        <p>
          You may delete your account at any time. We may suspend or terminate accounts that violate
          these Terms. Upon deletion, your data is removed as described in our Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection heading="6. Disclaimers and liability">
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum
          extent permitted by law, WallTrust is not liable for indirect or consequential damages, and
          our total liability is limited to the amount you paid in the preceding 12 months.
        </p>
      </LegalSection>

      <LegalSection heading="7. Changes">
        <p>
          We may update these Terms from time to time. Material changes will be communicated by email
          or in-app. Continued use after changes take effect constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          Questions? Email{" "}
          <a href="mailto:hello@walltrust.app" className="text-primary hover:underline">
            hello@walltrust.app
          </a>
          .
        </p>
      </LegalSection>

      <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
        This document is a starting template and is not legal advice. Have it reviewed by a qualified
        professional before relying on it.
      </p>
    </LegalShell>
  );
}
