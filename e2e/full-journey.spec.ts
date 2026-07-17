import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  getUserId,
  getCollectionPageBySlug,
  getUserBillingState,
} from "./support/db";
import { getTestEmailLog, newEmailsSince } from "./support/emails";
import { signWebhookPayload, lemonSqueezyWebhookPayload } from "./support/webhook";

/**
 * Section 12: the final go/no-go gate — one comprehensive test chaining the
 * entire real user journey end to end, using a fresh randomly-generated
 * email each run (no manual cleanup needed between runs).
 *
 * Deliberately does NOT use the `testUser` fixture (fixtures/auth.ts) —
 * that fixture signs up via a raw API call and logs in directly, which is
 * exactly the shortcut this test exists to NOT take. Every step here drives
 * the real UI (or the real public API where the real UI is Lemon
 * Squeezy's own hosted page, which we don't control/own — see step 13).
 *
 * Two real discrepancies between this section's scope and the actual app
 * were found and resolved (not silently) while building this:
 *
 * 1. Homepage (public/index.html) "Start free" / "Get started free" CTAs
 *    all link to "#waitlist" today, not /auth/signup — this app is still
 *    in its pre-launch waitlist-collection phase at the marketing layer,
 *    even though the full product underneath is built. There is no click
 *    path from the homepage to real signup right now. Step 1 below
 *    confirms the homepage loads; step 2 navigates directly to
 *    /auth/signup rather than fabricating a click that wouldn't do what
 *    the original scope assumed.
 *
 * 2. Every account — including a fresh signup — starts with exactly ONE
 *    auto-created default collection page, AND the Free plan caps total
 *    pages at ONE (see e2e/collection-pages.spec.ts's "fresh account
 *    state" tests). Literally creating a second page titled "Client
 *    Feedback" would immediately hit that cap and 403 before the journey
 *    could even continue. Step 7 below instead renames the existing
 *    auto-created default page to "Client Feedback" — same end state (one
 *    real collection page, that title, a real public URL), and it
 *    conveniently sets up the exact "already at the plan's page limit"
 *    precondition step 13 needs in order to prove the upgrade actually
 *    lifts it.
 *
 * 3. Found by actually running this test the first time (not caught during
 *    review): step 12 (rich snippets) happens BEFORE step 13 (upgrade), so
 *    the account is still on the Free plan when it's checked — and Rich
 *    Snippets is gated behind hasRichSnippets (false on Free; see Section
 *    6's rich-snippets.spec.ts). The first version of this test wrongly
 *    expected real JSON-LD at step 12 and hung for the full 120s timeout
 *    waiting for a testid (jsonld-code) that was never going to render on
 *    a free-plan account. Fixed by asserting the correct free-plan reality
 *    at step 12 (upgrade-prompt shown, no JSON-LD yet), then asserting the
 *    real JSON-LD appears right after step 13's upgrade instead — which
 *    doubles as a second, independent proof (alongside the page-limit
 *    check) that the plan actually lifted with no logout in between.
 *
 * Step 13 is the direct proof of the JWT plan-staleness fix (see
 * auth.ts's jwt callback + components/billing/PlanSyncOnSuccess.tsx): it
 * asserts plan limits lift immediately after landing on
 * /dashboard/billing?success=true — the real post-checkout redirect
 * target — with NO logout/login in between. e2e/billing.spec.ts's
 * equivalent test still uses an explicit logout/login
 * (reloginToRefreshSession) specifically because that test's job is to
 * prove the DB-side enforcement independent of the UI-sync fix; this test
 * proves the fix itself.
 *
 * Step 14 (cancellation) applies the same resolution already agreed in
 * Section 7: the real webhook route treats subscription_cancelled as a
 * grace period (status/renewal date change only, plan untouched) and only
 * subscription_expired actually reverts plan to "free" — confirmed by
 * reading app/api/billing/webhook/route.ts. This test does NOT expect (and
 * does not assert) that the downgrade reflects in the UI without a
 * logout — the PlanSyncOnSuccess fix is scoped specifically to the
 * checkout-success landing, not any downgrade path, so overclaiming that
 * here would be dishonest about what was actually fixed. Only the DB-level
 * plan transition is asserted for step 14, matching what Section 7 already
 * established as correct.
 */

async function loginViaUI(page: Page, email: string, password: string) {
  // Mirrors fixtures/auth.ts's own retry loop: react-hook-form's onSubmit
  // isn't wired until hydration completes, so a click before that falls
  // through to a native form GET submit instead of the real handler.
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/dashboard|password=/, { timeout: 10_000 });
    if (!page.url().includes("password=")) return;
  }
  throw new Error(`loginViaUI: login did not reach /dashboard (url=${page.url()})`);
}

test("the full real user journey: homepage through signup, verification, page creation, public submission, moderation, widget, rich snippets, upgrade, cancellation, and logout", async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(120_000);

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const name = "Journey Tester";
  const email = `journey-${unique}@walltrust-e2e.test`;
  const password = "TestPassword123!";

  // ---- Step 1: visit homepage ----
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator(".hero-h1")).toBeVisible();

  // ---- Step 2: "click Start free" — see file header re: the #waitlist discrepancy ----
  await page.goto("/auth/signup");
  await page.waitForLoadState("networkidle");

  // ---- Step 3: complete signup with a fresh test email ----
  const emailLogBefore = (await getTestEmailLog(request)).length;

  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Check your email")).toBeVisible();

  // ---- Step 4: retrieve the verification link via the mocked email log ----
  const newEmails = await newEmailsSince(request, emailLogBefore);
  const verificationEmail = newEmails.find(
    (e) => e.to === email && e.subject === "Verify your WallTrust account"
  );
  expect(verificationEmail, "verification email should have been logged by lib/resend.ts's test-mode stub").toBeTruthy();
  const tokenMatch = verificationEmail!.html.match(/token=([a-f0-9]+)/);
  expect(tokenMatch, "verification email body should contain a token= link").toBeTruthy();
  const verificationToken = tokenMatch![1];

  // ---- Step 5: visit the verification link, confirm redirect to login with success banner ----
  await page.goto(`/api/auth/verify-email?token=${verificationToken}`);
  await expect(page).toHaveURL(/\/auth\/login\?verified=true/);
  await expect(page.getByText("Email verified! You can now sign in.")).toBeVisible();

  // ---- Step 6: log in ----
  await loginViaUI(page, email, password);
  await expect(page).toHaveURL(/\/dashboard/);

  // ---- Step 7: "create a collection page titled Client Feedback" — see file header re: renaming the auto-created default page ----
  await page.goto("/dashboard/pages");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("page-row")).toHaveCount(1); // the auto-created default page

  const defaultRow = page.getByTestId("page-row").first();
  await defaultRow.getByTestId("edit-page-button").click();
  await page.getByLabel("Title").fill("Client Feedback");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(defaultRow.getByTestId("page-title")).toHaveText("Client Feedback");

  // ---- Step 8: extract its public URL ----
  const slugText = (await defaultRow.getByTestId("page-slug").textContent()) ?? "";
  const slug = slugText.replace(/^\/c\//, "").trim();
  expect(slug.length).toBeGreaterThan(0);

  // Free plan is capped at 1 page — confirm that's actually the state here
  // (not just assumed), since step 13 depends on this being the real,
  // active "before" condition it proves gets lifted.
  await expect(page.getByRole("button", { name: "New page" })).toBeDisabled();

  // ---- Step 9: a different visitor (separate browser context, no shared session) submits a testimonial ----
  const visitorContext = await browser.newContext();
  const visitorPage = await visitorContext.newPage();
  await visitorPage.goto(`/c/${slug}`);
  await visitorPage.waitForLoadState("networkidle");

  await visitorPage.getByRole("button", { name: "5 stars" }).click();
  await visitorPage.getByLabel("Your testimonial").fill(
    "The full journey worked flawlessly from start to finish — highly recommend."
  );
  await visitorPage.getByLabel("Name *").fill("Priya Shah");
  await visitorPage.getByLabel("Title / role").fill("Head of Marketing");
  await visitorPage.getByRole("button", { name: "Submit testimonial" }).click();
  await expect(visitorPage.getByText("Thank you! 🎉")).toBeVisible();
  await visitorContext.close();

  // ---- Step 10: back in the original authenticated context, approve the pending submission ----
  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");
  const testimonialCard = page.getByTestId("testimonial-card").filter({ hasText: "Priya Shah" });
  await expect(testimonialCard).toBeVisible();
  await expect(testimonialCard).toHaveAttribute("data-status", "pending");
  await testimonialCard.getByRole("button", { name: "Approve" }).click();
  await expect(testimonialCard).toHaveAttribute("data-status", "approved");

  // ---- Step 11: widget embed script includes the just-approved testimonial ----
  await page.goto("/dashboard/widget");
  await page.waitForLoadState("networkidle");
  const userId = await getUserId(email);
  const widgetRes = await page.request.get(`/api/widget/${userId}`);
  expect(widgetRes.ok()).toBeTruthy();
  const widgetBody = await widgetRes.text();
  expect(widgetBody).toContain("Priya Shah");
  expect(widgetBody).toContain("worked flawlessly from start to finish");

  // ---- Step 12: rich snippets ----
  // The account is still on the Free plan at this point in the journey —
  // upgrade doesn't happen until step 13 — and Rich Snippets is gated
  // behind hasRichSnippets (false on Free, see lib/utils.ts's PLAN_LIMITS
  // and Section 6's rich-snippets.spec.ts). So the correct thing to see
  // here is the upgrade prompt, not JSON-LD; asserting the real JSON-LD
  // content happens below, right after step 13's upgrade — which doubles
  // as a second, independent proof (alongside the page-limit check) that
  // the plan actually lifted with no logout in between.
  await page.goto("/dashboard/rich-snippets");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("upgrade-prompt")).toBeVisible();
  await expect(page.getByTestId("jsonld-code")).toHaveCount(0);

  // ---- Step 13: simulate an upgrade via webhook — assert plan limits lift with NO logout/login ----
  const upgradePayload = lemonSqueezyWebhookPayload({
    eventName: "subscription_created",
    userId,
    subscriptionId: `sub-journey-${unique}`,
    variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!,
    status: "active",
    renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });
  const upgradeRes = await page.request.post("/api/billing/webhook", {
    data: upgradePayload,
    headers: { "content-type": "application/json", "x-signature": signWebhookPayload(upgradePayload) },
  });
  expect(upgradeRes.ok()).toBeTruthy();
  expect((await getUserBillingState(email)).plan).toBe("starter"); // DB updated correctly by the webhook

  // The real post-checkout redirect target (see app/api/billing/checkout/route.ts's
  // redirectUrl) — this is what triggers PlanSyncOnSuccess's useSession().update().
  await page.goto("/dashboard/billing?success=true");
  // PlanSyncOnSuccess calls update() then router.refresh() then
  // router.replace("/dashboard/billing") — waiting for that replace to land
  // is the signal the async sync actually completed before asserting on it.
  await page.waitForURL(/\/dashboard\/billing$/, { timeout: 10_000 });
  // A plain text match here is ambiguous: the "Current plan" badge and the
  // Starter-tier plan-option card further down the SAME page both say
  // "Starter" — the latter always does, regardless of the user's actual
  // plan, since it's just labeling that tier as available. Added
  // data-testid="current-plan-badge" to the actual "Current plan" badge
  // (app/(dashboard)/dashboard/billing/page.tsx) to disambiguate.
  await expect(page.getByTestId("current-plan-badge")).toHaveText("Starter");

  // The direct proof: the SAME free-plan page-limit gate from step 8,
  // re-checked on the SAME still-logged-in session, now lifted.
  await page.goto("/dashboard/pages");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: "New page" })).toBeEnabled();

  // Second independent proof, closing the loop on step 12: Rich Snippets —
  // gated on Free, checked above — now shows the real JSON-LD reflecting
  // the one approved testimonial, on this SAME still-logged-in session.
  await page.goto("/dashboard/rich-snippets");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("upgrade-prompt")).toHaveCount(0);
  const jsonLdRaw = await page.getByTestId("jsonld-code").textContent();
  expect(jsonLdRaw).toBeTruthy();
  const jsonLd = JSON.parse(
    jsonLdRaw!.replace(/^<script[^>]*>/, "").replace(/<\/script>\s*$/, "").trim()
  );
  expect(jsonLd["@context"]).toBe("https://schema.org");
  expect(jsonLd.aggregateRating.reviewCount).toBe(1);
  expect(jsonLd.aggregateRating.ratingValue).toBe("5.0"); // the one 5-star testimonial from step 9

  // ---- Step 14: cancellation → plan reverts to free (DB-level; see file header on scope) ----
  const cancelPayload = lemonSqueezyWebhookPayload({
    eventName: "subscription_cancelled",
    userId,
    subscriptionId: `sub-journey-${unique}`,
    status: "cancelled",
    endsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  });
  await page.request.post("/api/billing/webhook", {
    data: cancelPayload,
    headers: { "content-type": "application/json", "x-signature": signWebhookPayload(cancelPayload) },
  });
  // Real grace-period behavior (established in Section 7): cancelled ≠
  // immediately downgraded — plan is untouched until the sub actually expires.
  expect((await getUserBillingState(email)).plan).toBe("starter");

  const expirePayload = lemonSqueezyWebhookPayload({
    eventName: "subscription_expired",
    userId,
    subscriptionId: `sub-journey-${unique}`,
    status: "expired",
  });
  await page.request.post("/api/billing/webhook", {
    data: expirePayload,
    headers: { "content-type": "application/json", "x-signature": signWebhookPayload(expirePayload) },
  });
  expect((await getUserBillingState(email)).plan).toBe("free");

  // ---- Step 15: log out, confirm /dashboard requires re-authentication ----
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/auth\/login/);

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);

  // Belt-and-suspenders: the collection page created in this journey is
  // still exactly where step 7 left it — nothing downstream silently
  // mutated or deleted it.
  const finalPage = await getCollectionPageBySlug(slug);
  expect(finalPage!.title).toBe("Client Feedback");
});
