const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy, served as a static header from `headers()` below.
 *
 * Static on purpose: a per-request nonce forces every page to render on
 * every request (no static HTML, no ISR, no CDN cache), which made the whole
 * site slow. See the October 2026 entry in KNOWN-ISSUES.md. Without a nonce,
 * Next.js's own inline bootstrap and RSC/Flight scripts need 'unsafe-inline'
 * in script-src. 'strict-dynamic' is gone too (it only works alongside a
 * nonce or hash, and would disable 'unsafe-inline'), so every external
 * script host must be listed explicitly.
 *
 * Allowed origins:
 * - self (the ECM.dev origin, including the /gtm/* proxy rewrites below)
 * - fonts.googleapis.com / fonts.gstatic.com (Google Fonts)
 * - cdn.sanity.io (Sanity image CDN)
 * - googletagmanager.com / google-analytics.com / tagmanager.google.com
 *   (GTM debug loads, GA4 gtag, images, collect, Tag Assistant frames)
 * - challenges.cloudflare.com (Turnstile bot check on assessments)
 */
const contentSecurityPolicy = [
    `default-src 'self'`,
    [
          "script-src 'self' 'unsafe-inline'",
          // Next.js dev mode needs 'unsafe-eval' for fast refresh; never in prod.
          isDev ? "'unsafe-eval'" : "",
          "https://ssl.google-analytics.com",
          "https://www.googletagmanager.com",
          "https://tagmanager.google.com",
          "https://challenges.cloudflare.com",
    ]
          .filter(Boolean)
          .join(" "),
    // Tailwind / Next inject inline <style> tags. googletagmanager.com is the
    // GTM Preview debug badge.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.googletagmanager.com https://tagmanager.google.com`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://cdn.sanity.io https://*.google-analytics.com https://www.googletagmanager.com https://*.gstatic.com`,
    `connect-src 'self' https://cdn.sanity.io https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://tagmanager.google.com https://tagassistant.google.com`,
    // GTM <noscript> iframe, Tag Assistant / Preview overlay, Turnstile widget.
    `frame-src 'self' https://www.googletagmanager.com https://tagmanager.google.com https://challenges.cloudflare.com`,
    // Only tagassistant.google.com may embed ecm.dev (GTM Preview mode).
    `frame-ancestors 'self' https://tagassistant.google.com`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Don't advertise the framework in response headers.
    poweredByHeader: false,

    images: {
          remotePatterns: [
            {
                      protocol: "https",
                      hostname: "cdn.sanity.io",
            },
            {
                      protocol: "https",
                      hostname: "static.wixstatic.com",
            },
                ],
    },

    /**
         * Old case-study slugs kept working after a title/slug rename, so
     * existing inbound links and search results don't 404.
     */
    async redirects() {
          return [
            {
                      // The Process Assessment is retired in favour of the
                      // Sanity-authored Expertise-to-Sales Check. Exact path
                      // only, so /assessment/process/results?sid=... links in
                      // already-sent emails keep working. Temporary until the
                      // replacement has proved itself.
                      source: "/assessment/process",
                      destination: "/assessment/expertise-to-sales",
                      permanent: false,
            },
            {
                      // The Content Operations pillar page moved off its old
                      // /content-services URL so the route matches the label
                      // used everywhere else on the site (nav, footer, case
                      // studies): see docs/SERVICE-CLARITY-AUDIT-2026-09-20.md.
                      source: "/content-services",
                      destination: "/content-operations",
                      permanent: true,
            },
            {
                      // The outbound-stack "Build" page (prospect lists, landing
                      // flows, CRM workflows) is retired: the business now runs
                      // on the three-pillar content infrastructure model, not a
                      // GTM-tooling offer. Not linked from any internal nav, so
                      // this only catches direct/external links.
                      source: "/build",
                      destination: "/",
                      permanent: true,
            },
            {
                      // Only /content-audit/sample exists under this path; send
                      // the bare parent to the tiers on the audit's home pillar.
                      // Temporary, since a dedicated audit page may follow.
                      source: "/content-audit",
                      destination: "/content-technology#content-audit",
                      permanent: false,
            },
            {
                      // "Cold outbound isn't converting" belonged to the retired
                      // outbound-stack positioning (see /build above). Page
                      // unpublished in Sanity 27 September 2026; send any
                      // inbound links to the current problems hub.
                      source: "/problems/outbound-conversion",
                      destination: "/problems",
                      permanent: true,
            },
            {
                      source: "/case-study/crm-activation-program",
                      destination: "/case-study/advertising-sales-platform",
                      permanent: true,
            },
            {
                      source: "/case-study/digital-process-improvements",
                      destination: "/case-study/digital-sales-journeys",
                      permanent: true,
            },
            {
                      source: "/case-study/content-strategy-and-cms-migration",
                      destination: "/case-study/digital-demand-generation",
                      permanent: true,
            },
            {
                      source: "/case-study/content-and-localization-services-for-national-tourism-portal",
                      destination: "/case-study/content-operations-transformation",
                      permanent: true,
            },
            {
                      // Vizrt proposal, unpublished October 2026 (not delivered work).
                      source: "/case-study/enterprise-website-redesign-and-new-customer-services-portal",
                      destination: "/case-study",
                      permanent: true,
            },
            {
                      // Veidekke, unpublished October 2026.
                      source: "/case-study/content-strategy-and-streamlined-cms-implementation",
                      destination: "/case-study",
                      permanent: true,
            },
                ];
    },

    /**
         * Proxy Google Tag Manager and GA4 collect through our own domain.
     * This prevents Netlify edge / CDN from 503-ing the external GTM script
     * and also bypasses ad-blockers that target googletagmanager.com directly.
     */
    async rewrites() {
          return [
            {
                      source: "/gtm/js",
                      destination: "https://www.googletagmanager.com/gtm.js",
            },
            {
                      source: "/gtm/collect",
                      destination: "https://www.google-analytics.com/g/collect",
            },
              {
                                  source: "/gtm/gtag",
                                  destination: "https://www.googletagmanager.com/gtag/js",
              },
                ];
    },

    /**
         * Static security headers, including the CSP defined at the top of
     * this file.
     *
     * Note: X-Frame-Options is intentionally NOT set here. Clickjacking is
     * handled by `frame-ancestors` in the CSP, which can scope-allow
     * tagassistant.google.com for GTM Preview, something X-Frame-Options
     * (DENY/SAMEORIGIN only) cannot do.
     */
    async headers() {
          return [
            {
                      source: "/:path*",
                      headers: [
                        {
                                      key: "Content-Security-Policy",
                                      value: contentSecurityPolicy,
                        },
                        {
                                      key: "X-Content-Type-Options",
                                      value: "nosniff",
                        },
                        {
                                      key: "Referrer-Policy",
                                      value: "strict-origin-when-cross-origin",
                        },
                        {
                                      key: "Permissions-Policy",
                                      value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
                        },
                        {
                                      key: "X-XSS-Protection",
                                      value: "1; mode=block",
                        },
                        {
                                      key: "Cross-Origin-Opener-Policy",
                                      value: "same-origin",
                        },
                        {
                                      key: "Strict-Transport-Security",
                                      value: "max-age=63072000; includeSubDomains; preload",
                        },
                                ],
            },
                ];
    },
};

export default nextConfig;
