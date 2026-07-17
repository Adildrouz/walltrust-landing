import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/auth";
import type { TestUser } from "./fixtures/auth";
import {
  getUserId,
  getUserBillingState,
  setUserPlan,
  setUserSubscriptionId,
} from "./support/db";
import { submitTestimonial } from "./support/testimonials";
import { signWebhookPayload, lemonSqueezyWebhookPayload } from "./support/webhook";

/**
 * Section 7: Billing — Lemon Squeezy checkout initiation, webhook-driven
 * plan sync, plan-limit enforcement, and the customer portal handoff.
 *
 * Explicitly NOT covered here (by design, per the section's scope): actually
 * completing a Lemon Squeezy hosted checkout. That requires real payment
 * provider interaction and test-mode card entry on their hosted page —
 * fragile and slow to automate reliably, and provides little marginal
 * confidence over directly testing what our own webhook handler does with
 * the events Lemon Squeezy would send once a checkout completes.
 *
 * Checkout creation (below) DOES hit the real Lemon Squeezy API using the
 * real credentials in .env.local — createCheckout() only creates a
 * lightweight checkout session object (no charge), so this is safe to do on
 * every run and actually proves the integration, rather than mocking it.
 *
 * getSubscription() (used by "Manage subscription") is different: it looks
 * up a real, already-existing subscription, which cannot exist in this
 * environment without a completed purchase. lib/lemonsqueezy.ts stubs that
 * one call under PLAYWRIGHT_TEST, same pattern as Cloudinary/Resend/rate-limit.
 *
 * Webhook signatures are computed with the real LEMONSQUEEZY_WEBHOOK_SECRET
 * from .env.local (see e2e/support/webhook.ts) — a test using a placeholder
 * secret would only prove its own math, not that the endpoint really
 * rejects bad signatures.
 */

async function reloginToRefreshSession(page: Page, testUser: TestUser) {
  // auth.config.ts only writes session.user.plan into the JWT at sign-in
  // (see the `jwt` callback) — it is not re-derived from the DB on every
  // request. So a plan change made directly in the DB (as this file does,
  // bypassing real payment) won't be visible to an already-logged-in
  // session until the session is refreshed. Logging out and back in mints
  // a fresh JWT from a fresh DB read, exactly like a real user's session
  // would eventually pick up a webhook-driven plan change.
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/auth\/login/, { timeout: 10_000 });

  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email", { exact: true }).fill(testUser.email);
    await page.getByLabel("Password", { exact: true }).fill(testUser.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL(/\/dashboard|password=/, { timeout: 10_000 });
    if (!page.url().includes("password=")) break;
  }

  // Same verification as the testUser fixture's own login (fixtures/auth.ts)
  // — fail loudly here rather than silently continuing on a page that
  // never actually got a fresh session, which would otherwise surface later
  // as a confusing, unrelated-looking assertion failure or timeout.
  const cookies = await page.context().cookies();
  const hasSessionCookie = cookies.some((c) => c.name.includes("session-token"));
  if (!page.url().includes("/dashboard") || !hasSessionCookie) {
    throw new Error(
      `reloginToRefreshSession: login did not establish a session (url=${page.url()}, ` +
        `cookies=${cookies.map((c) => c.name).join(", ") || "<none>"})`
    );
  }
}

test.describe("checkout initiation", () => {
  test.use({ userPlan: "free" });

  test("POST /api/billing/checkout creates a real Lemon Squeezy checkout session with a matching URL", async ({
    page,
    testUser,
  }) => {
    // testUser isn't referenced directly below — declaring it as a fixture
    // parameter is what actually establishes the logged-in session
    // page.request needs (it shares the browser context's cookies).
    //
    // Reading the response body this way (a direct API call rather than
    // through a UI click) sidesteps a CDP timing race: once the UI actually
    // triggers window.location.href (see the test below), Chrome evicts the
    // just-completed fetch's response body from the Network domain almost
    // immediately, even though the resulting navigation itself gets
    // aborted. That made `await response.json()` intermittently throw
    // "No resource with given identifier found" when read after the click.
    const res = await page.request.post("/api/billing/checkout", {
      data: { plan: "starter" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.url).toMatch(/^https:\/\/[a-z0-9-]+\.lemonsqueezy\.com\//i);
  });

  // testUser isn't referenced directly below — declaring it as a fixture
  // parameter is what actually establishes the logged-in session this test
  // needs before it can reach /dashboard/billing.
  test("clicking Upgrade to Starter triggers a redirect toward the Lemon Squeezy domain", async ({
    page,
    testUser,
  }) => {
    let capturedRedirectUrl: string | null = null;
    // Block the actual navigation to Lemon Squeezy's hosted checkout, but
    // capture the destination URL first — this only needs to prove the
    // button wires up to a real cross-domain redirect, not re-validate the
    // checkout API's response shape (covered by the test above).
    await page.route(/^https:\/\/[^/]+\.lemonsqueezy\.com\//, (route) => {
      capturedRedirectUrl = route.request().url();
      route.abort();
    });

    await page.goto("/dashboard/billing");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Upgrade to Starter" }).click();

    await expect(async () => {
      expect(capturedRedirectUrl).toMatch(/^https:\/\/[a-z0-9-]+\.lemonsqueezy\.com\//i);
    }).toPass({ timeout: 10_000 });
  });
});

test.describe("webhook events (direct POST, real HMAC signature)", () => {
  test.use({ userPlan: "free" });

  test("subscription_created upgrades the user to the plan matching the payload's variant", async ({
    page,
    testUser,
  }) => {
    const userId = await getUserId(testUser.email);
    const payload = lemonSqueezyWebhookPayload({
      eventName: "subscription_created",
      userId,
      subscriptionId: "sub-test-created-1",
      variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!,
      status: "active",
      renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });

    const res = await page.request.post("/api/billing/webhook", {
      data: payload,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(payload) },
    });
    expect(res.ok()).toBeTruthy();

    const user = await getUserBillingState(testUser.email);
    expect(user.plan).toBe("starter");
    expect(user.subscriptionStatus).toBe("active");
    expect(user.lemonsqueezySubscriptionId).toBe("sub-test-created-1");
  });

  test("subscription_updated changes the plan and status to match the new payload", async ({
    page,
    testUser,
  }) => {
    const userId = await getUserId(testUser.email);
    const subscriptionId = "sub-test-updated-1";

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
    expect((await getUserBillingState(testUser.email)).plan).toBe("starter");

    // Simulates the user changing plan on the same subscription (e.g. Starter -> Pro).
    const updated = lemonSqueezyWebhookPayload({
      eventName: "subscription_updated",
      userId,
      subscriptionId,
      variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID!,
      status: "active",
      renewsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    });
    const res = await page.request.post("/api/billing/webhook", {
      data: updated,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(updated) },
    });
    expect(res.ok()).toBeTruthy();

    const user = await getUserBillingState(testUser.email);
    expect(user.plan).toBe("pro");
    expect(user.subscriptionStatus).toBe("active");
  });

  test("subscription_cancelled leaves the plan unchanged (grace period) until subscription_expired actually reverts it to free", async ({
    page,
    testUser,
  }) => {
    const userId = await getUserId(testUser.email);
    const subscriptionId = "sub-test-cancel-1";

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
    expect((await getUserBillingState(testUser.email)).plan).toBe("starter");

    const endsAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const cancelled = lemonSqueezyWebhookPayload({
      eventName: "subscription_cancelled",
      userId,
      subscriptionId,
      status: "cancelled",
      endsAt,
    });
    const cancelRes = await page.request.post("/api/billing/webhook", {
      data: cancelled,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(cancelled) },
    });
    expect(cancelRes.ok()).toBeTruthy();

    // Per app/api/billing/webhook/route.ts's own comment: "Cancelled but
    // typically retains access until renews_at" — plan access is NOT pulled
    // immediately on cancellation, only subscriptionStatus/renewalDate change.
    let user = await getUserBillingState(testUser.email);
    expect(user.plan).toBe("starter");
    expect(user.subscriptionStatus).toBe("cancelled");
    expect(new Date(user.renewalDate!).toISOString()).toBe(endsAt);

    const expired = lemonSqueezyWebhookPayload({
      eventName: "subscription_expired",
      userId,
      subscriptionId,
      status: "expired",
    });
    const expireRes = await page.request.post("/api/billing/webhook", {
      data: expired,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(expired) },
    });
    expect(expireRes.ok()).toBeTruthy();

    user = await getUserBillingState(testUser.email);
    expect(user.plan).toBe("free");
    expect(user.subscriptionStatus).toBe("expired");
  });

  test("subscription_payment_failed does not lock the account out — plan and status are unchanged (currently a no-op, not implemented dunning logic)", async ({
    page,
    testUser,
  }) => {
    const userId = await getUserId(testUser.email);
    const subscriptionId = "sub-test-payment-failed-1";

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
    const before = await getUserBillingState(testUser.email);
    expect(before.plan).toBe("starter");

    // app/api/billing/webhook/route.ts has no case for this event name — it
    // falls into the `default: // Ignore unrelated events` branch. This
    // test asserts that current (no-op) reality explicitly, rather than
    // implying dunning/grace-period logic exists when it doesn't.
    const failed = lemonSqueezyWebhookPayload({
      eventName: "subscription_payment_failed",
      userId,
      subscriptionId,
      status: "past_due",
    });
    const res = await page.request.post("/api/billing/webhook", {
      data: failed,
      headers: { "content-type": "application/json", "x-signature": signWebhookPayload(failed) },
    });
    expect(res.ok()).toBeTruthy(); // acknowledged (200), not an error

    const after = await getUserBillingState(testUser.email);
    expect(after.plan).toBe(before.plan);
    expect(after.subscriptionStatus).toBe(before.subscriptionStatus);
  });

  test("rejects a payload signed with an invalid signature and does not touch the database", async ({
    page,
    testUser,
  }) => {
    const userId = await getUserId(testUser.email);
    const payload = lemonSqueezyWebhookPayload({
      eventName: "subscription_created",
      userId,
      subscriptionId: "sub-should-never-apply",
      variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!,
      status: "active",
    });

    const res = await page.request.post("/api/billing/webhook", {
      data: payload,
      // Not derived from the payload or the real secret at all.
      headers: { "content-type": "application/json", "x-signature": "0".repeat(64) },
    });
    expect(res.status()).toBe(401);

    const user = await getUserBillingState(testUser.email);
    expect(user.plan).toBe("free"); // fixture default — would be "starter" if the forged payload had been processed
    expect(user.lemonsqueezySubscriptionId).toBeFalsy();
  });

  test("rejects a payload with no signature header at all", async ({ page, testUser }) => {
    const userId = await getUserId(testUser.email);
    const payload = lemonSqueezyWebhookPayload({
      eventName: "subscription_created",
      userId,
      subscriptionId: "sub-should-never-apply-either",
      variantId: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID!,
      status: "active",
    });

    const res = await page.request.post("/api/billing/webhook", {
      data: payload,
      headers: { "content-type": "application/json" }, // no x-signature
    });
    expect(res.status()).toBe(401);

    const user = await getUserBillingState(testUser.email);
    expect(user.plan).toBe("free");
  });
});

test.describe("plan limits lifted after a direct plan upgrade (bypassing real payment)", () => {
  test.use({ userPlan: "free" });

  test("upgrading a user's plan in the DB lifts the collection-page, testimonial, and rich-snippets limits", async ({
    page,
    testUser,
  }) => {
    // This test does an unusually long sequential chain for one test (two
    // full logins, a page-creation modal, six testimonial submissions, and
    // three dashboard navigations) — comfortably over the global 30s
    // default under two-worker concurrent load sharing one dev server and
    // the remote MongoDB connection, even though none of the individual
    // steps are actually slow on their own.
    test.setTimeout(60_000);

    // Confirm the free-plan gates are actually in effect first, so a false
    // pass isn't possible (e.g. limits already open for some other reason).
    await page.goto("/dashboard/pages");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "New page" })).toBeDisabled();

    await page.goto("/dashboard/rich-snippets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("upgrade-prompt")).toBeVisible();

    await setUserPlan(testUser.email, "starter");
    await reloginToRefreshSession(page, testUser);

    // 2nd collection page (blocked at 1 on Free — see e2e/collection-pages.spec.ts).
    await page.goto("/dashboard/pages");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "New page" })).toBeEnabled();
    await page.getByRole("button", { name: "New page" }).click();
    await page.getByLabel("Title").fill("Second Page After Upgrade");
    await page.getByRole("button", { name: "Create page" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(
      page.getByTestId("page-row").filter({ hasText: "Second Page After Upgrade" })
    ).toBeVisible();

    // 6th testimonial (blocked at 5 on Free — see e2e/testimonials.spec.ts).
    for (let i = 0; i < 5; i++) {
      await submitTestimonial(page, testUser.defaultPageSlug, { authorName: `Filler Author ${i}` });
    }
    const sixthRes = await page.request.post("/api/testimonials", {
      data: {
        slug: testUser.defaultPageSlug,
        authorName: "Sixth After Upgrade",
        text: "This should now be allowed past the old free-plan cap.",
        rating: 5,
      },
    });
    expect(sixthRes.ok()).toBeTruthy();

    // Rich snippets (gated behind hasRichSnippets on Free — see e2e/rich-snippets.spec.ts).
    await page.goto("/dashboard/rich-snippets");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("upgrade-prompt")).toHaveCount(0);
    await expect(page.getByTestId("google-preview")).toBeVisible();
  });
});

test.describe("manage subscription", () => {
  test("GET /api/billing/portal returns a matching Lemon Squeezy customer portal URL", async ({
    page,
    testUser,
  }) => {
    // getSubscription() is stubbed under PLAYWRIGHT_TEST (see
    // lib/lemonsqueezy.ts) since a real subscription can't exist here
    // without a completed purchase — this subscription ID only needs to
    // exist in our own DB for the portal route to attempt the lookup.
    await setUserSubscriptionId(testUser.email, "sub-test-portal-1");

    // Direct API call, not a UI click — same CDP response-body-eviction
    // race as the checkout test above once window.location.href fires, so
    // that path is verified separately below via route interception instead
    // of reading a response body that's about to be torn down.
    const res = await page.request.get("/api/billing/portal");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.customerPortal).toMatch(/^https:\/\/[a-z0-9-]+\.lemonsqueezy\.com\//i);
  });

  test("clicking Manage / cancel subscription triggers a redirect toward the Lemon Squeezy domain", async ({
    page,
    testUser,
  }) => {
    await setUserSubscriptionId(testUser.email, "sub-test-portal-2");

    let capturedRedirectUrl: string | null = null;
    await page.route(/^https:\/\/[^/]+\.lemonsqueezy\.com\//, (route) => {
      capturedRedirectUrl = route.request().url();
      route.abort();
    });

    await page.goto("/dashboard/billing");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Manage / cancel subscription" }).click();

    await expect(async () => {
      expect(capturedRedirectUrl).toMatch(/^https:\/\/[a-z0-9-]+\.lemonsqueezy\.com\//i);
    }).toPass({ timeout: 10_000 });
  });
});
