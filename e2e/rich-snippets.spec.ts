import { test, expect } from "./fixtures/auth";
import { submitTestimonial } from "./support/testimonials";

/**
 * Section 6: Rich Snippets — the dashboard page that previews and generates
 * the Organization + AggregateRating JSON-LD a user pastes into their own
 * site's <head>.
 *
 * This only exercises the dashboard page (app/(dashboard)/dashboard/rich-snippets/page.tsx),
 * not the public GET /api/rich-snippets/[userId] route (which additionally
 * emits per-review Review objects) — that endpoint is out of scope here.
 *
 * Google's real Rich Results Test is NOT called from this suite — that's a
 * manual, one-time verification step against production, not something to
 * automate per test run. What we verify here is that the JSON-LD we hand
 * Google is well-formed and numerically correct, which is what a broken
 * build could actually get wrong.
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

/**
 * The visible code block is the literal copy-paste snippet, i.e. the JSON
 * wrapped in `<script type="application/ld+json">...</script>` text (not an
 * actual script element — it's rendered as plain text inside <code>). Strip
 * that wrapper before parsing; it's the JSON payload itself we're
 * validating, not the surrounding HTML tag text.
 */
function extractJsonLd(codeBlockText: string) {
  const inner = codeBlockText
    .replace(/^<script[^>]*>/, "")
    .replace(/<\/script>\s*$/, "")
    .trim();
  return JSON.parse(inner);
}

test("renders a Google-style star rating preview for approved rated testimonials", async ({
  page,
  testUser,
}) => {
  await submitTestimonial(page, testUser.defaultPageSlug, {
    authorName: "Preview Author One",
    rating: 5,
  });
  await approve(page, "Preview Author One");

  await page.goto("/dashboard/rich-snippets");
  await page.waitForLoadState("networkidle");

  const preview = page.getByTestId("google-preview");
  await expect(preview).toBeVisible();
  await expect(preview.locator("svg")).toHaveCount(5); // 5-star row, matching Google's actual snippet look
  await expect(preview).toContainText("review");
});

test("the generated JSON-LD code block is valid, parseable JSON", async ({ page, testUser }) => {
  await submitTestimonial(page, testUser.defaultPageSlug, {
    authorName: "Valid JSON Author",
    rating: 4,
  });
  await approve(page, "Valid JSON Author");

  await page.goto("/dashboard/rich-snippets");
  await page.waitForLoadState("networkidle");

  const raw = await page.getByTestId("jsonld-code").textContent();
  expect(raw).toBeTruthy();
  expect(() => extractJsonLd(raw!)).not.toThrow();
});

test("JSON-LD contains the expected schema.org keys and the rating average matches seeded testimonials", async ({
  page,
  testUser,
}) => {
  await submitTestimonial(page, testUser.defaultPageSlug, {
    authorName: "Five Star Author",
    rating: 5,
  });
  await submitTestimonial(page, testUser.defaultPageSlug, {
    authorName: "Three Star Author",
    rating: 3,
  });
  await approve(page, "Five Star Author");
  await approve(page, "Three Star Author");

  await page.goto("/dashboard/rich-snippets");
  await page.waitForLoadState("networkidle");

  const raw = await page.getByTestId("jsonld-code").textContent();
  const parsed = extractJsonLd(raw!);

  expect(parsed["@context"]).toBe("https://schema.org");
  expect(parsed["@type"]).toBe("Organization");

  expect(parsed.aggregateRating).toBeTruthy();
  expect(parsed.aggregateRating["@type"]).toBe("AggregateRating");
  expect(parsed.aggregateRating.reviewCount).toBe(2);
  // (5 + 3) / 2 = 4 — asserted both as the exact formatted string the app
  // produces today and as a numeric average, so a rounding/formatting
  // regression and a wrong-math regression would each be caught distinctly.
  expect(parsed.aggregateRating.ratingValue).toBe("4.0");
  expect(Number(parsed.aggregateRating.ratingValue)).toBe(4);
  expect(parsed.aggregateRating.bestRating).toBe("5");
  expect(parsed.aggregateRating.worstRating).toBe("1");
});

test.describe("free plan", () => {
  test.use({ userPlan: "free" });

  test("gates the feature behind an upgrade prompt instead of showing JSON-LD", async ({
    page,
    testUser,
  }) => {
    await page.goto("/dashboard/rich-snippets");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("upgrade-prompt")).toBeVisible();
    await expect(page.getByText("Rich Snippets are a paid feature")).toBeVisible();

    const upgradeLink = page.getByRole("link", { name: "Upgrade to unlock" });
    await expect(upgradeLink).toBeVisible();
    await expect(upgradeLink).toHaveAttribute("href", "/dashboard/billing");

    // Confirms this is a true gate, not just an extra banner alongside the
    // real feature.
    await expect(page.getByTestId("jsonld-code")).toHaveCount(0);
    await expect(page.getByTestId("google-preview")).toHaveCount(0);
  });
});
