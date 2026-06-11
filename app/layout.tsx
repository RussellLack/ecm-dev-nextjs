import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import { organizationSchema } from "@/lib/structuredData";

// Self-hosted Barlow via next/font. Replaces the previous @import in
// globals.css which was render-blocking and added ~1-2s to LCP.
// next/font preloads the font, applies font-display: swap automatically,
// and serves from the same origin (no DNS lookup, no chained request).
const barlow = Barlow({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    display: "swap",
    variable: "--font-barlow",
});

const siteUrl = "https://ecm.dev";
const siteName = "ECM.DEV";
const siteDescription =
    "We design the operating systems, governance frameworks, and structured workflows that turn content into a reliable, AI-ready asset.";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} | Content Infrastructure for the AI Enterprise`,
          template: `%s | ${siteName}`,
    },
    description: siteDescription,
    icons: {
          icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/favicon-96.png", type: "image/png", sizes: "96x96" },
                ],
          apple: [{ url: "/apple-touch-icon.png" }],
    },
    manifest: "/manifest.webmanifest",
    openGraph: {
          type: "website",
          locale: "en_GB",
          url: siteUrl,
          siteName,
          title: `${siteName} | Content Infrastructure for the AI Enterprise`,
          description: siteDescription,
    },
    twitter: {
          card: "summary_large_image",
          title: `${siteName} | Content Infrastructure for the AI Enterprise`,
          description: siteDescription,
    },
    robots: {
          index: true,
          follow: true,
          googleBot: {
                  index: true,
                  follow: true,
                  "max-video-preview": -1,
                  "max-image-preview": "large",
                  "max-snippet": -1,
          },
    },
    alternates: {
          canonical: siteUrl,
    },
};

const GTM_ID = "GTM-M7DKTZKC";
const STORAGE_KEY = "ecm-cookie-consent";

/**
 * Inline script content for GTM initialisation.
 *
 * Runs before any React hydration (strategy="beforeInteractive") so GTM
 * fires on the very first page load — not after hydration. This is the
 * only place next/script with beforeInteractive works: a Server Component
 * (i.e. the root layout). Moving it to a "use client" component with
 * afterInteractive causes it to never execute in the App Router.
 *
 * Order of operations:
 * 1. Initialise window.dataLayer and window.gtag
 * 2. Push consent defaults (honouring any previously stored preference)
 * 3. Inject the GTM container loader via the /gtm/js proxy route
 */
const gtmInitScript = `
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
                (function(w,d,s,l,i){
                  w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
                    var f=d.getElementsByTagName(s)[0],
                          j=d.createElement(s),
                                dl=l!='dataLayer'?'&l='+l:'';
                                  j.async=true;
                                    j.src='/gtm/js?id='+i+dl;
                                      f.parentNode.insertBefore(j,f);
                                      })(window,document,'script','dataLayer','${GTM_ID}');
                                      `;

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Consume the per-request x-nonce header set by middleware.ts. This also
  // opts the whole app into dynamic rendering so Next.js stamps the nonce
  // onto its own inline bootstrap script at request time. Without this,
  // pages render statically at build time, no nonce reaches the HTML, and
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
        <html lang="en" className={barlow.variable}>
          {/*
                    GTM loader — strategy="beforeInteractive" injects this into <head>
                    before any page JS runs. Must live in a Server Component (this file);
                    it does NOT work inside "use client" components.
                  */}
                <Script
                          id="gtm-init"
                          strategy="beforeInteractive"
                          nonce={nonce}
                          dangerouslySetInnerHTML={{ __html: gtmInitScript }}
                        />
                <body className="antialiased">
                  {/* Google Tag Manager (noscript) — must be immediately after <body> */}
                        <noscript>
                                  <iframe
                                                src="/gtm/ns.html?id=GTM-M7DKTZKC"
                                                height="0"
                                                width="0"
                                                style={{ display: "none", visibility: "hidden" }}
                                                title="Google Tag Manager"
                                              />
                        </noscript>
                        <Analytics nonce={nonce} />
                        <Header />
                        <main>{children}</main>
                        <Footer />
                        <CookieConsent />
                </body>
        </html>
      );
}
