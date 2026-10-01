/**
 * Which origin the E2E suite targets.
 *
 *   E2E_BASE_URL  explicit target, the only way to reach production
 *                 (used by the scheduled production monitor)
 *   BASE_URL      deploy preview origin (set by the deploy-preview workflow);
 *                 refused if it points at production
 *   (neither)     a local server on http://localhost:3000
 *
 * Analytics requests are blocked in every test (see fixtures.ts), so even
 * the production monitor sends nothing to GA4.
 */
export const LOCAL_BASE_URL = "http://localhost:3000";

const PRODUCTION_HOSTS = new Set(["ecm.dev", "www.ecm.dev"]);

export function resolveBaseURL(env: NodeJS.ProcessEnv = process.env): string {
  if (env.E2E_BASE_URL) return env.E2E_BASE_URL;

  const preview = env.BASE_URL;
  if (preview) {
    if (PRODUCTION_HOSTS.has(new URL(preview).hostname)) {
      throw new Error(
        `BASE_URL points at production (${preview}). To test production on ` +
          "purpose, set E2E_BASE_URL instead.",
      );
    }
    return preview;
  }

  return LOCAL_BASE_URL;
}
