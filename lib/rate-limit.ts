const buckets = new Map<string, number[]>();

// Local Playwright requests carry no x-forwarded-for header, so every e2e
// signup/submission in a run shares one "unknown" bucket — across parallel
// workers and a growing test suite that would start producing false 429s
// unrelated to real abuse. Same PLAYWRIGHT_TEST gate used in lib/resend.ts.
//
// NOTE: PLAYWRIGHT_TEST is set to "1" by Playwright's own test runner in
// every process it spawns or runs in — not only the webServer child this
// project's playwright.config.ts explicitly targets. That's harmless for
// this flag's purpose everywhere else (it only ever needs to be "on"
// during e2e runs), but it does mean TEST_MODE can never be made "false"
// from inside any Playwright-orchestrated process — including a test file
// importing this module directly. e2e/security.spec.ts's rate-limit test
// needs real enforcement for one specific, deliberate request, so
// `forceEnforce` (below) provides a narrow, explicit way to opt back into
// real enforcement without weakening TEST_MODE's default (never 429) for
// every other e2e test.
const TEST_MODE = process.env.PLAYWRIGHT_TEST === "1";

// Only set locally in .env.local (gitignored, never committed, never set
// in production) — see e2e/support/rate-limit.ts for how the matching
// test sends it. Since `forceEnforce` only has any effect at all when
// TEST_MODE is already true (see the condition below), this can never
// disable or weaken rate-limiting in production even if this var were
// somehow present there: it only ever re-enables enforcement within an
// already-test-mode context, never turns it off.
const E2E_RATE_LIMIT_SECRET = process.env.E2E_RATE_LIMIT_SECRET;

export function isRateLimited(ip: string, max: number, windowMs: number, req?: Request): boolean {
  const forceEnforce =
    !!E2E_RATE_LIMIT_SECRET &&
    !!req &&
    req.headers.get("x-e2e-force-ratelimit") === E2E_RATE_LIMIT_SECRET;

  if (TEST_MODE && !forceEnforce) return false;
  const now = Date.now();
  const hits = (buckets.get(ip) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    });
  }
  return hits.length > max;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}
