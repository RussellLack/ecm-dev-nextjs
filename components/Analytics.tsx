"use client";

import { useEffect } from "react";

/**
 * Analytics — client-side consent bridge for GTM + GA4.
 *
 * This file is intentionally tiny: it only forwards cookie-banner events to
 * gtag('consent','update',...). The actual GTM bootstrap lives in
 * app/layout.tsx because next/script with strategy="beforeInteractive" only
 * works inside a Server Component (the root layout). Moving the bootstrap
 * here would cause it to silently never execute under the App Router.
 *
 * ===========================================================================
 * ARCHITECTURE — where each piece of the analytics stack lives
 * ===========================================================================
 *
 *   app/layout.tsx           GTM init <Script beforeInteractive>, consent
 *                            defaults, GTM <noscript> fallback after <body>
 *   components/Analytics.tsx (this file) consent-update bridge listening for
 *                            ecm:consent-granted / ecm:consent-denied
 *   components/CookieConsent.tsx  banner UI; dispatches the events above
 *   middleware.ts            per-request CSP with nonce + 'strict-dynamic'
 *   next.config.mjs          /gtm/* rewrites that proxy gtm.js, gtag/js and
 *                            the collect endpoint through our own origin
 *
 * ===========================================================================
 * TAG / PROPERTY IDs (ecm.dev)
 * ===========================================================================
 *
 *   GTM container:    GTM-M7DKTZKC  (referenced in app/layout.tsx and
 *                     the noscript iframe src)
 *   GA4:              the measurement ID is configured INSIDE the GTM
 *                     container's GA4 Configuration tag. Do NOT hardcode a
 *                     GA4 ID anywhere in this codebase — a second
 *                     gtag('config', …) call double-counts pageviews at the
 *                     property level.
 *   GA4 property:     a391003840p532585628 (visible in GA Admin URLs)
 *   GA4 stream URL:   should be https://ecm.dev (NO www. prefix). The site
 *                     does not resolve at www.ecm.dev.
 *
 * Historical IDs — do not reintroduce:
 *   G-KWLEYMNW28      original direct-config GA4 stream. Worked, but caused
 *                     double-counting once GTM also fired a GA4 tag. Removed
 *                     from code; deleted from GA Admin.
 *   G-33HFQC8STP      stream that ended up in a broken state after a
 *                     delete/recreate cycle — Google's gtag/js CDN returns
 *                     404 for it. Replaced with a fresh stream; this ID
 *                     should not be used anywhere again.
 *
 * ===========================================================================
 * CONSENT MODE v2
 * ===========================================================================
 *
 * Two halves:
 *
 *   1. DEFAULT — set by the inline init in app/layout.tsx, BEFORE GTM loads,
 *      so every tag honours it from the first hit:
 *           analytics_storage  granted     (legitimate-interest first-party
 *                                          analytics; explicit Decline still
 *                                          downgrades it to denied)
 *           ad_storage / _user_data / _personalization
 *                              denied      (granted only after explicit Accept)
 *           security_storage   granted
 *           wait_for_update    500ms
 *
 *   2. UPDATE — this file. Listens for the two events dispatched by
 *      CookieConsent and forwards them as gtag('consent','update',...) so
 *      tags waiting on wait_for_update fire with the new state — no reload.
 *
 * If you change the default values, update both halves and the banner copy.
 *
 * ===========================================================================
 * CSP REQUIREMENTS (don't regress these in middleware.ts / next.config.mjs)
 * ===========================================================================
 *
 *   script-src      MUST include 'strict-dynamic'. Without it, GTM's
 *                   container can't inject its child inline tags (GA4 config,
 *                   custom HTML, conversion pixels) and most tags silently
 *                   never fire. Symptom: console "Executing inline script
 *                   violates ... script-src" on js?id=GTM-M7DKTZKC.
 *   style-src       must include https://www.googletagmanager.com (GTM
 *                   Preview's debug-badge stylesheet).
 *   img-src         must include https://*.google-analytics.com and
 *                   https://www.googletagmanager.com.
 *   connect-src     must include https://*.google-analytics.com,
 *                   https://*.analytics.google.com,
 *                   https://www.googletagmanager.com and
 *                   https://tagmanager.google.com.
 *   frame-src       must include https://www.googletagmanager.com and
 *                   https://tagmanager.google.com (GTM noscript iframe +
 *                   Tag Assistant overlay).
 *   frame-ancestors must include https://tagassistant.google.com so Tag
 *                   Assistant can embed the site for "Connect". Symptom of
 *                   missing it: Tag Assistant says "Could not connect to
 *                   this website".
 *
 *   X-Frame-Options MUST NOT be set in next.config.mjs. It can't be
 *   per-origin scoped, so it would override frame-ancestors and block Tag
 *   Assistant. Clickjacking protection comes from frame-ancestors.
 *
 * ===========================================================================
 * GTM PROXY (next.config.mjs /gtm/* rewrites)
 * ===========================================================================
 *
 * gtm.js is served via /gtm/js to bypass ad-blockers that target
 * googletagmanager.com directly and to avoid Netlify edge 503s on the
 * external script.
 *
 * CRITICAL: the inline bootstrap in app/layout.tsx MUST forward the
 * gtm_debug query parameter from window.location.search when building the
 * /gtm/js URL. Without that forwarding, Tag Assistant / GTM Preview can
 * never attach — gtm.js never enters debug mode and the handshake back to
 * tagassistant.google.com never completes. (See the dbg/match block in
 * gtmInitScript in layout.tsx.)
 *
 * ===========================================================================
 * TAG ASSISTANT / GTM PREVIEW — environment requirements
 * ===========================================================================
 *
 *   - Third-party cookies must be allowed for Google domains. Chrome
 *     blocks them in Incognito by default; testing in incognito will
 *     produce a false "Could not connect" even when the site is fine.
 *     Either test in a normal window, or add [*.]google.com to the
 *     third-party cookie exceptions list in Chrome settings.
 *   - The CSP changes above must be deployed.
 *   - The Netlify deploy serving the page must include the gtm_debug
 *     forwarding fix in layout.tsx.
 *
 * ===========================================================================
 * DEBUGGING PLAYBOOK — when GA4 stops collecting
 * ===========================================================================
 *
 *   1. DevTools → Network on a fresh incognito page load (don't touch the
 *      banner yet).
 *   2. Filter `gtm.js`. Does /gtm/js?id=GTM-M7DKTZKC return 200?
 *      - 4xx/5xx → proxy rewrite broken; check next.config.mjs.
 *      - missing → inline init isn't running; check the gtm-init <Script>
 *        in layout.tsx has the correct nonce and is in <head>.
 *   3. Filter `gtag/js`. Does gtag/js?id=<MEASUREMENT_ID> return 200?
 *      - 404 → the measurement ID is dead at Google's CDN, almost always
 *        because the GA4 stream was deleted and re-created. Fix: in GA
 *        Admin create a fresh data stream, copy its new measurement ID,
 *        and update the GA4 Configuration tag in GTM (GTM-M7DKTZKC) to
 *        point at the new ID, then Submit → Publish.
 *   4. Filter `collect`. Does at least one request fire?
 *      - gcs=G101 → analytics granted, ads denied (our default)
 *      - gcs=G111 → both granted (after Accept)
 *      - gcs=G100 → both denied (after Decline, or stale "declined" in
 *        localStorage)
 *      - tid= → must match the measurement ID configured in GTM.
 *   5. GA Admin → Data streams → confirm the stream is listed AND shows
 *      recent data. A "Data collection isn't active" warning means
 *      something upstream is broken (typically step 3).
 *   6. Console: any red CSP errors? If yes, the directive is named in the
 *      error — fix in middleware.ts.
 *   7. GTM container must be PUBLISHED. An unpublished container, or one
 *      where the GA4 tag's trigger doesn't match (we hit this with a
 *      "Consent Accepted" vs `consent_accepted` mismatch), will not fire
 *      anything.
 *
 * ===========================================================================
 * COMMIT HISTORY worth knowing (chronological highlights)
 * ===========================================================================
 *
 *   - Adopted Consent Mode v2 ("load always") instead of hard-gating GTM
 *     behind Accept (b20e02e / d693d43).
 *   - Dropped direct gtag('config', …) GA4 call to make GTM the single
 *     source of truth and stop double-counting (b88acaa).
 *   - Added 'strict-dynamic' to script-src; allowed tagassistant.google.com
 *     in frame-ancestors; dropped X-Frame-Options: DENY (9a137a7).
 *   - Forwarded gtm_debug param through the /gtm/js proxy so Tag Assistant
 *     can attach (d693d43).
 */

type ConsentValue = "granted" | "denied";

function updateConsent(value: ConsentValue) {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== "function") return;
    w.gtag("consent", "update", {
          ad_storage: value,
          ad_user_data: value,
          ad_personalization: value,
          analytics_storage: value,
          functionality_storage: value,
          personalization_storage: value,
    });
}

export default function Analytics({ nonce: _nonce }: { nonce: string }) {
    useEffect(() => {
          const onGranted = () => updateConsent("granted");
          const onDenied = () => updateConsent("denied");
          window.addEventListener("ecm:consent-granted", onGranted);
          window.addEventListener("ecm:consent-denied", onDenied);
          return () => {
                  window.removeEventListener("ecm:consent-granted", onGranted);
                  window.removeEventListener("ecm:consent-denied", onDenied);
          };
    }, []);

  return null;
}
