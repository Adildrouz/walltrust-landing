import { NextResponse } from "next/server";
import { getTestEmailLog, clearTestEmailLog } from "@/lib/resend";

/**
 * Test-only introspection endpoint for e2e assertions on outbound emails
 * (see e2e/emails.spec.ts). Playwright tests run in a separate process from
 * this dev server and can't spy on an in-process function call directly, so
 * this exposes lib/resend.ts's PLAYWRIGHT_TEST-mode call log over HTTP.
 *
 * Gated behind PLAYWRIGHT_TEST, same as the stub in lib/resend.ts itself —
 * inert (404) whenever that env var isn't "1", including in production.
 */
function testModeEnabled() {
  return process.env.PLAYWRIGHT_TEST === "1";
}

export async function GET() {
  if (!testModeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ emails: getTestEmailLog() });
}

export async function DELETE() {
  if (!testModeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  clearTestEmailLog();
  return NextResponse.json({ cleared: true });
}
