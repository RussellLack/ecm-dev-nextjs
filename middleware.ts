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
 * - self (the ECM.dev origin)
 * - fonts.googleapis.com (Google Fonts stylesheet)
 * - fonts.gstatic.com (Google Fonts binary files)
 * - cdn.sanity.io (Sanity image CDN)
 * - googletagmanager.com / google-analytics.com / tagmanager.google.com
 *   (GTM images, GA4 connections, Tag Assistant frames)
 *
 * Note: GTM bootstrap script and GA4 gtag script are proxied through
 * /gtm/* rewrites in next.config.mjs, so script-src only needs 'self'.
 * googletagmanager.com is still needed for img-src, connect-src, frame-src.
 */
export function middleware(request: NextRequest) {
    // 128-bit base64 nonce per request.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isDev = process.env.NODE_ENV !== "production";

  // Next.js dev mode needs 'unsafe-eval' for fast refresh; we drop it in prod.
  // 'strict-dynamic' is required so GTM's container (loaded via our nonced
  // gtm-init Script) can in turn inject its own inline tags (GA4 config, custom
  // HTML tags, conversion pixels). Without it, those child injections are
  // CSP-blocked and most GTM tags silently fail to fire.
  const scriptSrc = [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        isDev ? "'unsafe-eval'" : "",
        "https://ssl.google-analytics.com",
      ]
      .filter(Boolean)
      .join(" ");

  const cspHeader = [
        `default-src 'self'`,
        `script-src ${scriptSrc}`,
        // Tailwind / Next inject inline <style> tags — style-src needs
        // 'unsafe-inline'. googletagmanager.com is the GTM Preview debug badge.
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com`,
        `font-src 'self' https://fonts.gstatic.com`,
        `img-src 'self' data: blob: https://cdn.sanity.io https://*.google-analytics.com https://www.googletagmanager.com https://*.gstatic.com`,
        `connect-src 'self' https://cdn.sanity.io https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://tagmanager.google.com`,
        // GTM <noscript> iframe + Tag Assistant / Preview overlay load from these.
        `frame-src 'self' https://www.googletagmanager.com https://tagmanager.google.com`,
        // Allow tagassistant.google.com to embed ecm.dev for Preview mode.
        // No third-party can frame ecm.dev otherwise (clickjacking protection).
        `frame-ancestors 'self' https://tagassistant.google.com`,
        `form-action 'self'`,
        `base-uri 'self'`,
        `object-src 'none'`,
        `upgrade-insecure-requests`,
      ].join("; ");

  const cspValue = cspHeader.replaceAll("\n", "");

  // Forward the nonce so Server Components / Next's runtime can read it
  // off the incoming request headers.
  const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    // Next.js discovers the nonce by parsing it out of the CSP header on the
    // *request*. Without this line Next never stamps a nonce onto its own
    // inline bootstrap + RSC/Flight (`self.__next_f`) scripts, so under a
    // strict `script-src` (no 'unsafe-inline') the browser blocks them and
    // React never hydrates — breaking all interactivity site-wide.
    requestHeaders.set("Content-Security-Policy", cspValue);

  const response = NextResponse.next({
        request: { headers: requestHeaders },
  });

  // Attach the same CSP to the response. The request and response MUST carry
  // identical policies so the nonce Next.js reads off the request matches the
  // nonce the browser enforces against.
  response.headers.set("Content-Security-Policy", cspValue);

  return response;
}

export const config = {
    matcher: [
          /*
           * Match all request paths except for the ones starting with:
           * - api (API routes)
           * - _next/static (static files)
           * - _next/image (image optimization files)
           * - favicon.ico (favicon file)
           */
      {
              source:
                        "/((?!api|_next/static|_next/image|favicon.ico).*)",
              missing: [
                { type: "header", key: "next-action" },
                { type: "header", key: "content-type", value: "text/x-component" },
                      ],
      },
        ],
};
