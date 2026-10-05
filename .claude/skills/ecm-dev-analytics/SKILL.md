---
name: ecm-dev-analytics
description: How ecm.dev measures visitors with Google Tag Manager (GTM-M7DKTZKC) and GA4 (G-5B9Q2WHCNL), and how to change it with the least manual work for Russell. Use whenever a task touches ecm.dev tracking, such as adding or renaming a dataLayer event, wiring a new tag, trigger or variable in GTM, creating GA4 custom dimensions or key events, checking whether events arrive (Tag Assistant, DebugView, Realtime), consent or cookie-banner behaviour, the CSP or /gtm proxy, or "Tag Assistant could not connect", even if the user just says "is tracking working", "set up the analytics", "measure this CTA" or "why is GA4 empty". Not for building charts from GA4 data or for other sites' analytics.
---

# ecm.dev analytics (GTM + GA4)

`ANALYTICS.md` in the `ecm-dev-nextjs` repo is the source of truth for IDs, the
event catalogue and the container's current version. Read it first; this skill
tells you how to act on it and what went wrong the last time.

## The one principle: minimise Russell's clicking

Russell has said plainly that step-by-step UI instructions are "way too much
manual work". No GTM or GA4 connector exists, and a cloud container usually
cannot reach Google or ecm.dev at all, so you rarely get to do the GTM part
yourself. Compensate by shrinking what he must do:

1. **GTM changes ship as an import file, never as a click list.** Write a spec
   and run `scripts/build_gtm_import.py spec.json out.json` (a worked spec is in
   `assets/commercial-journey.spec.json`). Send the file with SendUserFile. His
   part becomes: Admin, Import Container, Merge, **Rename conflicting** (so
   nothing existing changes), Confirm, Publish. The import preview lets him
   check the counts before anything is saved.
2. **Check your own access before promising anything.** Look for Claude in
   Chrome or computer-use tools (they could do the GTM clicks in his signed-in
   browser) and for a Supermetrics connector (it can read GA4, so you can
   verify events yourself). Say which you have in one line; do not make him
   discover it.
3. **Code changes go through the normal PR flow** (see "Security-sensitive
   code" below for the exception).
4. What cannot be automated today, say once and plainly: GA4 custom dimensions
   (Admin, Custom definitions) and the final Publish.

## How tracking is wired (so you change the right file)

- **Loader:** `app/layout.tsx`, a nonced inline script that sets consent
  defaults and loads `gtm.js` through the first-party proxy `/gtm/js`
  (rewrites in `next.config.mjs`). When the URL carries `gtm_debug`
  (Tag Assistant), it loads straight from `www.googletagmanager.com` instead,
  because Google rejects debug requests relayed from Netlify.
- **CSP:** per-request, in `middleware.ts`, with a nonce and `'strict-dynamic'`,
  set on both request and response (response-only breaks React hydration).
- **Consent:** `localStorage` key `ecm-cookie-consent`. Analytics storage is
  **granted by default** and denied only when the visitor clicks Decline; ad
  storage is granted only on Accept. So testing never requires declining, and
  ignoring the banner still sends analytics. `components/Analytics.tsx` is a
  consent bridge only; `next/script` inside a client component silently never
  runs.
- **Events:** pushed from `lib/analytics.ts`. Three families, each with its own
  GTM tag:
  - lead events (`qualify_lead`, `lead_submit`, `close_convert_lead`) via
    `pushLeadEvent`, tag "GA4 - assessment funnel events"
  - gate events (`assessment_preview`, `gate_view`, `gate_register`)
  - commercial journey events (`journey_selected`, `offer_viewed`,
    `enquiry_submitted`) via `pushJourneyEvent`, tag
    "GA4 - commercial journey events", params `offer`, `pillar`, `source_page`
- **Never** add a second GA4 config tag or hardcode a measurement ID in app
  code; GA4 is configured only inside the container.

## Adding a new event

1. Add the name to the right union type in `lib/analytics.ts` and any values to
   a fixed constant list. Values come from fixed lists only: no typed text, no
   assessment answers, nothing personal.
2. Fire it with the existing helpers (`TrackedLink`, `OfferViewTracker`, or the
   push function). `OfferViewTracker` fires once per page view.
3. Extend the Playwright e2e test that asserts dataLayer pushes; run
   `npx tsc --noEmit -p .` and the e2e before pushing.
4. Update the event table in `ANALYTICS.md`.
5. Container side: if the event joins an existing family, the only change is
   the trigger regex; otherwise generate an import file for a new variable set,
   trigger and tag.
6. GA4 side: a custom dimension per new parameter, event scope, created **the
   same day** it goes live (they do not backfill). Mark something as a key
   event only if nothing else already counts that conversion:
   `enquiry_submitted` must stay unmarked because `close_convert_lead`
   already counts every enquiry.

## Verifying (cheapest first)

1. **dataLayer:** in the site's console, `dataLayer.filter(e => e.event === "offer_viewed")`.
   Proves the site side, independent of GTM.
2. **Tag Assistant Preview:** tests unpublished workspace changes. Click the
   event, check Tags Fired and the Variables tab.
3. **GA4 DebugView:** shows Preview-session hits within seconds.
4. **GA4 Realtime:** only a *published* container feeds it; parameter values
   show when you click an event name.
5. **Standard reports / explorations:** 24 to 48 hours, and custom dimensions
   only from the day they were created.

Preview is a safety net, not a requirement. For a small, additive change
(one tag on one trigger), publishing and checking Realtime is acceptable; a
bad version is one click to roll back in GTM, Versions.

If Tag Assistant reports "Could not connect" or a timeout, read
`references/tag-assistant.md` before touching code; it lists the causes in the
order to rule them out.

## Security-sensitive code

Changes that loosen the CSP or the Cross-Origin-Opener-Policy header are
flagged by Claude Code's auto-mode safety check as weakening security, and a
chat "allow it" does not override that. Before starting such a change, tell
Russell in one line that it will need either a permission rule (`/permissions`,
allow `Bash(git commit:*)` and `Bash(git push:*)`) or edits he makes in
GitHub's web editor, and let him pick. If he picks the editor, give exact
find-and-replace blocks per file, not a patch.

## After any change

Update `ANALYTICS.md`: event table, "GTM Container, Current State" version
number and summary, and anything learned in "Common Mistakes & Fixes". Keep
UK English and no em or en dashes, per Russell's house style.
