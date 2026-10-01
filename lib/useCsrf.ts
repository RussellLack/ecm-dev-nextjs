"use client";

/**
 * Client-side CSRF helper. Fetches /api/csrf on mount (which sets the
 * `ecm-csrf` cookie) and exposes an async `withCsrf(headers?)` for form POSTs.
 *
 * Usage:
 *   const { withCsrf } = useCsrf();
 *   fetch("/api/contact", {
 *     method: "POST",
 *     headers: await withCsrf({ "Content-Type": "application/json" }),
 *     body: JSON.stringify({ ...formData, _hp: "" }),
 *   });
 *
 * `withCsrf` reads the cookie at call time rather than a token held by this
 * instance. The server compares the header with the cookie the browser sends,
 * and another useCsrf() instance or another tab may have set the cookie since
 * this one mounted, so the cookie is the value that matches. If no cookie
 * exists yet (the first fetch is still in flight on a slow connection), it
 * waits for that fetch instead of sending the POST without a token.
 */
import { useEffect } from "react";

const COOKIE_NAME = "ecm-csrf";
const HEADER_NAME = "x-csrf-token";

/** The current `ecm-csrf` cookie value, or null if unset (or on the server). */
export function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

/** One GET /api/csrf at a time, shared by every caller on the page. */
let inFlight: Promise<string | null> | null = null;

function fetchCsrfToken(): Promise<string | null> {
  if (!inFlight) {
    inFlight = fetch("/api/csrf", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (typeof data?.token === "string" ? data.token : null))
      .catch(() => null)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

/** The token to send: the cookie, or the result of fetching one if unset. */
export async function ensureCsrfToken(): Promise<string | null> {
  const current = readCsrfCookie();
  if (current) return current;
  const fetched = await fetchCsrfToken();
  return readCsrfCookie() ?? fetched;
}

/** Headers plus `x-csrf-token`, or the headers unchanged if no token is available. */
export async function withCsrf(
  headers: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = await ensureCsrfToken();
  return token ? { ...headers, [HEADER_NAME]: token } : headers;
}

export function useCsrf() {
  // Fetch early so the token is usually ready before the first submit. The
  // server reuses a valid cookie, so this never invalidates another caller's token.
  useEffect(() => {
    void fetchCsrfToken();
  }, []);

  return { withCsrf };
}
