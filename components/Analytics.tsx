"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * GTM + GA4 with Google Consent Mode v2.
 *
 * Scripts load on every visit. Before any tag fires, we push a `consent
 * default` command to the dataLayer with everything set to `denied` (or
 * `granted` if a prior visit stored acceptance). GTM and GA4 respect that
 * state — denied users still generate cookieless/modeled pings, so GA4 gets
 * signal instead of nothing.
 *
 * CookieConsent.tsx dispatches `ecm:consent-granted` / `ecm:consent-denied`
 * when the user clicks a banner button; we translate those into
 * `gtag('consent', 'update', ...)` calls so tags that were waiting
 * (wait_for_update) fire with the new state.
 *
 * The inline init script reads localStorage synchronously so repeat visitors
 * who previously accepted get full-consent tags from the first hit, without
 * waiting for React to mount.
 */

const GTM_ID = "GTM-M7DKTZKC";
const GA4_ID = "G-KWLEYMNW28";
const STORAGE_KEY = "ecm-cookie-consent";

const inlineInit = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;

var stored = null;
try { stored = localStorage.getItem('${STORAGE_KEY}'); } catch (e) {}
var accepted = stored === 'accepted';
var declined = stored === 'declined';

// First-party analytics runs under legitimate interest — default granted,
// but honoured as denied if the user explicitly clicks Decline.
var analyticsState = declined ? 'denied' : 'granted';
// Ads and personalization stay denied until the user explicitly accepts.
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
j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');

gtag('js', new Date());
gtag('config', '${GA4_ID}');
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

export default function Analytics() {
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
    <>
      <Script id="analytics-init" strategy="afterInteractive">
        {inlineInit}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
