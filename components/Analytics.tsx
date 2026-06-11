"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * GTM with Google Consent Mode v2 — loads on every visit.
 *
 * GTM is the single tag manager. The GA4 Configuration tag lives *inside*
 * the container (GTM-M7DKTZKC fires GA4 to G-33HFQC8STP), so we deliberately
 * do NOT configure GA4 directly here — a second `gtag('config', ...)` would
 * double-count pageviews at the property level.
 *
 * A `consent default` is pushed to the dataLayer before the container fires,
 * so every GTM tag honours it from the first hit:
 *   - analytics_storage: granted (first-party analytics under legitimate
 *     interest) unless the visitor explicitly clicks Decline
 *   - ad_storage / ad_user_data / ad_personalization: denied until the
 *     visitor explicitly clicks Accept
 *
 * CookieConsent.tsx dispatches `ecm:consent-granted` / `ecm:consent-denied`
 * on the banner buttons; we forward those as `gtag('consent','update',...)`
 * so GTM tags waiting on `wait_for_update` fire with the new state.
 *
 * The GTM <noscript> fallback lives in app/layout.tsx, immediately after
 * <body>. Inline scripts pick up the per-request nonce set in middleware.ts.
 */

const GTM_ID = "GTM-M7DKTZKC";
const STORAGE_KEY = "ecm-cookie-consent";

const inlineInit = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;

var stored = null;
try { stored = localStorage.getItem('${STORAGE_KEY}'); } catch (e) {}
var accepted = stored === 'accepted';
var declined = stored === 'declined';

var analyticsState = declined ? 'denied' : 'granted';
var adState = accepted ? 'granted' : 'denied';

gtag('consent', 'default', {
  ad_storage: adState,
  ad_user_data: adState,
  ad_personalization: adState,
  analytics_storage: analyticsState,
  functionality_storage: adState,
  personalization_storage: adState,
  security_storage: 'granted',
  wait_for_update: 500
});

(function(w,d,s,l,i){w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
j.async=true; j.src='/gtm/js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');
`;

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

export default function Analytics({ nonce }: { nonce: string }) {
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

  return (
        <Script id="gtm-init" strategy="afterInteractive" nonce={nonce}>
      {inlineInit}
    </Script>
  );
}
