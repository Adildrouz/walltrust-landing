import fs from "fs";
import path from "path";
import { test, expect } from "./fixtures/auth";
import { getVerificationToken, getUserId } from "./support/db";
import { submitTestimonial } from "./support/testimonials";
import { getTestEmailLog, newEmailsSince } from "./support/emails";
import { signWebhookPayload, lemonSqueezyWebhookPayload } from "./support/webhook";

/**
 * Section 8: Emails. Nothing here should depend on a real inbox, so
 * lib/resend.ts's existing PLAYWRIGHT_TEST stub (previously just a
 * console.log + skip, see the "Playwright's webServer sets this..." comment
 * there) was extended into an in-memory call log, exposed read-only over
 * HTTP at app/api/test/emails/route.ts (itself gated behind
 * PLAYWRIGHT_TEST, inert everywhere else) — Playwright tests run in a
 * separate process from the dev server and can't spy on an in-process
 * function call directly, so this is the boundary these tests observe.
 *
 * IMPORTANT — run this file in isolation (e.g. `npx playwright test
 * e2e/emails.spec.ts`), not concurrently with the rest of the suite. The
 * email log is a single shared, process-wide array — any other spec file's
 * test running at the same time (signups, testimonial submissions, billing
 * webhooks all send/attempt emails) would land in the same log and could
 * make the newEmailsSince() diffs in this file flaky. Tests within this
 * file are additionally forced to serial mode below for the same reason.
 *
 * subscription_created / subscription_cancelled (items 4-5 of this
 * section's scope) do NOT send any email today — app/api/billing/webhook/
 * route.ts never imports lib/resend.ts at all. There is no "subscription
 * confirmation" or "cancellation confirmation" email function anywhere in
 * the codebase. The tests below assert that current reality explicitly
 * (empty email log) rather than testing something that doesn't exist —
 * flagged as a product gap, not silently assumed to be covered.
 */
test.describe.configure({ mode: "serial" });

test("signup sends a verification email to the correct recipient with a link containing the correct token", async ({
  page,
}) => {
  const before = (await getTestEmailLog(page.request)).length;

  const email = `email-verify-${Date.now()}@walltrust-e2e.test`;
  const signupRes = await page.request.post("/api/auth/signup", {
    data: { name: "Email Verify Tester", email, password: "TestPassword123!" },
  });
  expect(signupRes.ok()).toBeTruthy();

  const newEmails = await newEmailsSince(page.request, before);
  const verificationEmail = newEmails.find((e) => e.subject === "Verify your WallTrust account");
  expect(verificationEmail).toBeTruthy();
  expect(verificationEmail!.to).toBe(email);

  const token = await getVerificationToken(email);
  expect(token).toBeTruthy();
  // The link must contain THIS signup's actual token (matched against the
  // DB, the source of truth) — not merely a token-shaped string.
  expect(verificationEmail!.html).toContain(`token=${token}`);
});

test("submitting a testimonial sends a new-testimonial notification to the page owner", async ({
  page,
  testUser,
}) => {
  const before = (await getTestEmailLog(page.request)).length;

  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Notify Test Author" });

  const newEmails = await newEmailsSince(page.request, before);
  const notifyEmail = newEmails.find((e) => e.subject === "New testimonial from Notify Test Author");
  expect(notifyEmail).toBeTruthy();
  expect(notifyEmail!.to).toBe(testUser.email);
});

test.describe("subscription webhooks currently send no email (product gap — no such function exists yet)", () => {
  test("subscription_created triggers no email", async ({ page, testUser }) => {
    const before = (await getTestEmailLog(page.request)).length;

    const userId = await getUserId(testUser.email);
    const payload = lemonSqueezyWebhookPayload({
      eventName: "subscription_created",
      userId,
      subscriptionId: "sub-email-test-created",
      variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!,
      status: "active",
    });
    const res = await page.request.post("/api/billing/webhook", {
      data: payload,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(payload) },
    });
    expect(res.ok()).toBeTruthy();

    const newEmails = await newEmailsSince(page.request, before);
    expect(newEmails).toEqual([]);
  });

  test("subscription_cancelled triggers no email", async ({ page, testUser }) => {
    const userId = await getUserId(testUser.email);
    const subscriptionId = "sub-email-test-cancelled";
    const created = lemonSqueezyWebhookPayload({
      eventName: "subscription_created",
      userId,
      subscriptionId,
      variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!,
      status: "active",
    });
    await page.request.post("/api/billing/webhook", {
      data: created,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(created) },
    });

    const before = (await getTestEmailLog(page.request)).length;
    const cancelled = lemonSqueezyWebhookPayload({
      eventName: "subscription_cancelled",
      userId,
      subscriptionId,
      status: "cancelled",
      endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    });
    const res = await page.request.post("/api/billing/webhook", {
      data: cancelled,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(cancelled) },
    });
    expect(res.ok()).toBeTruthy();

    const newEmails = await newEmailsSince(page.request, before);
    expect(newEmails).toEqual([]);
  });
});

test("every email sent uses EMAIL_FROM as the from address, never a different hardcoded address", async ({
  page,
  testUser,
}) => {
  const before = (await getTestEmailLog(page.request)).length;

  // Trigger two structurally different email templates so this isn't
  // coincidentally true of just one code path.
  const email = `email-from-${Date.now()}@walltrust-e2e.test`;
  await page.request.post("/api/auth/signup", {
    data: { name: "From Address Tester", email, password: "TestPassword123!" },
  });
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "From Address Notify Author" });

  const newEmails = await newEmailsSince(page.request, before);
  expect(newEmails.length).toBeGreaterThanOrEqual(2);

  const expectedFrom = process.env.EMAIL_FROM || "hello@walltrust.app";
  for (const sent of newEmails) {
    expect(sent.from).toBe(expectedFrom);
  }
});

test("email links use NEXTAUTH_URL as the base, and lib/resend.ts never hardcodes a different localhost URL into a template", async ({
  page,
}) => {
  // Behavioral half: in this dev environment NEXTAUTH_URL's configured
  // value already happens to be http://localhost:3000, so this alone can't
  // distinguish "used the env var" from "hardcoded the same string that
  // happens to match" — it only catches a link pointing at the wrong
  // domain entirely.
  const before = (await getTestEmailLog(page.request)).length;
  const email = `email-link-${Date.now()}@walltrust-e2e.test`;
  await page.request.post("/api/auth/signup", {
    data: { name: "Link Base Tester", email, password: "TestPassword123!" },
  });

  const newEmails = await newEmailsSince(page.request, before);
  const verificationEmail = newEmails.find((e) => e.subject === "Verify your WallTrust account");
  expect(verificationEmail).toBeTruthy();

  const expectedBase = process.env.NEXTAUTH_URL;
  expect(expectedBase).toBeTruthy();
  expect(verificationEmail!.html).toContain(`href="${expectedBase}/api/auth/verify-email?token=`);

  // Static half: this is what actually catches "a developer pasted a
  // hardcoded dev URL directly into one specific email template" — the
  // exact regression class this item is meant to guard against, and the
  // one thing the behavioral check above structurally cannot prove given
  // NEXTAUTH_URL's dev value.
  const resendSource = fs.readFileSync(path.join(process.cwd(), "lib", "resend.ts"), "utf-8");
  const offendingLines = resendSource
    .split("\n")
    .filter((line) => /localhost/i.test(line))
    .filter((line) => !/^const BASE_URL = process\.env\.NEXTAUTH_URL \|\|/.test(line.trim()));

  expect(offendingLines).toEqual([]);
});
