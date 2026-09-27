"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "ecm-cookie-consent"; // same key as CookieConsent.tsx

/**
 * Homepage mobile sticky CTA. Hidden until the cookie banner has been
 * answered: both are fixed to the bottom of the viewport, and on a first
 * visit the banner was covering this bar (and the hero's primary button)
 * at the same time. Listens for CookieConsent's events so it appears the
 * moment the banner is dismissed, without a reload.
 */
export default function MobileStickyCta({ href, label }: { href: string; label: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch {
      // Storage blocked: the banner can't persist a choice either, so
      // there's no banner to collide with. Show the bar.
      setShow(true);
      return;
    }
    if (stored === "accepted" || stored === "declined") {
      setShow(true);
      return;
    }
    const reveal = () => setShow(true);
    window.addEventListener("ecm:consent-granted", reveal);
    window.addEventListener("ecm:consent-denied", reveal);
    return () => {
      window.removeEventListener("ecm:consent-granted", reveal);
      window.removeEventListener("ecm:consent-denied", reveal);
    };
  }, []);

  if (!show) return null;

  return (
    <Link
      href={href}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ecm-lime text-ecm-green font-barlow font-bold text-center py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] hover:bg-ecm-lime-hover transition-colors"
    >
      {label}
    </Link>
  );
}
