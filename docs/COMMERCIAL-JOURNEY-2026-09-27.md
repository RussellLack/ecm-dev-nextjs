# Commercial Journey: First Release

Status: first release implemented on branch `claude/sharp-pasteur-hfmxq7`, 27 September 2026.
Source brief: *ECM.dev Commercial Architecture Review, September 2026*.
This file does four jobs. It records the current-state inventory, lists the commercial
decisions only Russell can make, maps what changed page by page, and serves as the
verification record. Anything marked **OPEN** has been kept out of public copy.

## 1. Current-state inventory and discrepancies

Read directly from the repository (not the cached search index the brief warns about).

| # | Discrepancy found | Where | Status |
|---|---|---|---|
| D1 | Hero promised "no email gate on the result" but linked to `/assessments`, where three of four tools register an email first. Only `content-operations-maturity` is ungated (`UNGATED_SLUGS`). | `app/page.tsx` | **Fixed.** The hero names the one ungated tool and links straight to it. |
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
| D12 | The ticker fallback said "A fixed-price build, then a monthly retained service". No fixed-price build offer is published. | `app/page.tsx` | **Fixed in fallback.** The ticker is Sanity-overridable, so check `homePage.tickerPhrases` in Studio for the same line. |
| D13 | The `/assessments` hub durations were literals that could drift from the tools. | `app/assessments/page.tsx` | **Fixed.** They read `TOOLS`. The featured card still reads `estimatedMinutes` from Sanity (should be 5). |

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

Deliberately left out of this release: new offers, pricing changes, a sample-output page, a pilot page, restructuring the assessments hub by intent, new analytics events and the promotion's end state (it switches automatically).

## 6. Measurement definitions (proposed, not yet instrumented)

The existing `close_convert_lead` event already fires on contact and audit submissions. Proposed additions, keeping the vocabulary small:

| Event | When | Params (no personal or answer data) |
|---|---|---|
| `journey_selected` | Click on a homepage starting-point card | `pillar` |
| `offer_viewed` | First-step panel or tiers enter the viewport | `offer`, `pillar`, `source_page` |
| `enquiry_submitted` | Contact form success | `offer`, `pillar` (from the whitelisted context only) |
| `diagnostic_completed` | Already covered by `qualify_lead` | none |
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
| Not verified here | Real form submission to Netlify (needs deploy and CSRF secret), GA4, dark mode on the new sections, keyboard focus order on the new sections, and live Sanity content overriding fallbacks. |

## 8. Suggested next steps (after O1 to O8)

1. ~~Build a sample Snapshot output page (O8).~~ Done: `/content-audit/sample`.
2. Reorganise `/assessments` by commitment type: free and ungated, free with email, expert-led.
3. Add a compact, substantiated proof line directly under the hero (the brief's section 2). At the moment, proof is the full featured-work block further down.
4. Instrument the three events above.
5. Point each `/problems/*` page's CMS `diagnosticUrl` at a single named tool so its duration label shows.
