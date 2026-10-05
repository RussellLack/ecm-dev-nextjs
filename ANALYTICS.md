# ANALYTICS.md — ECM.DEV Analytics & Tag Management

## Accounts & IDs

| Service | Account / Property | ID |
| --- | --- | --- |
| GA4 Property | ecm.dev [main site] | `p532585628` |
| GA4 Account | ECM Agency | — |
| GTM Account | ECM.DEV | `6350600794` |
| GTM Container | ECM.DEV | `GTM-M7DKTZKC` |
| GTM Current Version | Published 5 October 2026: `solution` parameter on the commercial journey tag (previous: Version 15, commercial journey events, 27 September) | — |
| Google Account | — | `authuser=2` |
| Active GA4 Measurement ID | fired from inside GTM container | `G-5B9Q2WHCNL` |

> The active measurement ID is `G-5B9Q2WHCNL`, the stream that replaced
> `G-33HFQC8STP`. Per the `components/Analytics.tsx` header comment,
> `G-33HFQC8STP` broke after a delete and recreate (gtag/js returns 404) and
> must not be used again. The ID is configured **inside** the GTM container:
> never hardcode a second GA4 config tag in app code.

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
  → GTM fires GA4 tag → GA4 property p532585628 (G-5B9Q2WHCNL)
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

### State at Version 9 (the current version is 15; see the table above)

- 8 Tags, 7 Triggers, 6 Variables
- Published: "Remove orphan Google Tag G-KWLEYMNW28"

### Tag Inventory Notes

- The orphan tag "Google Tag `G-KWLEYMNW28`" was deleted in Version 9. This was
  a duplicate GA4 config tag that would have caused double-firing. **Do not
  re-add it.**
- The active GA4 measurement ID (`G-5B9Q2WHCNL`) is wired through the GTM
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

Every event also carries `source_page` (the path) and `solution`. Values
come from fixed lists (`JOURNEY_OFFER`, the pillar keys, the
`SOLUTION_CONTEXT` keys in `lib/offers.ts`); nothing the visitor typed and no
assessment answers are ever sent.

### `solution` parameter (October 2026)

Added with the workflow-led solution pages (`/solutions/<slug>`, see
`docs/SOLUTION-PAGES-2026-10-05.md`). It is `null` everywhere except:

| Event | When `solution` is set |
| --- | --- |
| `offer_viewed` | The "A bounded first project" panel on a solution page scrolls into view: `offer = first-project`, `solution = <slug>` |
| `enquiry_submitted` | The contact form was reached from a solution page CTA (`/contact?offer=first-project&solution=<slug>`) |

Values: `export-manufacturers`, `engineering-consultancies`,
`saas-industrial-tech`, `maritime-suppliers`, `pe-backed-companies`,
`professional-services`, `multilingual-industrial-teams`.

**GTM: done, published 5 October 2026.** Imported `gtm-import-commercial-journey-solution.json`
(built with `.claude/skills/ecm-dev-analytics/scripts/build_gtm_import.py`
from the commercial-journey spec plus `DLV - solution`). Admin, Import
Container, Merge, **Overwrite conflicting**: this import is meant to change
the existing `GA4 - commercial journey events` tag, so "Rename conflicting"
would create a second tag and double-count every journey event. The preview
should show one variable added and the tag modified, with the measurement ID
still `G-5B9Q2WHCNL`. **GA4 (to do):** register `Solution` from `solution`
as an Event-scoped custom dimension (Admin, Custom definitions). Dimensions
do not backfill, so `solution` values collected before it exists will not
appear in reports. To check the tag: on `/solutions/<slug>`, scroll to "A
bounded first project" and confirm `offer_viewed` with `solution` in GA4
Realtime (click the event name to see parameter values).

### GTM and GA4 setup (to do in the container UI; not yet configured)

About 10 minutes. Mirrors the existing "GA4 - assessment funnel events"
setup: same GA4 property (`G-5B9Q2WHCNL`), same consent handling. The events
only fire on the live site once the deploy containing #99 is live.

**1. Variables** (Variables → User-Defined Variables → New → Data Layer Variable, Version 2)

| Variable name | Data Layer Variable Name |
| --- | --- |
| `DLV - offer` | `offer` |
| `DLV - pillar` | `pillar` |
| `DLV - source_page` | `source_page` |

The lead events already send `source_page`; reuse an existing variable for it
if one exists. Confirm the built-in **Event** variable is enabled
(Variables → Built-In Variables → Configure).

**2. Trigger** (Triggers → New → Custom Event)

- Name: `CE - commercial journey`
- Event name: `^(journey_selected|offer_viewed|enquiry_submitted)$`
- Tick "Use regex matching"; fires on All Custom Events.

**3. Tag** (Tags → New → Google Analytics: GA4 Event)

- Name: `GA4 - commercial journey events`
- Measurement ID: `G-5B9Q2WHCNL`, or the existing Google tag, matching the
  lead-event tag.
- Event Name: `{{Event}}`
- Event Parameters: `offer` = `{{DLV - offer}}`, `pillar` = `{{DLV - pillar}}`,
  `source_page` = `{{DLV - source_page}}`
- Consent: same as `GA4 - gate + preview events` (built-in checks, additional consent "Not set").
- Triggering: `CE - commercial journey`

**4. Test in Preview** on `https://ecm.dev`, after accepting cookies:

1. Scroll to "Your first project" on `/`: one `offer_viewed`, `offer = first-project`; scrolling past again does not fire it twice.
2. Click "Localisation costs keep growing": `journey_selected`, `pillar = localization`.
3. On that pillar page, scroll to "Where to start": `offer_viewed`, `offer = snapshot`, `pillar = localization`.
4. Optional, and doubles as the real-form test: send an enquiry from `/contact?offer=snapshot&pillar=services`: `enquiry_submitted`, `offer = snapshot`, `pillar = services`.

Each time, "GA4 - commercial journey events" should appear under Tags Fired
with all three parameters filled.

**5. Publish.** Went live as container version 15.

**6. GA4 custom dimensions** (Admin → Data display → Custom definitions →
Create custom dimension, scope Event): `Offer` from `offer`, `Pillar` from
`pillar`. Add `source_page` only if not already registered. Create them the
day you publish: custom dimensions do not backfill.

**7. Verify** in GA4 DebugView with Preview open; standard reports take 24 to
48 hours.

**Do not mark `enquiry_submitted` as a key event.** The same submissions
already fire `close_convert_lead`, which is the conversion; marking both would
double-count every enquiry. Use `enquiry_submitted` for its offer and pillar
breakdown.

First report worth building: a free-form exploration with Event name and
Offer as rows, filtered to `offer_viewed` and `enquiry_submitted`, which shows
per offer how many saw it and how many then enquired.

Suggested reading of the data, with low traffic in mind: compare
`offer_viewed` to `enquiry_submitted` per offer and pillar over a month, and
review the enquiries themselves before drawing conclusions from small counts.



- **Collection:** ECM.dev Performance 2026 (published, best-practice 2026 setup)
- The "24frames Performance Dashboard" collection may still appear in the left
  nav — this is a legacy artefact. It is safe to delete if it reappears.

## Lead Events Behind Bot Verification (October 2026)

GA4 showed most key events coming from US data-centre sessions that ran
JavaScript and finished an assessment in about 2 seconds, plus the site's own
E2E suite (source `e2e`). Two changes followed. The GTM container and GA4
property were not touched: event names and parameters are unchanged.

**`qualify_lead` waits for the server.** The lead magnet and process
assessments show their result immediately, then call `POST /api/assessment/verify`
(`lib/assessment/useLeadVerification.ts`). `qualify_lead` is pushed only when
it answers `qualified: true`. The route checks, in order:

1. Honeypot: the off-screen `website` field must be empty.
2. Minimum time: at least 8 seconds since the assessment first rendered.
3. Cloudflare Turnstile: the invisible widget's token must verify.

It always answers HTTP 200 so bots get no signal, and a Cloudflare outage
counts the completion as unqualified rather than showing an error. Needs
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Netlify;
without them nothing qualifies, so `qualify_lead` stops firing.
Deploy previews use Cloudflare's test keys: the always-pass site key with
the always-fail secret (the always-pass secret accepts any token, which
breaks the e2e invalid-token test).

Unchanged: funnel and gate events (`gate_view`, `gate_register`,
`assessment_preview`), and the lead events that already followed a server
check (`lead_submit` after the PDF email, `close_convert_lead` and
`enquiry_submitted` after the contact or audit-request form).

**E2E tests send nothing to GA4.** Every spec imports `test` from
`tests/e2e/fixtures.ts`, which aborts requests to Google Analytics, Tag
Manager and the first-party `/gtm/` proxy. The suite targets a local server
by default; production only via `E2E_BASE_URL` (the scheduled monitor).

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
(`G-5B9Q2WHCNL`, not the retired `G-33HFQC8STP`). Confirm consent defaults
are set correctly before GTM loads.
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

**Problem: `qualify_lead` stopped appearing in GA4 after the bot check shipped.**
Check: both Turnstile keys are set in Netlify for the production context and
the ecm.dev hostname is on the Cloudflare widget. Netlify function logs show
`Assessment verify rejected: <reason>` or `Assessment verify: no_secret` /
`turnstile_unreachable` for every refused completion.

**Problem: source `e2e` or data-centre sessions in GA4 again.**
Check: a spec imports from `@playwright/test` instead of `./fixtures`, or a
spec opens `browser.newContext()` directly instead of the `newContext`
fixture, so the analytics block is skipped.

## Known Issues

| Issue | Status | Notes |
| --- | --- | --- |
| GTM external `gtag/js` returning 503 | ⚠️ Monitor | Transient Google server error. Not actionable. Resolves on retry. |
| 24frames Performance Dashboard in GA4 nav | ⚠️ Monitor | Legacy artefact. Safe to delete if it reappears. |

---

_Last updated: October 2026_
