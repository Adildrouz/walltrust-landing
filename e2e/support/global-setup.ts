import { request } from "@playwright/test";

// Next.js dev mode compiles each route lazily on its first request. Multiple
// Playwright workers hitting different not-yet-compiled routes at once (right
// after the server reports "ready") contend badly and time out. Warming up
// the routes this suite actually exercises, serially, before workers start
// avoids that cold-start pile-up. Unauthenticated/not-found responses are
// fine here — the route module still has to compile to produce them.
export default async function globalSetup() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
  const ctx = await request.newContext({ baseURL });

  const warmupPaths = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/dashboard",
    "/dashboard/pages",
    "/dashboard/testimonials",
    "/dashboard/settings",
    "/dashboard/widget",
    "/dashboard/rich-snippets",
    "/dashboard/billing",
    "/c/__warmup__",
  ];

  for (const path of warmupPaths) {
    await ctx.get(path).catch(() => {});
  }

  await ctx.dispose();
}
