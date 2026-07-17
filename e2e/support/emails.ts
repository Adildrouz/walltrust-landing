import type { APIRequestContext } from "@playwright/test";

export interface TestEmailLogEntry {
  to: string;
  subject: string;
  from: string;
  html: string;
}

/** Full log accumulated by lib/resend.ts's PLAYWRIGHT_TEST-mode stub, via app/api/test/emails/route.ts. */
export async function getTestEmailLog(request: APIRequestContext): Promise<TestEmailLogEntry[]> {
  const res = await request.get("/api/test/emails");
  if (!res.ok()) {
    throw new Error(`getTestEmailLog failed (${res.status()}): ${await res.text()}`);
  }
  const body = await res.json();
  return body.emails as TestEmailLogEntry[];
}

/**
 * Emails logged strictly after `sinceCount` (the log length captured
 * before the action under test). Diffing rather than clearing the log
 * between tests avoids a race if this file's tests ever ran with more than
 * one worker against the same shared, process-wide log.
 */
export async function newEmailsSince(
  request: APIRequestContext,
  sinceCount: number
): Promise<TestEmailLogEntry[]> {
  const all = await getTestEmailLog(request);
  return all.slice(sinceCount);
}
