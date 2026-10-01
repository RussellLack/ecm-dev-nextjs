import { test as base, type Browser, type BrowserContext } from "@playwright/test";

/**
 * Shared fixtures for every spec: no request from a test may reach Google
 * Analytics or Tag Manager. GTM is proxied through the site's own domain
 * (/gtm/js, /gtm/gtag, /gtm/ns.html), so the first-party proxy paths are
 * blocked too, not only the Google domains. Before this, test runs against
 * production appeared in GA4 as real visitors (source "e2e").
 *
 * Import `test` and `expect` from here, never from @playwright/test. Specs
 * that need a fresh browser context per target use `newContext()`, which
 * applies the same block.
 */

export const ANALYTICS_URL = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|\/gtm\//;

export async function blockAnalytics(context: BrowserContext): Promise<void> {
  await context.route(ANALYTICS_URL, (route) => route.abort("blockedbyclient"));
}

export const test = base.extend<{
  newContext: () => Promise<BrowserContext>;
}>({
  context: async ({ context }, use) => {
    await blockAnalytics(context);
    await use(context);
  },
  newContext: async ({ browser }: { browser: Browser }, use) => {
    const created: BrowserContext[] = [];
    await use(async () => {
      const context = await browser.newContext();
      await blockAnalytics(context);
      created.push(context);
      return context;
    });
    await Promise.all(created.map((c) => c.close().catch(() => {})));
  },
});

export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";
