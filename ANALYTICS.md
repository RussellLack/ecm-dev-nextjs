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

## GA4 Dashboard

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

## Assessment funnel events

The five assessment tools push funnel events to `window.dataLayer` via the
shared helper `lib/analytics/track.ts`. **These are dataLayer pushes, not
`gtag('event', …)` calls** — GA4 lives inside the GTM container and does not
forward gtag events, so GTM keys off the `event` field of each dataLayer object.
No new inline scripts or `next/script` tags are added; all calls are plain
bundled JS inside existing `"use client"` components (CSP-safe).

### `tool_name` values

| Tool | `tool_name` | Component |
| --- | --- | --- |
| Process assessment | `process` | `components/assessment/ProcessAssessment.tsx` |
| Lead magnet | `lead_magnet` | `components/assessment/LeadMagnetAssessment.tsx` |
| Localisation cost estimator | `localisation_cost` | `components/estimator/EstimatorClient.tsx` |
| CMS implementation estimator | `cms_implementation` | `components/assessment/cms-implementation/Client.tsx` |
| Sanity-driven assessments | `content_ops_maturity` (derived from `assessment.slug.current`, `-` → `_`) | `components/assessment/AssessmentShell.tsx` |

### The 6 events

| `event` | When it fires | Params |
| --- | --- | --- |
| `assessment_start` | Once per session, at first meaningful interaction (Start click / first input) | `tool_name`, `source_page` (`document.referrer` or `"direct"` when not supplied) |
| `assessment_step_complete` | When the user advances past a step / section / question / input-group milestone | `tool_name`, `step_number` (1-based index of the step just completed), `total_steps`, plus any tool-specific `extra` |
| `assessment_complete` | Once, when the results/summary view is reached or submission succeeds | `tool_name`, `completion_time_seconds` (omitted when unknown) |
| `qualify_lead` | Immediately after `assessment_complete` (same helper call) | `tool_name` |
| `lead_submit` | On successful email submit / PDF request / save-results / share-link copy | `tool_name`, `lead_type` (`email_gate` \| `save_results` \| `share_link` \| `pdf`) |
| `close_convert_lead` | Immediately after `lead_submit` (same helper call) | `tool_name` |

### Required GTM setup

For **each** of the six event names above, create in the GTM container
(`GTM-M7DKTZKC`):

1. A **Custom Event** trigger whose "Event name" matches the `event` string
   exactly (e.g. `assessment_step_complete`).
2. A **GA4 Event** tag that fires on that trigger, sends to the in-container GA4
   config (measurement ID `G-33HFQC8STP`), uses the same event name, and maps
   the dataLayer params to GA4 event parameters. Create matching Data Layer
   Variables for `tool_name`, `source_page`, `step_number`, `total_steps`,
   `completion_time_seconds`, and `lead_type`, and pass them through as event
   parameters.

Register **`qualify_lead`** and **`close_convert_lead`** as GA4 **Key Events**
(Admin → Events → Key events) so they can be used as conversions.

Do **not** add a second GA4 config tag or load `gtag.js` — the config already
lives in the container (see the top of this file).

### DebugView QA

Append `?gtm_debug=1` to any assessment URL to open GTM Preview / GA4 DebugView.
Walk a tool end to end and confirm the events arrive in order:
`assessment_start` → one `assessment_step_complete` per advance →
`assessment_complete` immediately followed by `qualify_lead` → (on a lead
action) `lead_submit` immediately followed by `close_convert_lead`. Verify the
`tool_name` and other params are present on each hit.
