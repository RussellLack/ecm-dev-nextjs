import type { Page, ConsoleMessage } from "@playwright/test";

/**
 * Console / runtime error guard.
 *
 * The June 2026 outage rendered every page but never hydrated, because a CSP
 * nonce mismatch made the browser block Next's inline scripts. The tell-tale
 * was a console error: "Refused to execute inline script because it violates
 * the following Content Security Policy directive...". This guard fails a test
 * if any such CSP / hydration / uncaught-runtime error appears on load.
 *
 * Benign third-party noise (analytics, blocked-by-adblock, transient 5xx from
 * GTM) is allow-listed so it doesn't cause false failures.
 */

/** Known-benign noise — never a sign of a broken assessment. */
const BENIGN = [
  /googletagmanager\.com/i,
  /google-analytics\.com/i,
  /gtag\/js/i,
  /favicon/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /net::ERR_/i,
  /responded with a status of 50\d/i, // transient upstream (e.g. GTM 503)
];

/** Patterns that indicate a real CSP / hydration / runtime failure. */
const CRITICAL = [
  /Refused to (execute|load|apply|connect|frame)/i, // CSP violations
  /Content Security Policy/i,
  /Hydration failed/i,
  /did not match/i, // React hydration mismatch
  /Text content does not match/i,
  /Minified React error #(418|419|421|422|423|425)/i,
];

export interface ConsoleGuard {
  /** Returns the collected critical errors (empty = healthy). */
  errors(): string[];
}

const isBenign = (text: string) => BENIGN.some((re) => re.test(text));
const isCritical = (text: string) => CRITICAL.some((re) => re.test(text));

/**
 * Start capturing console + page errors. Call BEFORE `page.goto(...)`.
 */
export function attachConsoleGuard(page: Page): ConsoleGuard {
  const collected: string[] = [];

  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (isBenign(text)) return;
    // Console errors are only failed on if they match a critical pattern,
    // to avoid flaking on incidental app warnings logged at error level.
    if (isCritical(text)) collected.push(`[console] ${text}`);
  });

  page.on("pageerror", (err) => {
    const text = err?.message || String(err);
    if (isBenign(text)) return;
    // An uncaught exception during load is always treated as critical.
    collected.push(`[pageerror] ${text}`);
  });

  return {
    errors: () => collected.slice(),
  };
}
