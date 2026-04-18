# Cookie Banner — Phase 2 Upgrade Spec

**Status:** Not started. Ship when convenient, separate PR.
**Blocks:** Nothing. GA4 + GTM are already live behind the existing banner (Phase 1 shipped 2026-04-18, commit `3418de7`).
**Estimated scope:** 1 medium PR. No breaking changes — the existing consent storage key and values remain compatible.

## Why this exists

The current `components/CookieConsent.tsx` banner is functional and blocks analytics until Accept is clicked. It passes the bar for "better than most sites," but has four gaps versus full UK GDPR / ICO guidance and Art. 7 requirements:

| Gap | GDPR reference | Current state |
|---|---|---|
| **No way to revoke consent** once granted | Art. 7(3) — withdrawal must be as easy as giving consent | Once user clicks Accept or Decline, banner never reappears and there is no UI to change their mind. |
| **Copy is vague about what cookies do and who processes them** | Recitals 32, 42 — consent must be "informed" | Current copy: "We use cookies to understand how visitors use our site." Does not name Google Analytics or Google LLC as the processor. |
| **No category granularity** | Art. 7 — consent must be "specific" | Single Accept/Decline toggle covers all analytics. ICO guidance (and most other EU DPAs) prefer per-purpose consent: necessary / analytics / marketing as separate toggles. |
| **No consent expiry** | ICO guidance — re-ask periodically, typical 6–12 months | Consent stored in `localStorage` forever. |

Tonight's Phase 1 ships analytics immediately and gets us the data. Phase 2 closes the compliance gaps without having to unship anything.

## Scope

### Must have (MVP Phase 2)

1. **Footer link to re-open the banner.** Text: "Cookie preferences". Clicking it wipes `localStorage["ecm-cookie-consent"]` back to undecided and re-renders the banner. Lives in `components/Footer.tsx`.

2. **Updated banner copy.** Explicitly names Google Analytics and links to Google's privacy notice. Suggested copy:

   > "We use Google Analytics to understand how visitors use our site. Analytics cookies are only set if you accept — you can change this any time from the footer."
   >
   > Links: [Privacy policy](/privacy) · [Google's privacy notice](https://policies.google.com/privacy)

3. **Consent expiry.** Store the consent decision as a JSON blob with a timestamp:
   ```ts
   { status: "accepted" | "declined", grantedAt: "2026-04-18T17:30:00Z", version: "2" }
   ```
   On mount, if `grantedAt` is older than 12 months, treat as undecided and re-show the banner. Bump the `version` field whenever copy materially changes (forces a re-prompt — same pattern used in `lib/consent.ts` for the assessment form).

4. **Privacy policy updates.** `app/privacy/page.tsx` must name Google Analytics + GTM, state retention period (GA4 default is 14 months for event data, 2 months for user data — or whatever's configured on the property), describe the legal basis (consent), and explain how to revoke. Coordinate with the banner copy so both agree on what processors are named.

### Should have

5. **Category checkboxes** (Necessary / Analytics). Keeps Necessary checked-and-disabled (no actual necessary cookies currently, but the category exists for future additions like CSRF or session). Analytics checkbox defaults to unchecked — user must opt in explicitly, not opt out. Backward-compatible migration: any `"accepted"` in the old format becomes `{ analytics: true }` in the new format.

   > Note: if you skip this and keep a binary Accept/Decline, that is still defensible for a site that only runs analytics — just be consistent in the copy ("accept analytics cookies" vs generic "accept cookies").

6. **"Decline" path must be equally prominent.** Current banner already does this (Decline is a visible button, not hidden under a dropdown). ICO specifically flags "Accept" buttons that are more visually prominent than "Decline". Review visual weight during the redesign pass.

### Nice to have

7. **Marketing category.** Only add if/when you start running Google Ads, Meta Pixel, LinkedIn Insight, etc. Not needed for analytics-only.

8. **Pre-consent "denied" dataLayer push.** If you later migrate to Consent Mode v2 (not recommended per tonight's discussion, but the option is open), this is the hook point. Out of scope for Phase 2 as currently defined.

9. **Telemetry on consent decisions.** Optional: capture anonymous counts of Accept vs Decline (you'd need a first-party collector — don't use GA4 for this, since the user hasn't consented yet). Useful to know your opt-in rate, but non-essential.

## Implementation sketch

### Data model migration

Old format (string literal):
```
"accepted" | "declined"
```

New format (JSON blob in same localStorage key):
```ts
type Consent = {
  status: "accepted" | "declined";
  categories: { necessary: true; analytics: boolean };
  grantedAt: string;  // ISO timestamp
  version: string;    // bump when copy materially changes
};
```

Migration logic in `components/CookieConsent.tsx` on mount:
- If value parses as JSON → use it.
- If value is the literal string `"accepted"` → treat as `{ status: "accepted", categories: { necessary: true, analytics: true }, grantedAt: <now>, version: "2" }`. Persist the migrated blob back to localStorage.
- If value is `"declined"` → same treatment with analytics: false.
- If absent or unparseable → undecided, show banner.

### Files touched

| File | Change |
|---|---|
| `components/CookieConsent.tsx` | New copy, JSON blob storage, optional categories UI, migration logic, listens for `ecm:consent-reopen` event |
| `components/Footer.tsx` | Add "Cookie preferences" button that dispatches `ecm:consent-reopen` and clears localStorage |
| `components/Analytics.tsx` | Read `.categories.analytics` from the JSON blob instead of string check. Listen for consent changes to re-evaluate (currently listens for `ecm:consent-granted` — extend to cover revocation too, which means *unloading* GA/GTM if user declines after having accepted). **Note:** unloading is hard — GA/GTM scripts can't be truly unloaded once running. Pragmatic approach: set `window['ga-disable-G-KWLEYMNW28'] = true` and clear GTM dataLayer, then require a page reload for a clean slate. Document this in the banner: "Changes take effect on next page reload." |
| `app/privacy/page.tsx` | Name GA4 + GTM, retention periods, legal basis (consent), revocation instructions |
| `lib/consent.ts` | Optionally extend with a `COOKIE_CONSENT_VERSION` constant and shared types, parallel to the existing `CONSENT_VERSION` for assessment-form consent |

### Testing checklist

- [ ] Fresh incognito → banner appears → Decline → reload → banner gone, no Google requests
- [ ] Fresh incognito → Accept (analytics only) → GTM + GA4 load
- [ ] After Accept → click footer "Cookie preferences" → banner re-appears → Decline → reload → GA disabled flag set, no new `collect` requests
- [ ] Existing user with `"accepted"` in localStorage → page load → migration fires, analytics still loads, new JSON blob persisted
- [ ] Existing user with `"declined"` in localStorage → migration fires, analytics stays disabled
- [ ] Banner version bump forces re-prompt even if user previously decided
- [ ] 12-month expiry re-prompts an old consent (can be tested by manually editing `grantedAt` to a date > 12 months ago in DevTools)
- [ ] Accessibility: banner is keyboard-navigable, buttons are focusable in sensible order, focus trap works while banner is open, `aria-live` announces banner appearance to screen readers
- [ ] Decline button is not visually de-emphasised relative to Accept

## Out of scope

- **Consent Mode v2 migration.** Decided against at Phase 1. Do not add during Phase 2 unless business requirements change (e.g. running Google Ads at volume, needing modelled conversions).
- **Server-side analytics / first-party event collector.** Worth considering long-term for privacy + ad-blocker resistance, but large enough to be its own initiative.
- **Cookie scanner / auditing tool.** The site currently sets no cookies beyond what GA4/GTM adds post-consent, so automated scanning is low-value right now.

## Decision log / things to revisit during implementation

- **Binary vs categorised toggle.** Recommend binary (Accept/Decline) for simplicity given you only run analytics. Revisit if/when you add marketing tags.
- **Consent expiry duration.** 12 months is a reasonable default for UK. EDPB non-binding guidance has floated 6 months for stricter jurisdictions. Pick 12 unless a client specifically asks otherwise.
- **Copy ownership.** Banner copy needs legal-adjacent review since it's the public-facing consent record. Flag to Russell before shipping.
