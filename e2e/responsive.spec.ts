import { devices } from "@playwright/test";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/auth";

/**
 * Section 9: Responsive.
 *
 * Uses Playwright's built-in device descriptors (real mobile viewport,
 * user agent, touch, device pixel ratio) rather than just resizing a
 * desktop viewport — that's what actually exercises the mobile-specific
 * nav rewrite (components/layout/DashboardLayoutClient.tsx) and any
 * touch/tap-driven layout differences.
 *
 * Every test below runs once per device via the loop at the bottom of the
 * file, so failures are attributable to a specific device.
 */

const DEVICES = {
  "iPhone 13": devices["iPhone 13"],
  "Pixel 5": devices["Pixel 5"],
};

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
}

function runResponsiveTests() {
  test.describe("dashboard mobile nav", () => {
    test("sidebar is hidden by default, the hamburger opens it as an overlay, and tapping the backdrop closes it", async ({
      page,
      testUser,
    }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      const menuButton = page.getByRole("button", { name: "Open menu" });
      await expect(menuButton).toBeVisible();

      const overviewLink = page.getByRole("link", { name: "Overview" });
      const backdrop = page.getByTestId("mobile-nav-backdrop");

      // The sidebar is always present in the DOM — it's moved off-canvas
      // via a CSS transform, not display:none/unmounted — so toBeVisible()
      // alone wouldn't prove it's actually hidden from the user.
      // toBeInViewport() checks real intersection with the visible
      // viewport, which is what "hidden by default" actually means here.
      await expect(overviewLink).not.toBeInViewport();
      await expect(backdrop).toHaveCount(0); // conditionally rendered, not just hidden

      await menuButton.click();
      await expect(backdrop).toBeVisible();
      await expect(overviewLink).toBeInViewport();

      // The backdrop is `fixed inset-0` (spans the full viewport width),
      // but the sidebar sits on top of it (z-50 vs z-40) over its own
      // 256px (w-64) width. A plain .click() targets the element's center,
      // which on these ~390px-wide devices falls inside that 256px band —
      // the sidebar, not the backdrop, ends up intercepting the click.
      // Click a point clear of the sidebar instead.
      const viewportWidth = page.viewportSize()?.width ?? 400;
      await backdrop.click({ position: { x: Math.max(260, viewportWidth - 20), y: 20 } });
      await expect(backdrop).toHaveCount(0);
      await expect(overviewLink).not.toBeInViewport();
    });
  });

  test.describe("no horizontal scroll on core dashboard pages", () => {
    for (const path of ["/dashboard", "/dashboard/testimonials", "/dashboard/settings"]) {
      test(`${path} does not cause horizontal page scroll`, async ({ page, testUser }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        expect(await hasHorizontalScroll(page)).toBe(false);
      });
    }
  });

  test.describe("auth forms stay usable with focus / (simulated) on-screen keyboard", () => {
    // Playwright's device emulation doesn't render a real on-screen
    // keyboard that shrinks the visual viewport — there's no browser-level
    // way to simulate that occlusion. The achievable, still-meaningful
    // proxy (and the "at minimum" bar this item's scope explicitly allows)
    // is confirming the submit button stays reachable after each field
    // gains focus — i.e. focusing a field doesn't itself reflow the layout
    // so the button ends up off-screen.
    test("login form: inputs are focusable and the submit button stays reachable throughout", async ({
      page,
    }) => {
      await page.goto("/auth/login");
      await page.waitForLoadState("networkidle");

      const submit = page.getByRole("button", { name: "Sign in" });
      await expect(submit).toBeInViewport();

      const email = page.getByLabel("Email", { exact: true });
      await email.click();
      await expect(email).toBeFocused();
      await expect(submit).toBeInViewport();

      const password = page.getByLabel("Password", { exact: true });
      await password.click();
      await expect(password).toBeFocused();
      await expect(submit).toBeInViewport();
    });

    test("signup form: inputs are focusable and the submit button stays reachable throughout", async ({
      page,
    }) => {
      await page.goto("/auth/signup");
      await page.waitForLoadState("networkidle");

      const submit = page.getByRole("button", { name: "Create account" });
      await expect(submit).toBeInViewport();

      const name = page.getByLabel("Full name");
      await name.click();
      await expect(name).toBeFocused();
      await expect(submit).toBeInViewport();

      const email = page.getByLabel("Email", { exact: true });
      await email.click();
      await expect(email).toBeFocused();
      await expect(submit).toBeInViewport();

      const password = page.getByLabel("Password", { exact: true });
      await password.click();
      await expect(password).toBeFocused();
      await expect(submit).toBeInViewport();
    });
  });

  test("public /c/[slug] submission form is fully usable: all fields tappable, no overflow", async ({
    page,
    testUser,
  }) => {
    await page.goto(`/c/${testUser.defaultPageSlug}`);
    await page.waitForLoadState("networkidle");

    expect(await hasHorizontalScroll(page)).toBe(false);

    await page.getByRole("button", { name: "5 stars" }).click();

    const text = page.getByLabel("Your testimonial");
    await text.click();
    await text.fill("Works great on mobile too.");

    const name = page.getByLabel("Name *");
    await name.click();
    await name.fill("Mobile Tester");

    const title = page.getByLabel("Title / role");
    await title.click();
    await title.fill("QA Engineer");

    const company = page.getByLabel("Company (optional)");
    await company.click();
    await company.fill("Acme Co");

    // Unlike the short 2-3 field auth forms above, this is a longer form —
    // scrolling to reach the submit button is normal, expected mobile
    // behavior here, not a layout bug, so there's no "stays in viewport"
    // assertion to make. .click() auto-scrolls the button into view itself;
    // the click succeeding (and the thank-you state appearing below) is
    // what actually proves it's reachable/tappable.
    const submit = page.getByRole("button", { name: "Submit testimonial" });
    await submit.click();

    await expect(page.getByText("Thank you! 🎉")).toBeVisible();
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("landing page hero, pricing, and FAQ render without horizontal scroll or any element overflowing the viewport", async ({
    page,
  }) => {
    // "/" is rewritten to the static public/index.html (see
    // next.config.mjs) — there is no React page at app/page.tsx.
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(await hasHorizontalScroll(page)).toBe(false);

    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator(".hero-h1")).toBeVisible();
    await expect(page.locator("#pricing")).toBeVisible();
    await expect(page.locator("#faq")).toBeVisible();
    await expect(page.locator(".faq-item").first()).toBeVisible();

    // Generic "no text visually overlapping" detection is a hard, high-
    // false-positive problem (nested elements always overlap their parent
    // by definition; some badges — e.g. the "Most popular" pricing badge —
    // intentionally overlap a card's edge by design). The concrete,
    // unambiguous check this item actually specifies is bounding-box
    // overflow past the viewport edge, which is also the most common real
    // manifestation of this bug class (an element too wide for its
    // container spilling past the page edge) — so that's what's asserted,
    // not a generic pairwise-overlap heuristic.
    const overflowing = await page.evaluate(() => {
      const tolerance = 1; // sub-pixel rounding
      const viewportWidth = window.innerWidth;
      const offenders: string[] = [];
      document.querySelectorAll(".hero, #pricing, #faq").forEach((section) => {
        section.querySelectorAll("*").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.right > viewportWidth + tolerance) {
            const cls = el.className ? `.${String(el.className).trim().replace(/\s+/g, ".")}` : "";
            offenders.push(`${el.tagName}${cls} right=${Math.round(rect.right)} viewport=${viewportWidth}`);
          }
        });
      });
      return offenders;
    });
    expect(overflowing).toEqual([]);
  });
}

for (const [deviceName, device] of Object.entries(DEVICES)) {
  // defaultBrowserType (e.g. webkit for iPhone) can only be set at the
  // top-level project config, not inside test.use() within a describe
  // block — Playwright errors "forces a new worker" otherwise. This suite
  // only runs against the single "chromium" project defined in
  // playwright.config.ts anyway, so drop that key and keep just the
  // viewport/user-agent/touch/device-pixel-ratio emulation.
  const { defaultBrowserType: _defaultBrowserType, ...deviceOptions } = device;

  test.describe(deviceName, () => {
    test.use({ ...deviceOptions });
    runResponsiveTests();
  });
}
