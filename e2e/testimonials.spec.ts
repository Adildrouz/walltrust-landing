import { test, expect } from "./fixtures/auth";
import { getCollectionPageBySlug, getTestimonialById, countTestimonialsForPage } from "./support/db";
import { submitTestimonial } from "./support/testimonials";

/**
 * Section 3: Testimonials — public submission (/c/[slug]) + dashboard
 * moderation (approve/reject/feature/delete).
 *
 * Most setup uses the real public POST /api/testimonials endpoint directly
 * (same as the real /c/[slug] form) rather than re-driving the UI form for
 * every test — the form itself is only driven end-to-end in the first two
 * tests. Cloudinary uploads are mocked in test mode (see lib/cloudinary.ts)
 * so the photo test below doesn't leave real assets in the project's
 * Cloudinary account on every run.
 *
 * These tests each exercise one action in isolation (one testimonial per
 * test). e2e/moderation.spec.ts (Section 4) complements this with
 * multi-item scenarios — several testimonials in different statuses
 * coexisting, filter-tab correctness, refresh-persistence, and the
 * free-plan usage counter — rather than re-proving the same single-action
 * mechanics already covered here.
 */

test("submitting a valid testimonial on the public form shows a thank-you state and lands as pending in the dashboard", async ({
  page,
  testUser,
}) => {
  await page.goto(`/c/${testUser.defaultPageSlug}`);
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "5 stars" }).click();
  await page.getByLabel("Your testimonial").fill("This completely changed how we collect feedback.");
  await page.getByLabel("Name *").fill("Priya Shah");
  await page.getByLabel("Title / role").fill("Head of Marketing");
  await page.getByLabel("Company (optional)").fill("Acme Co");
  await page.getByRole("button", { name: "Submit testimonial" }).click();

  await expect(page.getByText("Thank you! 🎉")).toBeVisible();

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  const card = page.getByTestId("testimonial-card").filter({ hasText: "Priya Shah" });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-status", "pending");
  await expect(card.getByText("pending")).toBeVisible();
});

test("submitting without a name shows an inline validation error and does not submit", async ({
  page,
  testUser,
}) => {
  await page.goto(`/c/${testUser.defaultPageSlug}`);
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Your testimonial").fill("Great service, would recommend to anyone.");
  await page.getByRole("button", { name: "Submit testimonial" }).click();

  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await expect(page.getByText("Thank you! 🎉")).toHaveCount(0);

  const page1 = await getCollectionPageBySlug(testUser.defaultPageSlug);
  await expect.poll(() => countTestimonialsForPage(String(page1!._id))).toBe(0);
});

test("approving a pending testimonial moves it to Approved and sets approvedAt", async ({
  page,
  testUser,
}) => {
  const id = await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Marcus Lee" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  const card = page.getByTestId("testimonial-card").filter({ hasText: "Marcus Lee" });
  await card.getByRole("button", { name: "Approve" }).click();
  await expect(card).toHaveAttribute("data-status", "approved");

  await page.getByRole("tab", { name: /^Approved/ }).click();
  await expect(page.getByTestId("testimonial-card").filter({ hasText: "Marcus Lee" })).toBeVisible();
  await page.getByRole("tab", { name: /^Pending/ }).click();
  await expect(page.getByTestId("testimonial-card").filter({ hasText: "Marcus Lee" })).toHaveCount(0);

  const doc = await getTestimonialById(id);
  expect(doc?.status).toBe("approved");
  expect(doc?.approvedAt).toBeTruthy();
});

test("rejecting a testimonial moves it to Rejected", async ({ page, testUser }) => {
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Chen Wu" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  const card = page.getByTestId("testimonial-card").filter({ hasText: "Chen Wu" });
  await card.getByRole("button", { name: "Reject" }).click();
  await expect(card).toHaveAttribute("data-status", "rejected");

  await page.getByRole("tab", { name: /^Rejected/ }).click();
  await expect(page.getByTestId("testimonial-card").filter({ hasText: "Chen Wu" })).toBeVisible();
});

test("toggling featured adds and removes the Featured badge", async ({ page, testUser }) => {
  const id = await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Sofia Rossi" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  const card = page.getByTestId("testimonial-card").filter({ hasText: "Sofia Rossi" });
  const featureButton = card.getByRole("button", { name: "Toggle featured" });

  await featureButton.click();
  await expect(card.getByText("Featured")).toBeVisible();
  let doc = await getTestimonialById(id);
  expect(doc?.featured).toBe(true);

  await featureButton.click();
  await expect(card.getByText("Featured")).toHaveCount(0);
  doc = await getTestimonialById(id);
  expect(doc?.featured).toBe(false);
});

test("deleting a testimonial removes it from the list and the database", async ({ page, testUser }) => {
  const id = await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Omar Farouk" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  const card = page.getByTestId("testimonial-card").filter({ hasText: "Omar Farouk" });
  await card.getByRole("button", { name: "Delete" }).click();
  await expect(card).toHaveCount(0);

  const doc = await getTestimonialById(id);
  expect(doc).toBeNull();
});

test("disabling star ratings on a collection page hides the rating field on its public form", async ({
  page,
  testUser,
}) => {
  const collectionPage = await getCollectionPageBySlug(testUser.defaultPageSlug);
  const patchRes = await page.request.patch(`/api/collection-pages/${collectionPage!._id}`, {
    data: { allowRating: false },
  });
  expect(patchRes.ok()).toBeTruthy();

  await page.goto(`/c/${testUser.defaultPageSlug}`);
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Your rating")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "5 stars" })).toHaveCount(0);

  await page.getByLabel("Your testimonial").fill("No rating field here, and that's expected.");
  await page.getByLabel("Name *").fill("Lena Novak");
  await page.getByRole("button", { name: "Submit testimonial" }).click();
  await expect(page.getByText("Thank you! 🎉")).toBeVisible();

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");
  const card = page.getByTestId("testimonial-card").filter({ hasText: "Lena Novak" });
  await expect(card).toBeVisible();
  await expect(card.locator('[role="img"]')).toHaveCount(0); // read-only StarRating only renders when a rating exists
});

test("a testimonial submitted with a photo stores and displays the (mocked) upload URL", async ({
  page,
  testUser,
}) => {
  // Minimal valid 1x1 transparent PNG — content doesn't matter since the
  // upload itself is mocked in test mode (see lib/cloudinary.ts).
  const photoDataUri =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  const id = await submitTestimonial(page, testUser.defaultPageSlug, {
    authorName: "Photo Tester",
    photo: photoDataUri,
  });

  const doc = await getTestimonialById(id);
  expect(doc?.photo).toMatch(/^https:\/\/res\.cloudinary\.com\/test-mode\/image\/upload\//);

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  const card = page.getByTestId("testimonial-card").filter({ hasText: "Photo Tester" });
  await expect(card).toBeVisible();
  const photo = card.locator("img");
  await expect(photo).toHaveCount(1);
  await expect(photo).toHaveAttribute("src", /res\.cloudinary\.com/);
});

test.describe("free plan limits", () => {
  test.use({ userPlan: "free" });

  test("a 6th testimonial submission is rejected with a clear limit error, not a silent failure or 500", async ({
    page,
    testUser,
  }) => {
    for (let i = 0; i < 5; i++) {
      await submitTestimonial(page, testUser.defaultPageSlug, { authorName: `Filler Author ${i}` });
    }

    const res = await page.request.post("/api/testimonials", {
      data: {
        slug: testUser.defaultPageSlug,
        authorName: "One Too Many",
        text: "This should not be allowed to go through.",
        rating: 4,
      },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/testimonial limit/i);

    const collectionPage = await getCollectionPageBySlug(testUser.defaultPageSlug);
    await expect.poll(() => countTestimonialsForPage(String(collectionPage!._id))).toBe(5);
  });
});
