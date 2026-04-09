"use client";

/**
 * Client-side CSRF helper. Fetches /api/csrf on mount, keeps the token in
 * component state, and exposes a `withCsrf(headers?)` helper for form POSTs.
 *
 * Usage:
 *   const { token, withCsrf } = useCsrf();
 *   fetch("/api/contact", {
 *     method: "POST",
 *     headers: withCsrf({ "Content-Type": "application/json" }),
 *     body: JSON.stringify({ ...formData, _hp: "" }),
 *   });
 */
import { useCallback, useEffect, useState } from "react";

const HEADER_NAME = "x-csrf-token";

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
      if (!token) return headers;
      return { ...headers, [HEADER_NAME]: token };
    },
    [token]
  );

  return { token, withCsrf };
}
