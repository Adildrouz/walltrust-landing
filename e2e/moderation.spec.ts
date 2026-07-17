import { test, expect } from "./fixtures/auth";
import { getTestimonialById } from "./support/db";
import { submitTestimonial } from "./support/testimonials";

/**
 * Section 4: Moderation — the dashboard testimonials panel under realistic,
 * multi-item conditions.
 *
 * e2e/testimonials.spec.ts (Section 3) already proves each moderation
 * action works in isolation (one testimonial per test): approve sets
 * status + approvedAt, reject sets status, feature toggles on/off, delete
 * removes from DB. Rather than re-prove those single-action mechanics,
 * these tests seed several testimonials in different states at once and
 * check the panel behaves correctly as a whole: actions target the right
 * item among several, filter tabs show the correct subset, changes survive
 * a real page refresh (not just in-memory state), and the free-plan usage
 * counter reacts correctly (unchanged on approve, decremented on delete).
 *
 * "Featured" here only checks that the flag itself persists — cross-
 * checking that featured items are prioritized in the widget belongs to
 * Section 5 (e2e/widget.spec.ts) once that exists.
 */

function card(page: import("@playwright/test").Page, authorName: string) {
  return page.getByTestId("testimonial-card").filter({ hasText: authorName });
}

test("a freshly submitted testimonial shows a Pending badge alongside other statuses", async ({
  page,
  testUser,
}) => {
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Fresh Submission" });
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Second Submission" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  for (const name of ["Fresh Submission", "Second Submission"]) {
    const c = card(page, name);
    await expect(c).toHaveAttribute("data-status", "pending");
    // exact: true — the author name itself could otherwise collide with
    // a substring match against the status badge text.
    await expect(c.getByText("pending", { exact: true })).toBeVisible();
  }
});

test("approving updates the status client-side (no full reload) and the change survives a refresh", async ({
  page,
  testUser,
}) => {
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Approve Me" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  // A full page navigation would reset this in-memory global; if it's
  // still true after clicking Approve, the update was client-side only —
  // matches TestimonialList's actual implementation (fetch + setState,
  // no router.push/reload).
  await page.evaluate(() => {
    (window as unknown as { __noReloadMarker?: boolean }).__noReloadMarker = true;
  });

  await card(page, "Approve Me").getByRole("button", { name: "Approve" }).click();
  await expect(card(page, "Approve Me")).toHaveAttribute("data-status", "approved");

  const survivedWithoutReload = await page.evaluate(
    () => (window as unknown as { __noReloadMarker?: boolean }).__noReloadMarker === true
  );
  expect(survivedWithoutReload).toBe(true);

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(card(page, "Approve Me")).toHaveAttribute("data-status", "approved");
});

test("rejecting targets only the selected testimonial, leaving others untouched", async ({
  page,
  testUser,
}) => {
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Reject Target" });
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Should Stay Pending" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  await card(page, "Reject Target").getByRole("button", { name: "Reject" }).click();

  await expect(card(page, "Reject Target")).toHaveAttribute("data-status", "rejected");
  await expect(card(page, "Should Stay Pending")).toHaveAttribute("data-status", "pending");
});

test("marking an approved testimonial as Featured persists after a refresh", async ({
  page,
  testUser,
}) => {
  const id = await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Feature Me" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  await card(page, "Feature Me").getByRole("button", { name: "Approve" }).click();
  await expect(card(page, "Feature Me")).toHaveAttribute("data-status", "approved");

  await card(page, "Feature Me").getByRole("button", { name: "Toggle featured" }).click();
  await expect(card(page, "Feature Me").getByText("Featured")).toBeVisible();

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(card(page, "Feature Me")).toHaveAttribute("data-status", "approved");
  await expect(card(page, "Feature Me").getByText("Featured")).toBeVisible();

  const doc = await getTestimonialById(id);
  expect(doc?.featured).toBe(true);
  expect(doc?.status).toBe("approved");
});

test("filter tabs show exactly the matching subset when statuses are mixed", async ({
  page,
  testUser,
}) => {
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Pending One" });
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Pending Two" });
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Approved One" });
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Rejected One" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  await card(page, "Approved One").getByRole("button", { name: "Approve" }).click();
  await expect(card(page, "Approved One")).toHaveAttribute("data-status", "approved");
  await card(page, "Rejected One").getByRole("button", { name: "Reject" }).click();
  await expect(card(page, "Rejected One")).toHaveAttribute("data-status", "rejected");

  const expectations: Record<string, string[]> = {
    All: ["Pending One", "Pending Two", "Approved One", "Rejected One"],
    Pending: ["Pending One", "Pending Two"],
    Approved: ["Approved One"],
    Rejected: ["Rejected One"],
  };

  for (const [tabName, expectedNames] of Object.entries(expectations)) {
    await page.getByRole("tab", { name: new RegExp(`^${tabName}`) }).click();
    const visibleCards = page.getByTestId("testimonial-card");
    await expect(visibleCards).toHaveCount(expectedNames.length);
    for (const name of expectedNames) {
      await expect(card(page, name)).toBeVisible();
    }
  }
});

test("deleting removes only the targeted testimonial", async ({ page, testUser }) => {
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Delete Target" });
  await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Keep This One" });

  await page.goto("/dashboard/testimonials");
  await page.waitForLoadState("networkidle");

  await card(page, "Delete Target").getByRole("button", { name: "Delete" }).click();

  await expect(card(page, "Delete Target")).toHaveCount(0);
  await expect(card(page, "Keep This One")).toBeVisible();
});

test.describe("free plan usage counter", () => {
  test.use({ userPlan: "free" });

  test('the "X / 5" testimonials counter is unchanged by approve and decrements on delete', async ({
    page,
    testUser,
  }) => {
    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Counter A" });
    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Counter B" });
    await submitTestimonial(page, testUser.defaultPageSlug, { authorName: "Counter C" });

    await page.goto("/dashboard/billing");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("testimonials-usage")).toHaveText("3 / 5");

    // Approving doesn't create or destroy a testimonial — total count, and
    // therefore the plan-limit counter, should not move.
    await page.goto("/dashboard/testimonials");
    await page.waitForLoadState("networkidle");
    await card(page, "Counter A").getByRole("button", { name: "Approve" }).click();
    await expect(card(page, "Counter A")).toHaveAttribute("data-status", "approved");

    await page.goto("/dashboard/billing");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("testimonials-usage")).toHaveText("3 / 5");

    // Deleting does reduce the total.
    await page.goto("/dashboard/testimonials");
    await page.waitForLoadState("networkidle");
    await card(page, "Counter B").getByRole("button", { name: "Delete" }).click();
    await expect(card(page, "Counter B")).toHaveCount(0);

    await page.goto("/dashboard/billing");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("testimonials-usage")).toHaveText("2 / 5");
  });
});
