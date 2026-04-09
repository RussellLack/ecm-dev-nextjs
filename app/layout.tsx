import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

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
  // every script load is blocked by the strict-dynamic CSP at runtime.
  await headers();

  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
