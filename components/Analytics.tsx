"use client";

import { useEffect } from "react";

/**
 * Analytics — client-side consent bridge only.
 *
 * The GTM script loader (<Script id="gtm-init" strategy="beforeInteractive">)
 * lives in app/layout.tsx as a Server Component, which is the only place
 * next/script with beforeInteractive actually works in the App Router.
 *
 * This component's sole job is to listen for the cookie consent banner
 * events dispatched by CookieConsent.tsx and forward them to gtag() so
 * GTM tags honouring wait_for_update fire with the correct consent state.
 *
 * GTM is the single tag manager. The GA4 Configuration tag lives *inside*
 * the container (GTM-M7DKTZKC fires GA4 to G-33HFQC8STP), so we deliberately
 * do NOT configure GA4 directly here — a second `gtag('config', ...)` would
 * double-count pageviews at the property level.
 *
 * The GTM <noscript> fallback lives in app/layout.tsx, immediately after
 * <body>.
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
