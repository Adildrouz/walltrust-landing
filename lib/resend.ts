import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "hello@walltrust.app";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your WallTrust account",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px">Welcome to WallTrust, ${name}!</h1>
        <p style="color:#64748b;margin-bottom:24px">Click the button below to verify your email and start collecting testimonials.</p>
        <a href="${url}" style="background:#3730a3;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Verify my email</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${BASE_URL}/auth/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your WallTrust password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:8px">Reset your password</h1>
        <p style="color:#64748b;margin-bottom:24px">Hi ${name}, click below to choose a new password. This link expires in 1 hour.</p>
        <a href="${url}" style="background:#3730a3;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Reset password</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendNewTestimonialEmail(
  email: string,
  name: string,
  authorName: string,
  pageTitle: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `New testimonial from ${authorName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:20px;font-weight:700;color:#0f172a">New testimonial received 🎉</h1>
        <p style="color:#64748b"><strong>${authorName}</strong> just submitted a testimonial on your "${pageTitle}" collection page.</p>
        <a href="${BASE_URL}/dashboard/testimonials" style="background:#3730a3;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-top:16px">Review &amp; approve</a>
      </div>
    `,
  });
}

export async function sendWaitlistConfirmationEmail(email: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "You're on the WallTrust waitlist 🎉",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:12px">You're in!</h1>
        <p style="color:#64748b;line-height:1.6">
          When WallTrust launches, you'll get <strong>3 months of the Starter plan free</strong>
          (a $21 value) — unlimited testimonials, Google Rich Snippets, no widget branding.
        </p>
        <p style="color:#64748b;line-height:1.6;margin-top:16px">
          I'll email you the moment we go live. No spam before then.
        </p>
        <p style="color:#94a3b8;font-size:13px;margin-top:32px">
          — Adil, WallTrust founder<br>
          P.S. Reply to this email if you have a specific testimonial
          collection problem — I read every reply.
        </p>
      </div>
    `,
  });
}

export async function sendWaitlistLaunchEmail(email: string, couponCode: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "WallTrust is live — your 3 free months are ready",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:12px">WallTrust is live 🚀</h1>
        <p style="color:#64748b;line-height:1.6">
          Your 3 months of Starter plan are ready. Use this code at checkout:
        </p>
        <div style="background:#EEF2FF;color:#3730A3;font-size:18px;font-weight:700;padding:12px 20px;border-radius:8px;text-align:center;margin:20px 0;letter-spacing:1px">
          ${couponCode}
        </div>
        <a href="${BASE_URL}/auth/signup" style="background:#3730a3;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Create your account
        </a>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px">
          Questions? Just reply to this email.
        </p>
      </div>
    `,
  });
}

export async function sendRenewalReminderEmail(
  email: string,
  name: string,
  plan: string,
  renewalDate: Date
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your WallTrust subscription renews in 7 days",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:20px;font-weight:700;color:#0f172a">Renewal reminder</h1>
        <p style="color:#64748b">Hi ${name}, your <strong>${plan}</strong> plan renews on <strong>${renewalDate.toLocaleDateString(
          "en-US",
          { dateStyle: "long" }
        )}</strong>.</p>
        <p style="color:#64748b">Want to change or cancel? One click, no waiting, no chatbot.</p>
        <a href="${BASE_URL}/dashboard/billing" style="background:#3730a3;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;margin-top:16px">Manage subscription</a>
      </div>
    `,
  });
}
