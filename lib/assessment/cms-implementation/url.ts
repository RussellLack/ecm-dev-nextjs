// url.ts — compact encode/decode of CmsImplementationInputs into a URL
// query string. Used by the "Copy shareable link" button so a recipient
// landing on the calculator sees the same scenario without going through
// the email-capture flow.
//
// Format: `?d=<base64url-encoded JSON>`. Base64url is URL-safe and
// keeps the param small (<= ~400 chars for the 12-input shape). Future
// schema changes are tolerated by `decodeInputs` returning `null` on
// any parse error — the calculator silently falls back to defaults.

import type { CmsImplementationInputs } from "./types.ts";
import { DEFAULT_INPUTS } from "./defaults.ts";

const PARAM = "d";

/* ── Base64url codec (RFC 4648 §5) ─────────────────────────────────────── */

function utf8ToBase64Url(str: string): string {
  // Browser path uses btoa; Node path uses Buffer.
  let b64: string;
  if (typeof window === "undefined") {
    b64 = Buffer.from(str, "utf8").toString("base64");
  } else {
    b64 = btoa(unescape(encodeURIComponent(str)));
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(b64url: string): string {
  const b64 = b64url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(b64url.length + ((4 - (b64url.length % 4)) % 4), "=");
  if (typeof window === "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(atob(b64)));
}

/* ── Public API ────────────────────────────────────────────────────────── */

/** Serialise inputs into a URL query string (returns just the value,
 *  not the full `?d=...` — caller composes the URL). */
export function encodeInputs(inputs: CmsImplementationInputs): string {
  return utf8ToBase64Url(JSON.stringify(inputs));
}

/** Parse encoded inputs from a query string. Returns null on any error
 *  (missing key, invalid base64, invalid JSON, schema mismatch). The
 *  caller should fall back to DEFAULT_INPUTS. */
export function decodeInputs(search: string): CmsImplementationInputs | null {
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    const encoded = params.get(PARAM);
    if (!encoded) return null;
    const json = base64UrlToUtf8(encoded);
    const parsed = JSON.parse(json) as Partial<CmsImplementationInputs>;
    // Shape-check: require the four top-level objects we depend on.
    if (
      !parsed.org ||
      !parsed.current ||
      !parsed.target ||
      !parsed.scope ||
      !parsed.runtime
    ) {
      return null;
    }
    // Merge with defaults so any missing fields don't crash the engine.
    return {
      ...DEFAULT_INPUTS,
      ...parsed,
      org: { ...DEFAULT_INPUTS.org, ...parsed.org },
      current: { ...DEFAULT_INPUTS.current, ...parsed.current },
      target: { ...DEFAULT_INPUTS.target, ...parsed.target },
      scope: { ...DEFAULT_INPUTS.scope, ...parsed.scope },
      runtime: { ...DEFAULT_INPUTS.runtime, ...parsed.runtime },
      options: { ...DEFAULT_INPUTS.options, ...(parsed.options ?? {}) },
    };
  } catch {
    return null;
  }
}

/** Build a full URL with the inputs baked into a query string. */
export function buildShareableUrl(
  baseUrl: string,
  inputs: CmsImplementationInputs,
): string {
  const encoded = encodeInputs(inputs);
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}${PARAM}=${encoded}`;
}
