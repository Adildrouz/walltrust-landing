import type { Page, APIRequestContext } from "@playwright/test";

type SubmitOverrides = Partial<{
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  text: string;
  rating: number;
  photo: string;
}>;

async function doSubmit(ctx: APIRequestContext, slug: string, overrides: SubmitOverrides) {
  const res = await ctx.post("/api/testimonials", {
    data: {
      slug,
      authorName: "Jane Doe",
      text: "Working with them was a fantastic experience from start to finish.",
      rating: 5,
      ...overrides,
    },
  });
  if (!res.ok()) {
    throw new Error(`submitTestimonial failed (${res.status()}): ${await res.text()}`);
  }
  const body = (await res.json()) as { id: string };
  return body.id;
}

/** Submits a testimonial via the real public API (same path as /c/[slug]'s form). */
export async function submitTestimonial(page: Page, slug: string, overrides: SubmitOverrides = {}) {
  return doSubmit(page.request, slug, overrides);
}

/**
 * Same as submitTestimonial, but takes a bare APIRequestContext instead of a
 * Page — for tests (e.g. e2e/security.spec.ts) that need to submit as an
 * anonymous public visitor decoupled from whichever user session (if any)
 * a `page` object happens to be logged in as. Submission itself is
 * unauthenticated in the real API regardless of caller.
 */
export async function submitTestimonialViaRequest(
  request: APIRequestContext,
  slug: string,
  overrides: SubmitOverrides = {}
) {
  return doSubmit(request, slug, overrides);
}
