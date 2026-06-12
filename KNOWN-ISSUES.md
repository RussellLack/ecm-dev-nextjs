# KNOWN-ISSUES.md — ECM.DEV

Tracks notable bugs (resolved and open) and the ongoing monitor list. See also
[`ANALYTICS.md`](./ANALYTICS.md) for GTM/GA4 specifics.

## Resolved

### Site-wide React hydration failure — CSP nonce mismatch (June 2026)

**Status:** ✅ Resolved — commit `8d73f27` on `main`.

**Symptom:** Every interactive element across the whole site was dead. Most
visibly, the "Start the assessment" buttons on `/assessment/` and sub-pages
(e.g. `/assessment/lead-magnet`) rendered but did nothing — no navigation, no
modal, no submit. Pages rendered visually but had **no React fiber on any DOM
element**, on every route including the home page.

**Misdiagnosis (do not repeat):** An initial browser-side investigation blamed
the Sanity live/real-time preview client (a `0e-…js` chunk throwing
`Error: Connection closed`) and recommended disabling Sanity live preview in
production. **This was wrong.** There is **no** Sanity live/SSE/preview client
anywhere in the codebase — every Sanity client is `server-only` with
`perspective: "published"`. The "Connection closed" error was a red herring
(unrelated analytics/extension noise), not the hydration blocker.

**Actual root cause:** `middleware.ts` set the strict Content-Security-Policy
(`script-src` with **no** `'unsafe-inline'`) on the **response only**. Next.js
discovers its hydration nonce by parsing the CSP off the **request** headers, so
it never stamped a nonce onto its own inline bootstrap + RSC/Flight
(`self.__next_f`) scripts. The browser then blocked those inline scripts under
the strict policy, React never hydrated, and all interactivity died site-wide.

**Fix:** Set the identical CSP on the request headers in `middleware.ts` so
Next.js can find the nonce:

```ts
const cspValue = cspHeader.replaceAll("\n", "");
requestHeaders.set("Content-Security-Policy", cspValue); // <- the fix
// ...
response.headers.set("Content-Security-Policy", cspValue); // request & response must match
```

**Guardrail:** Request and response CSP must always carry an identical policy.
If hydration ever breaks site-wide again, check this nonce path **first** —
verify there are no `script-src` CSP violations in the live console before
suspecting any data/preview layer.

### GTM script never executing — `next/script` in a Client Component (June 2026)

**Status:** ✅ Resolved.

**Root cause:** A `next/script` tag was placed inside a `"use client"`
component. In the Next.js App Router, `Script` tags inside client components are
silently ignored and never execute, so GTM never loaded.

**Fix:** All `<Script>` tags must live in a Server Component. GTM init now lives
in `app/layout.tsx`; `components/Analytics.tsx` is a consent bridge only and
contains no `Script` tags. See [`ANALYTICS.md`](./ANALYTICS.md).

## Open — Monitor list

| Issue | Status | Notes |
| --- | --- | --- |
| GTM external `gtag/js` returning 503 | ⚠️ Monitor | Transient Google server error. Not actionable. Resolves on retry. Mitigated by the `/gtm/*` proxy in `next.config.mjs`. |
| 24frames Performance Dashboard in GA4 nav | ⚠️ Monitor | Legacy artefact in the GA4 left nav. Safe to delete if it reappears. |

---

_Last updated: June 2026_
