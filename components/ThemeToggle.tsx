"use client";

/**
 * Light / dark / system theme toggle.
 *
 * Cycles light -> dark -> system -> light. "System" removes the explicit
 * data-theme attribute so the CSS `@media (prefers-color-scheme: dark)`
 * rule in globals.css takes over and stays live-reactive to OS changes;
 * "light"/"dark" set data-theme explicitly and persist to localStorage.
 * The no-FOUC init script in app/layout.tsx applies any stored choice
 * before first paint — this component only needs to read it back on
 * mount to show the right icon and to handle clicks after that.
 */

import { useEffect, useState } from "react";

type ThemeChoice = "light" | "dark" | "system";
const STORAGE_KEY = "ecm-theme";

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
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

function SystemIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 20h7M12 16.5V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    let stored: ThemeChoice = "system";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark") stored = raw;
    } catch {
      /* localStorage unavailable (private mode, blocked storage) — fall back to system */
    }
    setChoice(stored);
  }, []);

  const cycle = () => {
    const next: ThemeChoice = choice === "light" ? "dark" : choice === "dark" ? "system" : "light";
    setChoice(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* persistence is a convenience, not a requirement — theme still applies this session */
    }
    applyTheme(next);
  };

  const label =
    choice === "light" ? "Light theme" : choice === "dark" ? "Dark theme" : "System theme";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Switch theme (currently ${label.toLowerCase()})`}
      title={`Theme: ${label} — click to change`}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-ecm-lime hover:bg-white/10 transition-colors ${className}`}
    >
      {choice === "light" && <SunIcon />}
      {choice === "dark" && <MoonIcon />}
      {choice === "system" && <SystemIcon />}
    </button>
  );
}
