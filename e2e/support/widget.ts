import type { Page } from "@playwright/test";

/**
 * Builds a minimal static host page embedding the real widget script tag,
 * exactly as a customer's site would. The script src is an absolute URL
 * (not relative) so this works when loaded via page.setContent() without a
 * prior same-origin navigation — the route itself sends
 * Access-Control-Allow-Origin: * specifically so it can be embedded
 * cross-origin like this.
 *
 * A cache-busting query param is required: the route responds with
 * Cache-Control: public, max-age=300, and the browser's HTTP cache would
 * otherwise serve a stale (pre-config-change) script on a second load
 * within the same test.
 */
export function widgetEmbedHtml(baseURL: string, userId: string) {
  const cacheBust = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>widget embed fixture</title></head>
<body>
<div id="walltrust-widget"></div>
<script src="${baseURL}/api/widget/${userId}?cb=${cacheBust}" async></script>
</body>
</html>`;
}

/** Loads the fixture page and waits for the widget script to have rendered something. */
export async function loadWidgetEmbed(page: Page, baseURL: string, userId: string) {
  await page.setContent(widgetEmbedHtml(baseURL, userId));
  await page.waitForSelector(
    "#walltrust-widget .wt-card, #walltrust-widget .wt-badge, #walltrust-widget .wt-empty",
    { timeout: 10_000 }
  );
}
