import { test, expect } from "./fixtures/auth";
import { getCollectionPageBySlug, getTestimonialById, getUserPasswordHash } from "./support/db";
import { createIndependentUser, type IndependentUser } from "./support/users";
import { submitTestimonialViaRequest } from "./support/testimonials";
import type { APIRequestContext } from "@playwright/test";

/**
 * Section 11: Security — the most important tests in this whole suite.
 * Prioritized getting these exactly right over keeping them terse.
 *
 * Two-user setup pattern used throughout: the `testUser` fixture (from
 * fixtures/auth.ts) provides "User B" — a real signed-up-and-logged-in
 * account, with its session cookie live in `page`. "User A" is created
 * separately via createIndependentUser() (e2e/support/users.ts), which
 * signs up + DB-verifies a second account WITHOUT ever touching `page`'s
 * cookies — so `page` stays logged in as B for the entire test, and A's
 * data is something B should never be able to reach.
 *
 * All cross-tenant attempts below use `page.request` (B's authenticated
 * session) against IDs that belong to A. All "unauthenticated" tests use
 * the bare `request` fixture, which is a separate APIRequestContext with
 * its own (always-empty) cookie jar — never touched by any login flow —
 * so those requests genuinely carry no session cookie at all.
 *
 * Every route under test (collection-pages/[id], testimonials/[id],
 * testimonials/[id]/approve) was read before writing these tests: all
 * three scope their DB query by BOTH `_id: params.id` AND
 * `userId: session.user.id` in the same findOne/findOneAndUpdate/
 * findOneAndDelete call. That means a cross-tenant ID simply doesn't match
 * the query — Mongoose returns null, and the route maps that to 404, not
 * an explicit 403-after-an-ownership-check. This is a legitimate,
 * common-enough authz pattern (the scoping IS the check), so this file
 * accepts either status per this section's own scope ("403 or 404"), but
 * the REAL proof in every test below is a direct DB read afterward
 * confirming User A's data was not modified/deleted — the status code
 * alone wouldn't catch a route that returned 404 but mutated the row
 * anyway.
 *
 * Rate limiting (last describe block) needed a small, deliberately narrow
 * change to lib/rate-limit.ts before it could be tested at all — see the
 * comment there and in that test for why (PLAYWRIGHT_TEST is unconditionally
 * "1" in every Playwright-spawned process, not just this project's webServer
 * child, which made real enforcement previously unreachable from any e2e
 * test).
 */

async function setupTwoUsers(request: APIRequestContext) {
  const userA = await createIndependentUser(request, "UserA");
  const pageADoc = await getCollectionPageBySlug(userA.defaultPageSlug);
  const testimonialAId = await submitTestimonialViaRequest(request, userA.defaultPageSlug, {
    authorName: "User A's Own Testimonial",
    text: "This belongs to User A and only User A should be able to moderate it.",
  });
  return { userA, pageAId: String(pageADoc!._id), testimonialAId };
}

test.describe("cross-tenant access — authenticated as a different user (User B)", () => {
  test("User B cannot GET User A's collection page via direct API call", async ({
    page,
    request,
    testUser,
  }) => {
    const { pageAId } = await setupTwoUsers(request);

    const res = await page.request.get(`/api/collection-pages/${pageAId}`);
    expect([403, 404]).toContain(res.status());
    expect(res.status()).not.toBe(200);
    const body = await res.json();
    expect(body.page).toBeUndefined();
  });

  test("User B cannot PATCH (modify) User A's collection page via direct API call", async ({
    page,
    request,
    testUser,
  }) => {
    const { userA, pageAId } = await setupTwoUsers(request);

    const res = await page.request.patch(`/api/collection-pages/${pageAId}`, {
      data: { title: "Hijacked by User B" },
    });
    expect([403, 404]).toContain(res.status());
    expect(res.status()).not.toBe(200);

    // The real proof: User A's data was never touched, not just the status code.
    const pageAfter = await getCollectionPageBySlug(userA.defaultPageSlug);
    expect(pageAfter!.title).not.toBe("Hijacked by User B");
  });

  test("User B cannot DELETE User A's collection page via direct API call", async ({
    page,
    request,
    testUser,
  }) => {
    const { userA, pageAId } = await setupTwoUsers(request);

    const res = await page.request.delete(`/api/collection-pages/${pageAId}`);
    expect([403, 404]).toContain(res.status());
    expect(res.status()).not.toBe(200);

    const pageAfter = await getCollectionPageBySlug(userA.defaultPageSlug);
    expect(pageAfter).toBeTruthy(); // still exists, untouched
  });

  test("User B cannot approve User A's testimonial via direct API call", async ({
    page,
    request,
    testUser,
  }) => {
    const { testimonialAId } = await setupTwoUsers(request);

    const res = await page.request.post(`/api/testimonials/${testimonialAId}/approve`);
    expect([403, 404]).toContain(res.status());
    expect(res.status()).not.toBe(200);

    const testimonialAfter = await getTestimonialById(testimonialAId);
    expect(testimonialAfter!.status).toBe("pending"); // unchanged — never approved
  });

  test("User B cannot reject User A's testimonial via direct API call", async ({
    page,
    request,
    testUser,
  }) => {
    const { testimonialAId } = await setupTwoUsers(request);

    const res = await page.request.patch(`/api/testimonials/${testimonialAId}`, {
      data: { status: "rejected" },
    });
    expect([403, 404]).toContain(res.status());
    expect(res.status()).not.toBe(200);

    const testimonialAfter = await getTestimonialById(testimonialAId);
    expect(testimonialAfter!.status).toBe("pending"); // unchanged
  });

  test("User B cannot DELETE User A's testimonial via direct API call", async ({
    page,
    request,
    testUser,
  }) => {
    const { testimonialAId } = await setupTwoUsers(request);

    const res = await page.request.delete(`/api/testimonials/${testimonialAId}`);
    expect([403, 404]).toContain(res.status());
    expect(res.status()).not.toBe(200);

    const testimonialAfter = await getTestimonialById(testimonialAId);
    expect(testimonialAfter).toBeTruthy(); // still exists, untouched
  });
});

test.describe("unauthenticated access — no session cookie at all", () => {
  // Auth is checked first, before any DB lookup, in every route below (confirmed
  // by reading each handler) — so an unauthenticated request never even reaches
  // the point where a valid-but-mismatched ID would produce a 404. It's always
  // exactly 401, regardless of whether the ID is real, someone else's, or garbage.

  test("GET/PATCH/DELETE on a collection page all return 401 with no session", async ({
    request,
  }) => {
    const userA = await createIndependentUser(request, "UserA");
    const pageADoc = await getCollectionPageBySlug(userA.defaultPageSlug);
    const pageAId = String(pageADoc!._id);

    const getRes = await request.get(`/api/collection-pages/${pageAId}`);
    expect(getRes.status()).toBe(401);

    const patchRes = await request.patch(`/api/collection-pages/${pageAId}`, {
      data: { title: "Should never apply" },
    });
    expect(patchRes.status()).toBe(401);

    const deleteRes = await request.delete(`/api/collection-pages/${pageAId}`);
    expect(deleteRes.status()).toBe(401);

    // Belt-and-suspenders: confirm none of the three attempts actually mutated anything.
    const pageAfter = await getCollectionPageBySlug(userA.defaultPageSlug);
    expect(pageAfter).toBeTruthy();
    expect(pageAfter!.title).not.toBe("Should never apply");
  });

  test("approve/PATCH/DELETE on a testimonial all return 401 with no session", async ({
    request,
  }) => {
    const userA = await createIndependentUser(request, "UserA");
    const testimonialAId = await submitTestimonialViaRequest(request, userA.defaultPageSlug, {
      authorName: "Unauthenticated Attempt Target",
    });

    const approveRes = await request.post(`/api/testimonials/${testimonialAId}/approve`);
    expect(approveRes.status()).toBe(401);

    const patchRes = await request.patch(`/api/testimonials/${testimonialAId}`, {
      data: { status: "approved" },
    });
    expect(patchRes.status()).toBe(401);

    const deleteRes = await request.delete(`/api/testimonials/${testimonialAId}`);
    expect(deleteRes.status()).toBe(401);

    const testimonialAfter = await getTestimonialById(testimonialAId);
    expect(testimonialAfter).toBeTruthy();
    expect(testimonialAfter!.status).toBe("pending");
  });
});

test.describe("password storage", () => {
  test("stored passwordHash is a real bcrypt hash, never the plaintext password", async ({
    request,
  }) => {
    const user: IndependentUser = await createIndependentUser(request, "PasswordCheck");
    const hash = await getUserPasswordHash(user.email);

    expect(hash).toBeTruthy();
    expect(hash).not.toBe(user.password);
    // bcrypt's encoded format: $2a$/$2b$/$2y$ + 2-digit cost + 22-char salt +
    // 31-char hash = a fixed 60 characters total (bcryptjs, used in
    // app/api/auth/signup/route.ts, always produces the $2a$/$2b$ variants).
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(hash).toHaveLength(60);
  });
});

test.describe("rate limiting", () => {
  test("public testimonial submission is rate-limited beyond its configured threshold (10 per IP / 10 min)", async ({
    page,
    testUser,
  }) => {
    const secret = process.env.E2E_RATE_LIMIT_SECRET;
    expect(
      secret,
      "E2E_RATE_LIMIT_SECRET must be set in .env.local (see lib/rate-limit.ts) — " +
        "without it this test cannot force real rate-limit enforcement and the " +
        "assertions below would be untestable, since PLAYWRIGHT_TEST disables " +
        "rate-limiting for every other e2e test by design."
    ).toBeTruthy();

    // This test's requests carry a header only IT sends, matching a secret
    // only this test's own environment knows — no other spec file's test can
    // accidentally trip or be tripped by the bucket this populates.
    //
    // Uses testUser's default (starter) plan deliberately — NOT test.use({
    // userPlan: "free" }) — because the Free plan's testimonial CAP is 5,
    // below this endpoint's rate limit of 10. On Free, the plan-limit check
    // (a separate, later check in the route) would return 403 before the
    // 11th request ever reached the rate limiter, testing the wrong thing.
    //
    // Requests are awaited serially (not fired concurrently) so the
    // sliding-window count updates deterministically — this makes the exact
    // "10 succeed, 11th is 429" assertion below reliable rather than racy.
    //
    // CAVEAT: the rate limiter's bucket is an in-memory Map inside the
    // running `next dev` process, keyed by IP — and local Playwright
    // requests all resolve to the same "unknown" IP (see lib/rate-limit.ts).
    // playwright.config.ts's `reuseExistingServer: false` means a full test
    // run always starts that process fresh, so this is safe run-to-run —
    // but re-running ONLY this test file multiple times against an
    // already-running server (e.g. via --repeat-each without restarting)
    // will find a non-empty bucket on the 2nd+ repetition and the "first 10
    // succeed" assertion will correctly fail as a result. That's an
    // artifact of testing a real in-memory limiter locally, not a bug in
    // this test or the limiter itself.
    const limit = 10;
    const headers = { "x-e2e-force-ratelimit": secret! };
    const statuses: number[] = [];
    const bodies: unknown[] = [];

    for (let i = 0; i < limit + 3; i++) {
      const res = await page.request.post("/api/testimonials", {
        data: {
          slug: testUser.defaultPageSlug,
          authorName: `Rate Limit Probe ${i}`,
          text: "Firing rapidly to trip the rate limiter.",
          rating: 5,
        },
        headers,
      });
      statuses.push(res.status());
      bodies.push(await res.json());
    }

    // First `limit` requests succeed normally...
    expect(statuses.slice(0, limit), JSON.stringify(statuses)).toEqual(
      new Array(limit).fill(201)
    );
    // ...and every request past the threshold is rejected, not just the next one.
    expect(statuses.slice(limit), JSON.stringify(statuses)).toEqual(
      new Array(statuses.length - limit).fill(429)
    );

    const firstRejection = bodies[limit] as { error?: string };
    expect(firstRejection.error).toMatch(/too many requests/i);
  });
});
