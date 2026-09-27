# ANALYTICS.md — ECM.DEV Analytics & Tag Management

## Accounts & IDs

| Service | Account / Property | ID |
| --- | --- | --- |
| GA4 Property | ecm.dev [main site] | `p532585628` |
| GA4 Account | ECM Agency | — |
| GTM Account | ECM.DEV | `6350600794` |
| GTM Container | ECM.DEV | `GTM-M7DKTZKC` |
| GTM Current Version | Version 9 | — |
| Google Account | — | `authuser=2` |
| Active GA4 Measurement ID | fired from inside GTM container | `G-33HFQC8STP` |

> The active measurement ID (`G-33HFQC8STP`) is documented in the
> `components/Analytics.tsx` header comment. It is configured **inside** the
> GTM container — never hardcode a second GA4 config tag in app code.

## Architecture Overview

GA4 data is collected via Google Tag Manager. GTM is loaded through a Next.js
proxy to avoid ad-blocker interference. All consent state is managed
client-side via `localStorage` and passed to GTM via `gtag('consent', ...)`
calls before GTM initialises.

```
User browser
  → /gtm/js?id=GTM-M7DKTZKC   (Next.js proxy → GTM container script)
  → /gtm/gtag                 (Next.js proxy → GA4 gtag.js)
  → /gtm/collect              (Next.js proxy → GA4 collect endpoint)
  → GTM fires GA4 tag → GA4 property p532585628 (G-33HFQC8STP)
```

## Proxy Routes

Defined in `next.config.mjs`. Always use these in code — never reference
`www.googletagmanager.com` or `www.google-analytics.com` directly:

| Proxy path | Destination |
| --- | --- |
| `/gtm/js` | GTM container script (`gtm.js`) |
| `/gtm/gtag` | GA4 `gtag.js` |
| `/gtm/collect` | GA4 collect endpoint (`/g/collect`) |

## CSP & Nonce

`middleware.ts` generates a per-request nonce for the Content Security Policy.
This nonce must be applied to the GTM init inline script. It is read from the
`x-nonce` request header in `layout.tsx` and passed down through the component
tree. **Do not add new inline scripts without also passing and applying the
nonce.**

> The CSP (no `'unsafe-inline'` in `script-src`) is set on **both** the request
> and response headers in `middleware.ts`. Next.js reads the nonce off the
> *request* CSP header to stamp its own inline hydration scripts — if the CSP is
> ever set on the response only, React stops hydrating site-wide. (See the
> June 2026 hydration incident in `KNOWN-ISSUES`.)

## Code Architecture

### `app/layout.tsx` (Server Component)

This is where GTM is initialised. Key elements:

- `GTM_ID = "GTM-M7DKTZKC"` — container ID constant
- `STORAGE_KEY = "ecm-cookie-consent"` — `localStorage` key for consent state
- `gtmInitScript` — inline script string that runs `beforeInteractive`,
  containing:
  - `window.dataLayer` initialisation
  - `window.gtag` function definition
  - `localStorage` consent check (reads prior user choice)
  - `gtag('consent', 'default', {...})` — sets consent defaults before GTM loads
  - GTM loader IIFE (loads via proxy `/gtm/js?id=GTM-M7DKTZKC`)
- `<Script id="gtm-init" strategy="beforeInteractive" nonce={nonce}
  dangerouslySetInnerHTML={{ __html: gtmInitScript }} />` — placed between the
  `<html>` and `<body>` tags
- `<noscript>` GTM iframe fallback — placed inside `<body>`

### `components/Analytics.tsx` (Client Component)

This is a **consent bridge only** — it does **NOT** load GTM. It:

- Listens for custom DOM events `ecm:consent-granted` and `ecm:consent-denied`
- Updates GTM consent state via `window.gtag('consent', 'update', {...})` when
  those events fire
- Returns `null` (no rendered output)
- Accepts `{ nonce: _nonce }` prop (unused, kept for API compatibility)

> **Critical rule:** Do not put `next/script` tags inside this component. In the
> Next.js App Router, `Script` tags inside `"use client"` components are
> silently ignored and never execute. All `Script` tags must live in Server
> Components.

## GTM Container

### Current State (Version 9)

- 8 Tags, 7 Triggers, 6 Variables
- Published: "Remove orphan Google Tag G-KWLEYMNW28"

### Tag Inventory Notes

- The orphan tag "Google Tag `G-KWLEYMNW28`" was deleted in Version 9. This was
  a duplicate GA4 config tag that would have caused double-firing. **Do not
  re-add it.**
- The active GA4 measurement ID (`G-33HFQC8STP`) is wired through the GTM
  container — **do not** add a separate hardcoded GA4 tag outside of GTM.

## Commercial Journey Events (September 2026)

Pushed to `window.dataLayer` by `pushJourneyEvent()` in `lib/analytics.ts`.
Like the lead events, they only reach GA4 once GTM is configured and consent
allows it; the push itself is harmless without either.

| Event | Fires when | `offer` | `pillar` |
| --- | --- | --- | --- |
| `journey_selected` | A homepage "What is getting in your way?" card is clicked (`TrackedLink`) | `null` | `services` / `technology` / `localization` |
| `offer_viewed` | An offer panel first scrolls into view, once per page view (`OfferViewTracker`) | `first-project` (homepage), `snapshot` (pillar first-step panel), `content-audit-tiers` (pillar pages, `/assessments`), `snapshot-sample` (`/content-audit/sample`) | the pillar page's key, else `null` |
| `enquiry_submitted` | Contact form or audit-request form sent successfully | contact: the `?offer=` value if it is a known topic, else `general`; audit form: `audit-request` | contact: the `?pillar=` value if known, else `null` |

Every event also carries `source_page` (the path). Values come from fixed
lists (`JOURNEY_OFFER`, the pillar keys); nothing the visitor typed and no
assessment answers are ever sent.

**GTM wiring (to do in the container UI, not yet configured):**

1. Data Layer Variables: `offer`, `pillar`, `source_page`.
2. Trigger: Custom Event, event name matches RegEx
   `^(journey_selected|offer_viewed|enquiry_submitted)$`.
3. Tag: GA4 Event, event name `{{Event}}`, parameters `offer`, `pillar`,
   `source_page`; fire on the trigger above. Respect the existing consent
   settings (same as the lead-event tag).
4. In GA4, register `offer` and `pillar` as event-scoped custom dimensions.
5. Verify in GTM Preview: scroll to "Your first project" on `/` and check
   one `offer_viewed` with `offer = first-project`.

Suggested reading of the data, with low traffic in mind: compare
`offer_viewed` to `enquiry_submitted` per offer and pillar over a month, and
review the enquiries themselves before drawing conclusions from small counts.



- **Collection:** ECM.dev Performance 2026 (published, best-practice 2026 setup)
- The "24frames Performance Dashboard" collection may still appear in the left
  nav — this is a legacy artefact. It is safe to delete if it reappears.

## Verification Checklist

After any GTM or analytics code change, verify the following on
https://ecm.dev:

```js
// Run in browser console:
window.dataLayer        // Should be an array with gtm.js, gtm.dom, gtm.load events
window.gtag             // Should be a function
window.google_tag_manager['GTM-M7DKTZKC']  // Should be a loaded GTM object
```

Network tab checks:

- `/gtm/js?id=GTM-M7DKTZKC` → HTTP 200
- No CSP violation errors in console

## Common Mistakes & Fixes

**Problem: GTM loads but no data appears in GA4.**
Check: Confirm the GA4 tag in GTM is using the correct measurement ID
(`G-33HFQC8STP`). Confirm consent defaults are set correctly before GTM loads.
Use GA4 DebugView (Realtime → DebugView) with `?gtm_debug=1` appended to the URL.

**Problem: GTM script not executing at all.**
Root cause (happened June 2026): `next/script` tag was inside a `"use client"`
component — silently ignored in App Router.
Fix: Move all `<Script>` tags to a Server Component (e.g. `layout.tsx`).

**Problem: Double-counting events in GA4.**
Check: Look for duplicate GA4 config tags in the GTM container. Only one GA4
configuration tag should exist.

**Problem: CSP blocking GTM or GA4 scripts.**
Check: Confirm the nonce is being passed to the GTM init `Script` tag. Confirm
proxy routes are returning 200. Confirm the CSP is set on **both** the request
and response headers in `middleware.ts` (see CSP & Nonce above).

## Known Issues

| Issue | Status | Notes |
| --- | --- | --- |
| GTM external `gtag/js` returning 503 | ⚠️ Monitor | Transient Google server error. Not actionable. Resolves on retry. |
| 24frames Performance Dashboard in GA4 nav | ⚠️ Monitor | Legacy artefact. Safe to delete if it reappears. |

---

_Last updated: June 2026_
