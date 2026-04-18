"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

/**
 * Hard-gated GTM + GA4 loader.
 *
 * Scripts do NOT load until the user clicks "Accept cookies" in
 * CookieConsent.tsx. That component writes "accepted" to
 * localStorage["ecm-cookie-consent"] and dispatches the
 * "ecm:consent-granted" window event. We listen for that event AND
 * re-check localStorage on mount so repeat visitors who previously
 * accepted get analytics loaded automatically.
 *
 * Both GTM and GA4 are loaded directly (user explicitly chose "both
 * snippets"). The inline init scripts pick up the nonce from the
 * per-request CSP header that middleware.ts sets.
 */

const GTM_ID = "GTM-M7DKTZKC";
const GA4_ID = "G-KWLEYMNW28";
const STORAGE_KEY = "ecm-cookie-consent";

export default function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    // Read stored consent on mount (repeat visitors).
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "accepted") {
      setConsented(true);
      return;
    }

    // First-time visitor: wait for the banner Accept click.
    const onGranted = () => setConsented(true);
    window.addEventListener("ecm:consent-granted", onGranted);
    return () => window.removeEventListener("ecm:consent-granted", onGranted);
  }, []);

  if (!consented) return null;

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>

      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
      </Script>
    </>
  );
}
