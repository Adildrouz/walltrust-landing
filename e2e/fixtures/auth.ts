import { test as base, expect } from "@playwright/test";
import { verifyUserEmail, setUserPlan, getDefaultCollectionPageSlug } from "../support/db";
import type { PlanName } from "@/lib/utils";

export type TestUser = {
  name: string;
  email: string;
  password: string;
  /** Slug of the default CollectionPage auto-created at signup. */
  defaultPageSlug: string;
};

type Fixtures = {
  /** A freshly signed-up, verified, and logged-in user. Fresh per test. */
  testUser: TestUser;
};

type Options = {
  /**
   * Plan the testUser should have once created. Defaults to "starter" so
   * most tests get headroom beyond the free plan's 1-page limit (the
   * account already starts with one auto-created default page — see
   * app/api/auth/signup/route.ts). Override with test.use({ userPlan: "free" })
   * for tests that specifically exercise free-plan limits.
   */
  userPlan: PlanName;
};

export const test = base.extend<Fixtures & Options>({
  userPlan: ["starter", { option: true }],

  testUser: async ({ page, request, userPlan }, use) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const credentials = {
      name: "QA Tester",
      email: `qa-${unique}@walltrust-e2e.test`,
      password: "TestPassword123!",
    };

    const signupRes = await request.post("/api/auth/signup", { data: credentials });
    if (!signupRes.ok()) {
      throw new Error(
        `testUser fixture: signup failed (${signupRes.status()}): ${await signupRes.text()}`
      );
    }

    // Bypass the real email-verification link — see e2e/support/db.ts.
    await verifyUserEmail(credentials.email);
    if (userPlan !== "free") {
      await setUserPlan(credentials.email, userPlan);
    }

    const user: TestUser = {
      ...credentials,
      defaultPageSlug: await getDefaultCollectionPageSlug(credentials.email),
    };

    // React hook form's onSubmit handler isn't attached until React
    // hydrates. If the "Sign in" button is clicked before that, the click
    // falls through to a native HTML form GET submit instead — detectable
    // because the URL gains ?email=&password= query params rather than
    // navigating to /dashboard. `networkidle` alone doesn't guarantee
    // hydration finished (hydration is CPU-bound, not network-bound), so
    // retry once rather than guess at a fixed delay.
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.goto("/auth/login");
      await page.waitForLoadState("networkidle");
      await page.getByLabel("Email", { exact: true }).fill(user.email);
      // exact: true — a plain substring match on "Password" also matches
      // the "Show password" toggle button's aria-label and throws a
      // strict-mode error.
      await page.getByLabel("Password", { exact: true }).fill(user.password);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL(/\/dashboard|password=/, { timeout: 10_000 });
      if (!page.url().includes("password=")) break;
    }

    const cookies = await page.context().cookies();
    const hasSessionCookie = cookies.some((c) => c.name.includes("session-token"));
    if (!page.url().includes("/dashboard") || !hasSessionCookie) {
      throw new Error(
        `testUser fixture: login did not establish a session (url=${page.url()}, ` +
          `cookies=${cookies.map((c) => c.name).join(", ") || "<none>"})`
      );
    }

    await use(user);
  },
});

export { expect };
