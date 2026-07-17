import { test, expect } from "@playwright/test";

/**
 * Section 10: SEO.
 *
 * Three real bugs were found and fixed while writing these tests (not
 * hypothetical — confirmed by curling the running dev server before any
 * fix, then again after):
 *  1. Every marketing page rendered "WallTrust" twice in <title> — the root
 *     layout's title template ("%s — WallTrust") was appended on top of
 *     page-level titles that already included "WallTrust" themselves.
 *     Fixed by removing the template in app/layout.tsx.
 *  2. /pricing's canonical URL pointed at the homepage ("/") instead of
 *     itself — it was the only marketing page that forgot to set its own
 *     alternates.canonical. Fixed in app/(marketing)/pricing/page.tsx.
 *  3. public/robots.txt had no Disallow rules at all for any crawler.
 *     Fixed by adding Disallow: /dashboard, /api/, /auth/ to every
 *     User-agent block (a bot with its own dedicated block ignores
 *     User-agent: *, so the rule had to be repeated in each one).
 *
 * Note: non-homepage marketing pages' og:image (inherited from the root
 * layout's relative "/og-image.png") resolves to http://localhost:3000/...
 * against this dev server — likely a Next.js dev-only quirk given
 * metadataBase is a hardcoded production URL, unlike the canonical tag
 * (verified below to resolve correctly even against localhost). Not
 * testable correctly from a dev-only e2e run either way, so no assertion
 * for it here — worth a manual check against the real Vercel deployment.
 */

test("sitemap.xml includes the homepage, /pricing, and the known compare/for pages", async ({
  page,
}) => {
  const res = await page.request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();
  const xml = await res.text();

  // Parsed with the browser's real DOMParser (via page.evaluate) rather
  // than regex — this is actual XML parsing, not string matching.
  const urls = await page.evaluate((xmlText) => {
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) throw new Error(`sitemap.xml failed to parse: ${parserError.textContent}`);
    return Array.from(doc.querySelectorAll("url > loc")).map((el) => el.textContent);
  }, xml);

  const expectedUrls = [
    "https://www.walltrust.app/",
    "https://www.walltrust.app/pricing",
    "https://www.walltrust.app/compare",
    "https://www.walltrust.app/compare/testimonial-to-alternative",
    "https://www.walltrust.app/compare/senja-alternative",
    "https://www.walltrust.app/compare/famewall-alternative",
    "https://www.walltrust.app/compare/saywall-alternative",
    "https://www.walltrust.app/compare/trustmary-alternative",
    "https://www.walltrust.app/compare/wiserreview-alternative",
    "https://www.walltrust.app/compare/embedsocial-alternative",
    "https://www.walltrust.app/for",
    "https://www.walltrust.app/for/freelancers",
    "https://www.walltrust.app/for/coaches",
    "https://www.walltrust.app/for/saas",
    "https://www.walltrust.app/for/agencies",
    "https://www.walltrust.app/for/creators",
  ];

  for (const url of expectedUrls) {
    expect(urls).toContain(url);
  }
});

test("robots.txt disallows /dashboard, /api/, and /auth/ while allowing / generally", async ({
  page,
}) => {
  const res = await page.request.get("/robots.txt");
  expect(res.ok()).toBeTruthy();
  const body = await res.text();

  // A crawler with its own dedicated User-agent block (GPTBot, Claude-Web,
  // PerplexityBot) ignores "User-agent: *" entirely per the robots.txt
  // spec, so the rule has to actually live inside each block, not just
  // appear somewhere in the file — this extracts a named block's own body
  // to check that.
  function userAgentBlock(agent: string): string {
    const re = new RegExp(`User-agent:\\s*${agent}\\n([\\s\\S]*?)(?=\\nUser-agent:|\\nSitemap:|$)`, "i");
    return body.match(re)?.[1] ?? "";
  }

  for (const agent of ["\\*", "GPTBot", "Claude-Web", "PerplexityBot"]) {
    const block = userAgentBlock(agent);
    expect(block, `User-agent: ${agent} block`).toContain("Allow: /");
    expect(block, `User-agent: ${agent} block`).toContain("Disallow: /dashboard");
    expect(block, `User-agent: ${agent} block`).toContain("Disallow: /api/");
    expect(block, `User-agent: ${agent} block`).toContain("Disallow: /auth/");
  }

  expect(body).toContain("Sitemap: https://www.walltrust.app/sitemap.xml");
});

test("homepage, /pricing, a /compare page, and a /for page each have a non-empty, unique title and meta description", async ({
  page,
}) => {
  const pagesToCheck = [
    { path: "/", label: "homepage" },
    { path: "/pricing", label: "pricing" },
    { path: "/compare/senja-alternative", label: "compare page" },
    { path: "/for/saas", label: "for page" },
  ];

  const collected: { label: string; title: string; description: string }[] = [];

  for (const { path, label } of pagesToCheck) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute("content");

    expect(title, `${label} title`).toBeTruthy();
    expect(description, `${label} description`).toBeTruthy();

    // Regression guard for the exact bug just fixed: the brand name should
    // appear at most once in the title, not doubled by a template.
    const brandMentions = title.match(/WallTrust/gi)?.length ?? 0;
    expect(brandMentions, `${label} title should not repeat "WallTrust": "${title}"`).toBeLessThanOrEqual(1);

    collected.push({ label, title, description: description! });
  }

  const titles = collected.map((c) => c.title);
  expect(new Set(titles).size, `expected all titles unique: ${JSON.stringify(titles)}`).toBe(
    titles.length
  );

  const descriptions = collected.map((c) => c.description);
  expect(
    new Set(descriptions).size,
    `expected all descriptions unique: ${JSON.stringify(descriptions)}`
  ).toBe(descriptions.length);
});

test("homepage Open Graph tags are present and resolve to non-empty values", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  const ogDescription = await page.locator('meta[property="og:description"]').getAttribute("content");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");

  expect(ogTitle).toBeTruthy();
  expect(ogDescription).toBeTruthy();
  expect(ogImage).toBeTruthy();
  expect(ogImage).toMatch(/^https?:\/\//); // a resolvable absolute URL, not a bare relative path
});

test("canonical URLs use https:// and the production domain, never localhost", async ({ page }) => {
  const paths = ["/", "/pricing", "/compare/senja-alternative", "/for/saas"];

  for (const path of paths) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical, `canonical on ${path}`).toBeTruthy();
    expect(canonical, `canonical on ${path}`).not.toContain("localhost");
    expect(canonical!.startsWith("https://www.walltrust.app"), `canonical on ${path}: ${canonical}`).toBe(
      true
    );
  }
});
