import { test, expect } from "./fixtures/auth";
import { getCollectionPageBySlug, countTestimonialsForPage } from "./support/db";

/**
 * Section 2: Collection Pages.
 *
 * NOTE on "fresh account" state: signup auto-provisions one default
 * CollectionPage (slug = username, title = "What do you think of {name}?")
 * — see app/api/auth/signup/route.ts. So a truly fresh account starts with
 * ONE page, not zero. The first test below verifies that actual behavior
 * instead of a literal "zero pages" expectation.
 *
 * Most tests run on the "starter" plan (the fixture default) so there's
 * room to create pages beyond the free plan's 1-page cap. The plan-limit
 * test explicitly overrides back to "free".
 */

function slugFromText(text: string | null) {
  return (text ?? "").replace(/^\/c\//, "").trim();
}

test.describe("fresh account state", () => {
  test("starts with exactly one auto-created default page, not zero", async ({
    page,
    testUser,
  }) => {
    await page.goto("/dashboard/pages");
    await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything

    await expect(page.getByTestId("page-row")).toHaveCount(1);
    await expect(page.getByTestId("page-title")).toHaveText(
      `What do you think of ${testUser.name}?`
    );
  });
});

test.describe("creating pages", () => {
  test("creating a page adds it to the list with a visible, URL-safe auto-generated slug", async ({
    page,
    testUser,
  }) => {
    await page.goto("/dashboard/pages");
    await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything

    await page.getByRole("button", { name: "New page" }).click();
    await page.getByLabel("Title").fill("Client Feedback");
    await page.getByRole("button", { name: "Create page" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();

    const row = page.getByTestId("page-row").filter({ hasText: "Client Feedback" });
    await expect(row).toBeVisible();

    const slug = slugFromText(await row.getByTestId("page-slug").textContent());
    expect(slug.length).toBeGreaterThan(0);
    expect(slug).toMatch(/^[a-z0-9-]+$/); // URL-safe: lowercase, digits, hyphens only
    expect(slug).not.toMatch(/\s/);
  });

  test("two pages created with the same title get different, URL-safe slugs", async ({
    page,
    testUser,
  }) => {
    await page.goto("/dashboard/pages");
    await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything
    const title = "Client Feedback";

    async function createPage() {
      await page.getByRole("button", { name: "New page" }).click();
      await page.getByLabel("Title").fill(title);
      await page.getByRole("button", { name: "Create page" }).click();
      await expect(page.getByRole("dialog")).toBeHidden();
    }

    // Starter plan: 1 default page + 2 new = 3, exactly at the starter cap — fits.
    await createPage();
    await createPage();

    const rows = page.getByTestId("page-row").filter({ hasText: title });
    await expect(rows).toHaveCount(2);

    const slugTexts = await rows.getByTestId("page-slug").allTextContents();
    const [slugA, slugB] = slugTexts.map(slugFromText);

    for (const slug of [slugA, slugB]) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
    expect(slugA).not.toBe(slugB);
  });
});

test("the Share button copies the correct /c/[slug] URL to the clipboard", async ({
  page,
  context,
  baseURL,
  testUser,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/dashboard/pages");
  await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything

  const row = page.getByTestId("page-row").first(); // the default auto-created page
  const slug = slugFromText(await row.getByTestId("page-slug").textContent());

  await row.getByRole("button", { name: "Share" }).click();
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

  expect(clipboardText).toBe(`${baseURL}/c/${slug}`);
});

test.describe("free plan limits", () => {
  test.use({ userPlan: "free" });

  test("attempting a 2nd collection page returns a clear plan-limit error, not a silent failure or 500", async ({
    page,
    testUser,
  }) => {
    await page.goto("/dashboard/pages");
    await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything

    // The default page already puts a free account at its 1-page limit,
    // so the UI should proactively communicate that rather than let the
    // user attempt and fail silently.
    await expect(
      page.getByText("You've reached your plan's page limit. Upgrade to add more.")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "New page" })).toBeDisabled();

    // Confirm the server enforces this too (not just a client-side guard),
    // with a clear, specific error — not a generic failure.
    const res = await page.request.post("/api/collection-pages", {
      data: { title: "One Too Many" },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/free plan allows 1 collection page/i);
  });
});

test("editing a page's title persists after reload", async ({ page, testUser }) => {
  await page.goto("/dashboard/pages");
  await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything

  const row = page.getByTestId("page-row").first();
  await row.getByTestId("edit-page-button").click();

  await page.getByLabel("Title").fill("Updated Wall of Love");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await expect(row.getByTestId("page-title")).toHaveText("Updated Wall of Love");

  await page.reload();
  await expect(
    page.getByTestId("page-row").first().getByTestId("page-title")
  ).toHaveText("Updated Wall of Love");
});

test('toggling a page inactive shows "no longer accepting submissions" on the public page', async ({
  page,
  context,
  testUser,
}) => {
  await page.goto("/dashboard/pages");
  await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything

  const row = page.getByTestId("page-row").first();
  const slug = slugFromText(await row.getByTestId("page-slug").textContent());

  await row.getByTestId("edit-page-button").click();
  await page.getByLabel("Page is active").uncheck();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(row.getByText("Inactive")).toBeVisible();

  const publicPage = await context.newPage();
  await publicPage.goto(`/c/${slug}`);
  await publicPage.waitForLoadState("networkidle");
  await expect(
    publicPage.getByText("This collection page is no longer accepting submissions.")
  ).toBeVisible();
  await expect(publicPage.getByRole("button", { name: "Submit testimonial" })).toHaveCount(0);
  await publicPage.close();
});

test("deleting a page removes it from the list and cascades to its testimonials", async ({
  page,
  testUser,
}) => {
  await page.goto("/dashboard/pages");
  await page.waitForLoadState("networkidle"); // let React hydrate before clicking anything

  await page.getByRole("button", { name: "New page" }).click();
  await page.getByLabel("Title").fill("Cascade Delete Target");
  await page.getByRole("button", { name: "Create page" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  const row = page.getByTestId("page-row").filter({ hasText: "Cascade Delete Target" });
  await expect(row).toBeVisible();
  const slug = slugFromText(await row.getByTestId("page-slug").textContent());

  // Public submission API — no auth required, matches the real /c/[slug] flow.
  const submitRes = await page.request.post("/api/testimonials", {
    data: {
      slug,
      authorName: "Cascade Test Author",
      text: "This testimonial should be deleted along with its page.",
    },
  });
  expect(submitRes.ok()).toBeTruthy();

  const pageDoc = await getCollectionPageBySlug(slug);
  expect(pageDoc).toBeTruthy();
  const collectionPageId = String(pageDoc!._id);

  await expect.poll(() => countTestimonialsForPage(collectionPageId)).toBe(1);

  page.once("dialog", (dialog) => dialog.accept()); // native confirm() in PagesManager.remove()
  await row.getByTestId("delete-page-button").click();
  await expect(row).toBeHidden();

  await expect.poll(() => countTestimonialsForPage(collectionPageId)).toBe(0);
});
