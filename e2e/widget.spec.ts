import { test, expect } from "./fixtures/auth";
import { getUserId } from "./support/db";
import { submitTestimonial } from "./support/testimonials";
import { loadWidgetEmbed } from "./support/widget";

/**
 * Section 5: Widget — the public GET /api/widget/[userId] script endpoint
 * consumed by external host pages, plus the dashboard style configurator
 * that drives it.
 *
 * Sections 3/4 already prove approve/reject/feature mechanics against the
 * dashboard's own testimonial list; this file re-uses that same real UI
 * (submit via public API, then approve/reject/feature from
 * /dashboard/testimonials) purely as setup, and focuses its assertions on
 * what the *widget* does with the resulting data: which statuses it
 * includes, ordering, style variants, and branding-by-plan.
 *
 * The embed itself is tested by loading a minimal static host page (see
 * e2e/support/widget.ts) with the real <script> tag pointing at the running
 * app, matching how an actual customer site consumes it — not by unit
 * testing buildWidgetScript() in isolation.
 */

function card(page: import("@playwright/test").Page, authorName: string) {
  return page.getByTestId("testimonial-card").filter({ hasText: authorName });
}

async function approve(page: import("@playwright/test").Page, authorName: string) {
  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");
  await card(page, authorName).getByRole("button", { name: "Approve" }).click();
  await expect(card(page, authorName)).toHaveAttribute("data-status", "approved");
}

async function reject(page: import("@playwright/test").Page, authorName: string) {
  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");
  await card(page, authorName).getByRole("button", { name: "Reject" }).click();
  await expect(card(page, authorName)).toHaveAttribute("data-status", "rejected");
}

test.describe("public widget script endpoint", () => {
  test("responds with valid JavaScript, not a server error page", async ({
    page,
    testUser,
  }) => {
    const userId = await getUserId(testUser.email);

    const res = await page.request.get(`/api/widget/${userId}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/javascript/);

    const body = await res.text();
    expect(body.startsWith("(function(){")).toBe(true);
    expect(body).not.toMatch(/<html/i);
    expect(body).not.toMatch(/<!doctype/i);
  });

  test("includes only approved testimonials, never pending or rejected ones", async ({
    page,
    testUser,
  }) => {
    const userId = await getUserId(testUser.email);

    await submitTestimonial(page, testUser.defaultPageSlug, {
      authorName: "Pending Patricia",
      text: "This one should stay pending and never reach the widget.",
    });
    await submitTestimonial(page, testUser.defaultPageSlug, {
      authorName: "Rejected Rex",
      text: "This one gets rejected and must never reach the widget.",
    });
    await submitTestimonial(page, testUser.defaultPageSlug, {
      authorName: "Approved Anna",
      text: "This one gets approved and should appear in the widget.",
    });

    await reject(page, "Rejected Rex");
    await approve(page, "Approved Anna");
    // "Pending Patricia" is left untouched — still pending.

    const res = await page.request.get(`/api/widget/${userId}`);
    const body = await res.text();

    expect(body).toContain("Approved Anna");
    expect(body).toContain("should appear in the widget");
    expect(body).not.toContain("Pending Patricia");
    expect(body).not.toContain("stay pending");
    expect(body).not.toContain("Rejected Rex");
    expect(body).not.toContain("gets rejected");
  });
});

test.describe("embedded widget rendering", () => {
  test("renders visible testimonial cards for approved testimonials", async ({
    page,
    testUser,
    baseURL,
  }) => {
    const userId = await getUserId(testUser.email);

    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Embed Tester One" });
    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Embed Tester Two" });
    await approve(page, "Embed Tester One");
    await approve(page, "Embed Tester Two");

    await loadWidgetEmbed(page, baseURL!, userId);

    const cards = page.locator("#walltrust-widget .wt-card");
    await expect(cards).toHaveCount(2);
    await expect(page.locator("#walltrust-widget")).toContainText("Embed Tester One");
    await expect(page.locator("#walltrust-widget")).toContainText("Embed Tester Two");
  });

  test("featured testimonials appear before non-featured ones", async ({
    page,
    testUser,
    baseURL,
  }) => {
    const userId = await getUserId(testUser.email);

    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Not Featured" });
    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Featured Star" });
    await approve(page, "Not Featured");
    await approve(page, "Featured Star");

    await page.goto("/dashboard/testimonials");
    await page.waitForLoadState("networkidle");
    await card(page, "Featured Star").getByRole("button", { name: "Toggle featured" }).click();
    await expect(card(page, "Featured Star").getByText("Featured")).toBeVisible();

    await loadWidgetEmbed(page, baseURL!, userId);

    const names = await page.locator("#walltrust-widget .wt-name").allTextContents();
    expect(names.indexOf("Featured Star")).toBeGreaterThanOrEqual(0);
    expect(names.indexOf("Featured Star")).toBeLessThan(names.indexOf("Not Featured"));
  });

  test("no widget branding appears when the account is on a paid (starter) plan", async ({
    page,
    testUser,
    baseURL,
  }) => {
    const userId = await getUserId(testUser.email);

    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Starter Plan Author" });
    await approve(page, "Starter Plan Author");

    await loadWidgetEmbed(page, baseURL!, userId);

    await expect(page.getByText("Powered by WallTrust")).toHaveCount(0);
  });

  test.describe("free plan branding", () => {
    test.use({ userPlan: "free" });

    test("widget branding appears when the account is on the Free plan", async ({
      page,
      testUser,
      baseURL,
    }) => {
      const userId = await getUserId(testUser.email);

      await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Free Plan Author" });
      await approve(page, "Free Plan Author");

      await loadWidgetEmbed(page, baseURL!, userId);

      await expect(page.getByText("Powered by WallTrust")).toBeVisible();
    });
  });
});

test.describe("widget style configuration", () => {
  const styles = [
    { button: "Grid", wrapperClass: "wt-grid" },
    { button: "Carousel", wrapperClass: "wt-carousel" },
    { button: "Single", wrapperClass: "wt-single" },
    { button: "Badge", wrapperClass: "wt-badge" },
  ] as const;

  test("changing style in the dashboard changes the rendered markup in the embed", async ({
    page,
    testUser,
    baseURL,
  }) => {
    const userId = await getUserId(testUser.email);

    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Style Test Author" });
    await approve(page, "Style Test Author");

    for (const { button, wrapperClass } of styles) {
      await page.goto("/dashboard/widget");
      await page.waitForLoadState("networkidle");

      await page.getByRole("button", { name: button, exact: true }).click();
      await page.getByRole("button", { name: "Save settings" }).click();
      await expect(page.getByText("Widget settings saved").first()).toBeVisible();

      await loadWidgetEmbed(page, baseURL!, userId);
      await expect(page.locator(`#walltrust-widget .${wrapperClass}`)).toBeVisible();
    }
  });
});

test.describe("mobile viewport", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("the embedded widget does not introduce horizontal scroll on the host page", async ({
    page,
    testUser,
    baseURL,
  }) => {
    const userId = await getUserId(testUser.email);

    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Mobile Viewport Author" });
    await approve(page, "Mobile Viewport Author");

    await loadWidgetEmbed(page, baseURL!, userId);

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
