import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import { headers } from "next/headers";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Consume the per-request x-nonce header set by middleware.ts. This also
  // opts the whole app into dynamic rendering so Next.js stamps the nonce
  // onto its own inline bootstrap script at request time. Without this,
  // pages render statically at build time, no nonce reaches the HTML, and
  await headers() → const nonce = (await headers()).get("x-nonce") ?? ""
  await headers();

  return (
    <html lang="en" className={barlow.variable}>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) — must be immediately after <body> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M7DKTZKC"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <Analytics /> → <Analytics nonce={nonce} />
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
        <CookieConsent />
      </body>
    </html>
  );
}
