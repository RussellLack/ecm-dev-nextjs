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

### All Resend-based email silently failing — sending domain never DNS-verified (August 2026)

**Status:** ✅ Resolved — migrated off Resend entirely. `lib/postmark.server.ts`
(merged in the PR that added `app/api/assessment/feedback/route.ts`).

**Symptom:** Discovered while chasing a missing notification email for the new
assessment-feedback feature (see next entry), but the underlying cause affected
**every** email route on the site (`report`, `gate`, `tool-email`,
`cms-implementation/send`), not just the new one — leads were being captured
correctly, but no confirmation/notification email was ever delivered, silently.

**Root cause:** `GET https://api.resend.com/domains` showed the `ecm.dev`
sending domain in status `"failed"` — all three required DNS records (DKIM
TXT, SPF-related MX, SPF TXT) were unverified. The domain was added to Resend
on 2026-04-04 and never finished verification, so Resend had been rejecting
every send since project launch. There is no error surfaced to the visitor or
in normal logs — the API call each route made returned a shape that the old
code treated as fire-and-forget-ish success.

**Fix:** Migrated all five email send sites to
[Postmark](https://postmarkapp.com), whose `ecm.dev` domain **is** verified
(confirmed with a live self-send test to `rl@ecm.dev`). Added one shared
helper, `lib/postmark.server.ts` (`sendEmail()`), and replaced every raw
`fetch("https://api.resend.com/emails", ...)` call site with a call to it.
Behavior is preserved: `reason: "not_configured"` (missing
`POSTMARK_API_TOKEN`) still degrades gracefully in local/dev exactly like a
missing Resend key did; `reason: "send_failed"` now surfaces distinctly in
logs with the actual Postmark error code/message instead of being swallowed.

**Guardrail:** Resend is no longer used anywhere in this codebase (confirmed
via full-repo grep before and after the migration) — do not reintroduce it.
If email deliverability is ever in doubt again, check
`POSTMARK_API_TOKEN` is set in the Netlify environment and that
`https://api.postmarkapp.com/email` calls return `ErrorCode: 0`, rather than
assuming the send itself is the problem. If Resend is ever reactivated for
some reason, the `ecm.dev` DNS records still need adding first — ask Russell
before assuming this is still needed, since Postmark is now the production
email path.

### Assessment-feedback notification email delayed/unreliable — fire-and-forget on Netlify serverless (August 2026)

**Status:** ✅ Resolved — `app/api/assessment/feedback/route.ts`.

**Symptom:** After submitting feedback on the results page, the internal
notification email to `rl@ecm.dev` sometimes didn't arrive, or arrived several
minutes late.

**Root cause:** The route originally used `void sendInternalNotification(...)`
instead of `await`-ing it, so the HTTP response was sent back to the visitor
before the email send had actually completed. Netlify's serverless function
runtime can freeze the process as soon as a response is returned, so a
detached background promise has no guarantee of ever finishing — this exact
risk is already called out in a comment in `tool-email/route.ts` for its
Snov.io push, and `gate/route.ts`'s equivalent notification is correctly
`await`-ed. The feedback route was the one place that didn't follow the
codebase's own convention.

**Fix:** Changed to `await sendInternalNotification(...)` before returning the
response. `sendInternalNotification` only logs on failure and never throws, so
this can't turn a bad send into a failed feedback submission — the feedback
itself is already durably stored in Netlify Blobs by the time the email is
attempted.

**Guardrail:** Any new Netlify Function route that sends an email or does
other post-response work **must** `await` it, never fire-and-forget with
`void`. This is a recurring footgun specific to this hosting platform — code
review should flag any bare `void somethingAsync()` in an `app/api/**`
route.

### E2E suite flaky in CI — three separate causes layered on top of each other (August 2026)

**Status:** ✅ Resolved.

**Symptom:** The assessment e2e Playwright suite (`.github/workflows/assessment-e2e.yml`,
gates every PR merge) failed intermittently against fresh Netlify deploy
previews, with no consistent pattern — sometimes passing, sometimes failing on
navigation timeout, sometimes failing before navigation even started.

**Root cause (three distinct issues, found sequentially with real evidence
from CI runs — not guessed):**

1. Netlify serverless functions cold-start slower than Playwright's default
   ~30s navigation timeout, so the very first hit to a route in a fresh
   preview could time out before the function ever finished spinning up.
2. Separately, `warmTarget()`'s own warm-up fetch could itself throw a
   connection-level "fetch failed" error in the seconds right after a fresh
   deploy goes live — not a slow response, an outright connection failure — so
   a single warm-up attempt wasn't enough.
3. Even a fixed 3-attempt retry with a 3s delay wasn't always enough — one CI
   run captured a 48.6s cold start that a fixed attempt cap couldn't absorb no
   matter the per-attempt delay.

**Fix:**
- Warm every discovered route once before the real test run, absorbing cold
  starts up front instead of on the first real navigation.
- `tests/e2e/helpers/targets.ts`'s `warmTarget()` retries on both HTTP
  failures and thrown fetch errors, using a **deadline** (`WARM_UP_DEADLINE_MS
  = 120_000`) rather than a fixed attempt count, so it keeps retrying (every
  `WARM_UP_RETRY_DELAY_MS = 3_000`, each attempt capped at
  `WARM_UP_PER_ATTEMPT_TIMEOUT_MS = 30_000`) for as long as a cold start
  plausibly takes.
- Widened downstream timeouts to match: `page.goto()` timeout raised to 60s in
  both spec files; `test.setTimeout()` raised to `Math.max(60_000, targets.length
  * 75_000)` in the smoke spec and a flat 120s in the full spec.

**Misdiagnosis considered but not needed:** A `workers: process.env.CI ? 1 :
undefined` change in `playwright.config.ts` was tried on the hypothesis that
concurrent test workers were competing for the same scaling function
instance. The deadline-based retry fix alone proved sufficient in CI, so this
was reverted (the PR was closed unmerged) rather than kept as unnecessary
complexity.

**Guardrail:** When warming or polling a Netlify deploy preview, always retry
on a time deadline, not a fixed attempt count — cold-start latency is
variable and a fixed cap will eventually be too short. Don't add
worker-concurrency limits speculatively; prove the simpler fix insufficient
first.

## Open — Monitor list

| Issue | Status | Notes |
| --- | --- | --- |
| GTM external `gtag/js` returning 503 | ⚠️ Monitor | Transient Google server error. Not actionable. Resolves on retry. Mitigated by the `/gtm/*` proxy in `next.config.mjs`. |
| 24frames Performance Dashboard in GA4 nav | ⚠️ Monitor | Legacy artefact in the GA4 left nav. Safe to delete if it reappears. |

---

_Last updated: August 2026_
