"use client";

import { useState, useEffect } from "react";

type ConsentState = "undecided" | "accepted" | "declined";

const STORAGE_KEY = "ecm-cookie-consent";

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("undecided");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "declined") {
      setConsent(stored);
    } else {
      // Small delay so the banner slides in rather than flashing on load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
    // Analytics listens for this and calls gtag('consent', 'update', ...).
    window.dispatchEvent(new Event("ecm:consent-granted"));
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
    setVisible(false);
    window.dispatchEvent(new Event("ecm:consent-denied"));
  };

  // Don't render if already decided
  if (consent !== "undecided") return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-ecm-green border-t border-ecm-lime/20 shadow-2xl">
        <div className="max-w-5xl mx-auto px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white/90 font-barlow text-sm leading-relaxed">
              We use cookies to understand how visitors use our site and to improve your
              experience.{" "}
              <a
                href="/privacy"
                className="underline text-ecm-lime hover:text-white transition-colors"
              >
                Privacy policy
              </a>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="font-barlow font-semibold text-xs px-5 py-2 rounded-full border border-white/30 text-white/80 hover:bg-white/10 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="font-barlow font-semibold text-xs px-5 py-2 rounded-full bg-ecm-lime text-ecm-green hover:bg-ecm-lime/90 transition-colors"
            >
              Accept cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
