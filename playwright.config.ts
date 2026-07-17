import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

// e2e/support/db.ts talks to MongoDB directly from the Playwright test
// process (not through Next.js), so it needs .env.local loaded here too —
// Next.js only auto-loads it for the dev server process it spawns below.
loadEnvConfig(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  // A single Next.js dev server + remote MongoDB connection serves every
  // worker, so assertions waiting on a server round-trip (dialog close
  // after a save, etc.) get slower as more specs run concurrently. 5s was
  // tight enough to flake under 4-worker load with 16 tests; give it room.
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // A single `next dev` process backs every worker. Under 4-way concurrent
  // load it dropped connections outright (ECONNRESET), not just responded
  // slowly — a dev-mode concurrency limit, not a flaky assertion. Capping
  // workers keeps runs reliable; revisit if/when e2e moves to a production
  // build (next build && next start), which handles concurrency properly.
  workers: 2,
  // The remote Railway-hosted MongoDB connection can drop mid-run
  // (PoolClearedOnNetworkError / monitor timeout) — a transient network
  // hiccup unrelated to test or app correctness. One retry absorbs that
  // without masking a real, consistently-failing test.
  retries: 1,
  reporter: "list",
  globalSetup: "./e2e/support/global-setup.ts",
  globalTeardown: "./e2e/support/global-teardown.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    // Force a fresh server for every test run so PLAYWRIGHT_TEST is
    // guaranteed active (a manually-running dev server started without
    // it would otherwise get reused and silently send real emails).
    reuseExistingServer: false,
    timeout: 60_000,
    env: { ...process.env, PLAYWRIGHT_TEST: "1" } as Record<string, string>,
  },
});
