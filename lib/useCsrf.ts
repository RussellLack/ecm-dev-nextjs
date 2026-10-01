"use client";

/**
 * Client-side CSRF helper. Fetches /api/csrf on mount (which sets the
 * `ecm-csrf` cookie) and exposes a `withCsrf(headers?)` helper for form POSTs.
 *
 * Usage:
 *   const { token, withCsrf } = useCsrf();
 *   fetch("/api/contact", {
 *     method: "POST",
 *     headers: withCsrf({ "Content-Type": "application/json" }),
 *     body: JSON.stringify({ ...formData, _hp: "" }),
 *   });
 *
 * `withCsrf` reads the cookie at call time rather than the token this
 * instance fetched. The server compares the header with the cookie the
 * browser sends, and another useCsrf() instance or another tab may have set
 * the cookie since this one mounted, so the cookie is the value that matches.
 */
import { useCallback, useEffect, useState } from "react";

const COOKIE_NAME = "ecm-csrf";
const HEADER_NAME = "x-csrf-token";

/** The current `ecm-csrf` cookie value, or null if unset (or on the server). */
export function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

export function useCsrf() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/csrf", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.token) setToken(data.token);
      })
      .catch(() => {
        /* silently ignore — form will error on submit if missing */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const withCsrf = useCallback(
    (headers: Record<string, string> = {}): Record<string, string> => {
      const current = readCsrfCookie() ?? token;
      if (!current) return headers;
      return { ...headers, [HEADER_NAME]: current };
    },
    [token]
  );

  return { token, withCsrf };
}
