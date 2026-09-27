# Commercial Journey: First Release

Status: implemented and merged to `main` on 27 September 2026 across PRs #93 to #101
(see section 0 for the release log and section 9 for what is left).
Source brief: *ECM.dev Commercial Architecture Review, September 2026*.
## 0. Release log, 27 September 2026

All PRs were merged into `main` (auto-deployed by Netlify) only after every check
passed, including the Playwright e2e suite. #101 is the last; confirm it merged.

| PR | What it shipped |
|---|---|
| RussellLack/ecm-dev-nextjs#93 | First release of the commercial journey: `lib/offers.ts` source of truth, homepage restructure ("Your first project", problem-led starting points, shorter hero straight to the ungated tool), pillar `FirstStepPanel`, contextual contact form, consent-aware sticky CTA, consistency fixes. Also extended the free audit offer to 31 October. |
| RussellLack/ecm-dev-nextjs#94 | Removed the temporary Operations title pin once Sanity was corrected. |
| RussellLack/ecm-dev-nextjs#95 | Sample Snapshot report at `/content-audit/sample`; Snapshot sample tie-break; item definition and 50-item minimum ("What counts as an item?" under the audit tiers). |
| RussellLack/ecm-dev-nextjs#96 | `/assessments` grouped by commitment type; CTA buttons aligned on the homepage and pillar panels; homepage ticker replaced by a single "field note". |
| RussellLack/ecm-dev-nextjs#97 | Field notes moved into Sanity (`homePage.fieldNotes`), with a code fallback. |
| RussellLack/ecm-dev-nextjs#98 | "Selected work" proof line under the hero: four documented case studies, count from Sanity. |
| RussellLack/ecm-dev-nextjs#99 | Commercial journey analytics events; rewritten homepage "Why not hire, or share it out?" section; this document update. |
| RussellLack/ecm-dev-nextjs#100 | Records the problem and solution page tool mapping (a Sanity change, below); retires "Cold outbound isn't converting" with a permanent redirect from `/problems/outbound-conversion` to `/problems`. |
| RussellLack/ecm-dev-nextjs#101 | Cover illustrations for self-assessment cards (previously a bare "ECM" placeholder), on pillar pages, results pages and related-content cards. |

**Sanity changes made directly (project `0dep7ult`, dataset `production`, all published):**

- `service-services.seo.metaTitle` set to "Content Operations & Governance Consulting | ECM.DEV" (was "Content Services...").
- Maturity assessment (`DoFxt9hc4cRN1iDurUoG3v`) intro text now says "content operations maturity" (was "content infrastructure maturity"). `estimatedMinutes` confirmed as 5.
- `homePage.fieldNotes` seeded with the nine field notes.
- All six `problemPage` and five `solutionPage` documents: `diagnosticUrl` now points at one named tool instead of `/assessments`, and `diagnosticLabel` uses that tool's real name (the old labels promised diagnostics that do not exist, such as a "CMS value assessment"). Mapping: AI, silos, marketing operating system and AI content preparation to the Content Operations Maturity Assessment; marketing speed and campaign velocity to the Process Assessment; CMS value and CMS ROI to the CMS Implementation Cost Estimator; localisation and global marketing to the Localisation Cost Estimator; cold outbound to the Lead Magnet Ideation Tool. Duration badges now show, via `toolDurationFor()`.
- Checked, no change needed: `homePage.tickerPhrases` never contained the "fixed-price build" line, and the site never read that field.

This file does four jobs. It records the current-state inventory, lists the commercial
decisions only Russell can make, maps what changed page by page, and serves as the
verification record. Anything marked **OPEN** has been kept out of public copy.

## 1. Current-state inventory and discrepancies

Read directly from the repository (not the cached search index the brief warns about).

| # | Discrepancy found | Where | Status |
|---|---|---|---|
| D1 | Hero promised "no email gate on the result" but linked to `/assessments`, where three of four tools register an email first. Only `content-operations-maturity` is ungated (now `UNGATED_ASSESSMENT_SLUGS` in `lib/offers.ts`). | `app/page.tsx` | **Fixed.** The hero names the one ungated tool and links straight to it. |
| D2 | First step called "free assessment" (hero), "fixed scope, fixed price" diagnostic (How it works) and a free expert audit (promotion) on one page. | `app/page.tsx` | **Fixed.** Replaced by a "Your first project" section that shows free self-check, Content Audit Snapshot and ongoing work side by side, with you get / commitment / fee / boundary for each. |
| D3 | The Operations card said "Starts with a governance assessment". No such offer exists. | `app/page.tsx` | **Fixed.** Cards now name only real starting points. |
| D4 | "Diagnostic cost credits toward a managed package if you sign within the window." The window has never been defined (open item in `CONTENT-PILLARS-POSITIONING.md`). | `app/page.tsx` | **Removed pending decision** (see O2). The defined Snapshot to Full Estate Audit credit (30 days) is kept. |
| D5 | Capacity: "five at a time" on the homepage and "the first five" on pillar pages. | `ContentAuditTiers.tsx` | **Fixed.** Both read `AUDIT_OFFER_COPY.capacity` ("five at a time"). |
| D6 | Maturity tool: the homepage sticky bar said "Assess your content infrastructure · 10 min". The tool is named Content Operations Maturity Assessment and seeded at 5 minutes. | `app/page.tsx` | **Fixed.** |
| D7 | Problem and solution pages showed a hard-coded "10 min" and "about ten minutes" whatever tool the CMS linked to. | `ProblemPage.tsx`, `SolutionPage.tsx` | **Fixed.** Duration comes from `toolDurationFor()`. It is hidden when the link isn't a known tool. |
| D8 | Pillar pages reached the only priced offer after the full capability catalogue. Operations also put ten explainers before pricing. | `app/content-*/page.tsx` | **Fixed.** A first-step panel follows the symptoms. Operations explainers now sit after pricing. |
| D9 | The Operations browser title still read "Content Services" (a stale Sanity `seo.metaTitle`). | Sanity `service-services` | **Fixed in Sanity** (27 September): now "Content Operations & Governance Consulting \| ECM.DEV". The temporary code pin (`forceTitle`) has been removed. |
| D10 | Contact form ignored the `?service=` context that pillar pages already sent. It had no "what happens next" copy, and a failed send gave no fallback route. | `ContactForm.tsx` | **Fixed.** See section 3. |
| D11 | The mobile sticky CTA and the cookie banner were both fixed to the bottom on first visit. | `app/page.tsx` | **Fixed.** The sticky bar appears only once consent is answered. |
| D12 | The ticker fallback said "A fixed-price build, then a monthly retained service". No fixed-price build offer is published. | `app/page.tsx` | **Resolved.** The ticker was later replaced by field notes (#96, #97). The homepage query never read `tickerPhrases`, so only the code fallback had ever been shown; that field is now hidden in the Studio. |
| D13 | The `/assessments` hub durations were literals that could drift from the tools. | `app/assessments/page.tsx` | **Fixed.** They read `TOOLS`. The featured card reads `estimatedMinutes` from Sanity, confirmed as 5. |

Also confirmed: the `/content-services` redirect to `/content-operations` exists (`next.config.mjs`, permanent). No URLs were changed in this release, so no redirects are needed.

## 2. Commercial terms that need Russell's decision

None of these appear in public copy until decided.

| # | Decision | Why it matters | Current handling |
|---|---|---|---|
| **O1** | Free audit promotion: **extended to 31 October** (decided 27 September). Still open: is the free audit Snapshot depth, a different scope, or a choice? | `lib/auditOffer.ts` switches the homepage strip and tier banner to paid framing at 00:00 UTC on 1 November, within an hour because of ISR. | Depth is not stated anywhere. To change the date again, edit `AUDIT_OFFER_ENDS` and `AUDIT_OFFER_COPY.deadlineLabel`. |
| **O2** | Does a diagnostic credit toward ongoing work? If so: which diagnostic, what percentage, what window? | It was published with an undefined window. | Removed. It can go back as a field in `lib/offers.ts` once defined. |
| **O3** | Standalone trial project or pilot: offered or not? | The brief recommends one. `CONTENT-PILLARS-POSITIONING.md` says one-offs are sold only inside a managed relationship, so the two conflict. | Not offered. The third homepage column says "Fixing it, together" with a separately agreed scope, and implies no pilot product. |
| **O4** | Does the Snapshot need pillar-specific framing (governance, CMS, localisation) or stay one AI-oriented audit? | Its outputs include "failing in an AI answer", which reads naturally for AI readiness but less so for localisation cost. | Kept as one offer. Each pillar page frames the buyer's question above it but adds no scope. |
| **O5** | What does "up to 100 items or 10% of the estate" mean in practice? | Scope clarity at the point of purchase. | **Decided 27 September.** Sample = 10% of the estate, minimum 50, maximum 100 (all items if fewer than 50). "Item" defined in `CONTENT_AUDIT.itemDefinition` and published as "What counts as an item?" under the audit tiers. |
| **O6** | Response time for the contact form. | The audit form promises "within one business day". The contact form promises only a personal reply. | Only the personal reply is stated. Add a time once it is supported operationally. |
| **O7** | Managed package pricing and structure for all three pillars. | Open in `CONTENT-PILLARS-POSITIONING.md`. | Described as "quoted against the agreed scope". |
| **O8** | A sample Snapshot output. | The brief treats this as core proof of deliverable quality. | **Built:** `/content-audit/sample`, an illustrative report for a fictional company, labelled synthetic at the top, on the report and at the close. Linked from the homepage Snapshot card, every pillar first-step panel and the audit tiers. Russell to review the fictional findings for realism against real delivery. |

## 3. Page-by-page change map

| Page / component | Change |
|---|---|
| `lib/offers.ts` (new) | Single source of truth covering tool names, durations, gating and result descriptions, Content Audit tiers, credit, promotion copy, enquiry topics and each pillar's first step. |
| Homepage `app/page.tsx` | Shorter hero with one primary action (the free maturity assessment, 5 min), a secondary "See the work" button, and text links to other tools and to "Discuss a first project". Then problem-led starting points (pillar as eyebrow, AI readiness as a cross-pillar link, not a fourth card). Then **Your first project** (three commitment levels) plus a four-step "How it works". Then the "Your CMS is not broken" framing (moved, not removed). Then featured work, the expert-led audit promotion (now labelled expert-led and distinct from the self-check), insights, why ECM.DEV and contact. |
| Pillar pages `app/content-{operations,technology,localization}` | New `FirstStepPanel` after the symptoms, showing the pillar's free self-check next to the Content Audit Snapshot with scope, output, fee and what happens afterwards. Operations explainers moved below pricing. |
| `ContentAuditTiers.tsx` | Reads `lib/offers.ts`. Now has an `#content-audit` anchor, states that implementation is excluded, and uses "Discuss a Snapshot" / "Discuss a Full Estate Audit" CTAs that carry offer and pillar context. |
| `ContactForm.tsx`, `/api/contact`, `public/__forms.html` | Reads `?offer=` and `?pillar=` against fixed lists, plus the older `?service=` / `?topic=` (length-capped). Shows the context as a visible, clearable "About:" line. Submits it as `enquiryContext`. Adds "What happens next" steps and a mailing-list disclaimer. Success is confirmed via `role=status`. On error, input is kept, `role=alert` is set and `rl@ecm.dev` is offered as a fallback. |
| `MobileStickyCta.tsx` (new) | Homepage sticky bar, shown only after the cookie choice. |
| `ProblemPage.tsx`, `SolutionPage.tsx`, `app/assessments/page.tsx` | Durations come from `lib/offers.ts`. |
| `/content-audit/sample` (new, #95) | Illustrative Snapshot report for a fictional company (Calder & Finch Instruments), labelled synthetic three times. In the sitemap; bare `/content-audit` redirects (temporarily) to `/content-technology#content-audit`. |
| `CONTENT_AUDIT.itemDefinition` (#95) | "What counts as an item?" disclosure under the audit tiers; sample rule shown on tiers and first-step panels. |
| `/assessments` (#96) | Three groups with jump links: free with no email, free with an email to open, expert-led fixed fee. Badges read `UNGATED_ASSESSMENT_SLUGS` (moved to `lib/offers.ts`, also used by the email gate). One `ToolCard` replaces five duplicated blocks; share-link anchors unchanged. |
| CTA alignment (#96) | Homepage first-project cards and `FirstStepPanel` reserve equal link rows and equal button heights, so primary buttons line up (measured at 768 to 1600px). |
| Field notes (#96, #97) | `components/FieldNote.tsx` replaces the ticker: one still note at a time, "Another note" button, aria-live only after a request. Content in Sanity `homePage.fieldNotes` (Studio validation rejects dashes and external links); `lib/fieldNotes.ts` is the fallback. |
| Proof line (#98) | "Selected work" under the hero: Nordic retail procurement (the one delivered through ECM.DEV) first, then maritime platform, paints and coatings product finding, seafood localisation. Clients by type, attribution note, "See all N case studies" from the existing homepage query. |
| "Why" section (#99) | Heading "Why not hire, or share it out?"; body shows the cost of each option; ends on "a system your own team can run" and "evidence you could put in front of your board". |
| Analytics (#99) | See section 6. |
| Assessment illustrations (#101) | New `components/assessments/AssessmentIllustration.tsx`: one line motif per tool in the house illustration style (280x144, ECM green, lime accent), showing what each tool does: six-axis radar (maturity), a flow with a blocked step (process), three ranked cards (lead magnet), stacked cost layers with hidden ones dashed (localisation), a multi-year cost band (CMS); a questionnaire motif for any new assessment. Used as the card cover in `PillarClusters`, `AssessmentNextSteps` and `MixedRelated`. |
| Retired route (#100) | `/problems/outbound-conversion` redirects permanently to `/problems`; the Sanity page is unpublished once that deploy is live (draft kept). |
| Language rule | "Guaranteed saving" reworded to "promise of savings" in the hub and `FirstStepPanel`. |

**Route map:** no routes added, removed or renamed. `/contact?offer=<topic>&pillar=<pillar>#contact` is the new contextual enquiry pattern (`enquiryHref()`).

**Netlify Forms:** `enquiryContext` was added to the `contact` form registration. Netlify detects this on the next deploy. Check that the field appears in form notifications.

## 4. Offer specifications

Published facts are filled in. **MISSING** marks business facts that must not be invented.

### Free self-check: Content Operations Maturity Assessment
- **Buyer and trigger:** someone who suspects their content operation is holding them back and wants a first read before talking to anyone.
- **Scope:** 18 questions across six dimensions (strategy, governance, workflow, technology, measurement, AI readiness).
- **Inputs:** the visitor's own answers. **Client effort:** about 5 minutes.
- **Output:** an on-screen maturity score and band. No email is required.
- **Boundary:** indicative and self-reported. It is not a review of real content.
- **Next decision:** stop, try another tool, or discuss the findings.

### Expert: Content Audit, Snapshot
- **Buyer and trigger:** someone who needs evidence from their real estate, especially on AI retrievability, before committing budget.
- **Scope:** 10% of the estate, at least 50 items and at most 100 (all items if fewer than 50); "item" as defined in `CONTENT_AUDIT.itemDefinition`.
- **Exclusions:** implementation. **MISSING:** a named exclusion list (e.g. platform code review, translation QA).
- **Inputs:** access to the sample. **MISSING:** the access method, roles and interviews needed.
- **Outputs:** a 5 to 10 page report, top five findings, one or two AI-answer failure examples and a 45-minute recorded readout.
- **Delivery:** 5 to 7 business days. **MISSING:** start conditions.
- **Fee:** £2,000 to £3,000 excluding VAT. **MISSING:** what moves a quote within the range.
- **Credit:** 100% toward a Full Estate Audit signed within 30 days.
- **Acceptance / handover:** **MISSING.** Proposed: delivery of the report and readout, with the files kept by the client.
- **Next decision:** stop, act internally, upgrade to the Full Estate Audit, or discuss ongoing work.

### Expert: Content Audit, Full Estate Audit
- **Scope:** the whole estate, every finding family. **Outputs:** a 20 to 30 page board-ready report, a costed remediation roadmap, a 90-minute readout and two weeks of async Q&A.
- **Delivery:** 3 to 4 weeks. **Fee:** £12,000 to £15,000 excluding VAT.
- **MISSING:** estate size limits, inputs, client effort, acceptance.

### Ongoing work (managed package)
- **MISSING:** all commercial terms (O2, O7). Publicly described only as optional, scoped in writing and quoted against scope.

### Trial project / pilot
- **Not offered** pending O3.

## 5. First-release scope (this change)

One complete journey, available from every pillar:
**problem card → pillar page → first-step panel → free self-check or "Discuss a Snapshot" → contact form with the offer retained → confirmation that explains the next step.**

Deliberately left out of the first release (#93): new offers, pricing changes, a pilot page and the promotion's end state (it switches automatically). The sample output, hub restructure, proof line and analytics events followed later the same day (#95 to #99).

## 6. Measurement (instrumented in #99; GTM still to configure)

Pushed to `window.dataLayer` by `pushJourneyEvent()` in `lib/analytics.ts`. Full detail,
including the GTM trigger, tag and GA4 custom dimensions, is in `ANALYTICS.md`.

| Event | When | Params (fixed lists only; no personal or answer data) |
|---|---|---|
| `journey_selected` | Homepage starting-point card clicked | `pillar` |
| `offer_viewed` | Offer panel first scrolls into view, once per page view: homepage "Your first project", pillar first-step panel and audit tiers, `/assessments` expert group, sample report | `offer`, `pillar`, `source_page` |
| `enquiry_submitted` | Contact form (offer and pillar from the URL's fixed lists, else `general` / `null`) or audit-request form (`audit-request`) sent | `offer`, `pillar`, `source_page` |
| `diagnostic_completed` | Already covered by the existing `qualify_lead` | none |
| `first_project_agreed` | Recorded in the CRM, not in analytics | none |

Primary measures: qualified first-project enquiries per month, enquiry to scoping, scoping to paid, and days from enquiry to agreed first project. Traffic is low, so review enquiries qualitatively and do not claim significance from small counts. No percentage targets until there is a baseline.

## 7. Verification record

| Check | Result |
|---|---|
| `tsc --noEmit` | Pass |
| `npm run check:sanity` | Pass |
| `next build` | Compiles and type-checks. Page-data collection stops at `/api/intel/ai` because this container has no `NEXT_PUBLIC_SANITY_PROJECT_ID` (pre-existing and environmental, unrelated to this change). |
| Dev server: `/`, the three pillar pages, `/contact?offer=snapshot&pillar=services`, `/assessments`, `/problems` | All return 200. No page errors from this change. The dev overlay's issues are pre-existing (CSP nonce hydration warnings, theme script placement, no local `CSRF_SECRET`). |
| Mobile 390×844, first visit | Primary hero CTA fully visible above the cookie banner. Sticky bar hidden. |
| Mobile after consent | Sticky bar shown with the label "Free maturity assessment · 5 min". |
| Contact context | "About: Content Audit: Snapshot · Content Operations" shown and clearable. |
| CI on every PR (#93 to #99) | Netlify redirect and header rules, and the Playwright e2e suite, green before each merge. Lighthouse Best Practices shows 83 on every preview, including PRs that do not touch these pages (#92): a preview-environment difference, not a regression. |
| Sample page, hub, proof line, field notes | Screenshots at 390px and 1280px: no horizontal scroll, no page errors from these changes. Hub share-link anchors all resolve. |
| CTA alignment | Button tops and heights identical across cards at 768, 1024, 1280 and 1600px. |
| Field notes | "Another note" changes the note; `aria-live` switches to `polite` only after the first click. Fallback renders when Sanity is unreachable; the production GROQ projection returns all nine notes. |
| Proof line | All four case-study slugs and the count (72) confirmed against production Sanity. |
| Assessment illustrations | All six motifs rendered side by side; the `/content-operations` "Self-assessments" cluster shows both cards with covers, no page errors. |
| Dark mode (27 September, #101) | All new sections reviewed with `data-theme="dark"`: proof line, starting points, first project, field note, "Why", pillar first-step panel, audit tiers and item disclosure, sample report, `/assessments`, contact form. Two fixes: the sample report's amber notice and badge (a bright cream block) and the assessment illustrations (dark-green lines near-invisible, white fills glaring) now use CSS variables (`--notice-*`, `--illus-*` in `app/globals.css`) with dark values; light mode unchanged. The older guide and case-study illustrations were not changed and share the low-contrast issue in dark mode. |
| Production vs preview Lighthouse | Production scores 100 on Best Practices; every preview scores 83. Confirms the preview figure is environmental. |
| Analytics | `dataLayer` read in Chromium: `offer_viewed` once per panel and not on load; `journey_selected` carries the pillar; `enquiry_submitted` carries `snapshot` / `services` from the URL and `general` / `null` for junk params. |
| Not verified here | Real form submission to Netlify (needs deploy and CSRF secret), GA4 receipt (GTM not yet configured), dark mode on the new sections, keyboard focus order on the new sections. The deploy previews could not be opened from this environment. |

## 8. Suggested next steps

1. ~~Build a sample Snapshot output page (O8).~~ Done (#95).
2. ~~Reorganise `/assessments` by commitment type.~~ Done (#96).
3. ~~Add a compact, substantiated proof line under the hero.~~ Done (#98).
4. ~~Instrument the three journey events.~~ Done in code (#99); GTM configuration outstanding (section 9).
5. ~~Point each problem page at a single named tool.~~ Done in Sanity for all problem and solution pages (section 0). Review two calls: "Our CMS isn't creating value" uses the CMS estimator (replatform framing; the maturity assessment may suit an improve-what-you-have buyer better), and "Cold outbound isn't converting" was a leftover from the older outbound positioning: retired on 27 September (unpublished in Sanity, `/problems/outbound-conversion` permanently redirected to `/problems`).
6. Once ECM.DEV Intel has around ten published items (it had none on 27 September), switch the field-note slot to show the latest Intel signals.
7. The CMS estimator's methodology notes still use "guarantees" in a negated sense (`app/assessment/cms-implementation/methodology/page.tsx`, `components/assessment/cms-implementation/Result.tsx`). Review against the language rule.

## 9. Left for Russell

**Operational (a few minutes each):**

- Open ecm-dev.sanity.studio and check the Field Notes field on the Home Page document. No manual deploy is needed: `.github/workflows/studio-deploy.yml` redeploys the Studio whenever Studio files change on `main`, and it ran successfully after #97 merged (27 September, 13:51 UTC).
- Configure GTM: Data Layer Variables `offer`, `pillar`, `source_page`; one Custom Event trigger for `^(journey_selected|offer_viewed|enquiry_submitted)$`; one GA4 event tag; register `offer` and `pillar` as GA4 custom dimensions. Steps in `ANALYTICS.md`.
- Send one real contact enquiry via `/contact?offer=snapshot&pillar=services` and check that `enquiryContext` appears in the Netlify form notification.
- Read `/content-audit/sample` for realism against real Snapshot delivery.

**Commercial decisions still open (section 2):** O1 free audit depth; O2 any credit toward ongoing work; O3 trial projects; O4 pillar-specific Snapshot framing; O6 contact response time; O7 managed package pricing. O5 and O8 are closed.
