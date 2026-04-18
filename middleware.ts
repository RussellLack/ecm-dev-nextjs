import { NextRequest, NextResponse } from "next/server";

/**
 * Per-request Content-Security-Policy with a fresh nonce.
 *
 * Why middleware? Next.js App Router injects a small inline bootstrap
 * script per request. To avoid `'unsafe-inline'` in `script-src`, we
 * mint a nonce here, hand it to Next via the `x-nonce` request header
 * (Next automatically applies it to its own inline scripts), and
 * reference it in the CSP.
 *
 * The static headers (X-Frame-Options, Referrer-Policy, etc.) live in
 * next.config.mjs under `headers()` — they don't need per-request
 * computation so there's no reason to pay the middleware cost for them.
 *
 * Allowed origins:
 *   - self (the ECM.dev origin)
 *   - fonts.googleapis.com  (Google Fonts stylesheet)
 *   - fonts.gstatic.com     (Google Fonts binary files)
 *   - cdn.sanity.io         (Sanity image CDN)
 *
 * If you add analytics later (GA, Plausible, PostHog, etc.), add the
 * script host to `script-src` and the collector endpoint to
 * `connect-src`.
 */
export function middleware(request: NextRequest) {
  // 128-bit base64 nonce per request.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isDev = process.env.NODE_ENV !== "production";

  // Next.js dev mode needs 'unsafe-eval' for fast refresh; we drop it in prod.
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    isDev ? "'unsafe-eval'" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cspHeader = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    // Tailwind / Next inject inline <style> tags — style-src needs
    // 'unsafe-inline'. This is the standard Next.js App Router trade-off.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://cdn.sanity.io https://*.google-analytics.com https://www.googletagmanager.com`,
    `connect-src 'self' https://cdn.sanity.io https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  // Forward the nonce so Server Components / Next's runtime can read it
  // off the incoming request headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("content-security-policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   - /api/*           (JSON responses, no CSP needed)
     *   - /_next/static/*  (static chunks, immutable)
     *   - /_next/image/*   (image optimizer)
     *   - favicon.ico
     * Prefetch requests are skipped to avoid burning nonces on speculative
     * navigations that never render HTML.
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
