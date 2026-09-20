"use client";

/**
 * Light / dark theme toggle.
 *
 * The site defaults to light regardless of OS/browser preference (see
 * app/globals.css) — dark is opt-in only. Clicking this cycles light <->
 * dark and persists the choice to localStorage; the no-FOUC init script
 * in app/layout.tsx applies any stored choice before first paint, so this
 * component only needs to read it back on mount to show the right icon
 * and to handle clicks after that.
 */

import { useEffect, useState } from "react";

type ThemeChoice = "light" | "dark";
const STORAGE_KEY = "ecm-theme";

function applyTheme(choice: ThemeChoice) {
  document.documentElement.setAttribute("data-theme", choice);
}

function SunIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>("light");

  useEffect(() => {
    let stored: ThemeChoice = "light";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark") stored = raw;
    } catch {
      /* localStorage unavailable (private mode, blocked storage) — fall back to light */
    }
    setChoice(stored);
  }, []);

  const cycle = () => {
    const next: ThemeChoice = choice === "light" ? "dark" : "light";
    setChoice(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* persistence is a convenience, not a requirement — theme still applies this session */
    }
    applyTheme(next);
  };

  const label = choice === "light" ? "Light theme" : "Dark theme";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Switch theme (currently ${label.toLowerCase()})`}
      title={`Theme: ${label} — click to change`}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-ecm-lime hover:bg-white/10 transition-colors ${className}`}
    >
      {choice === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
