# CMS Implementation Assessment — Input Form Spec

**Companion to** `docs/CMS-IMPLEMENTATION-BENCHMARKS.md`. That doc holds the
coefficients; this doc maps every form input to which coefficient it drives.

**UX pattern** mirrors the existing localisation cost estimator
(`components/estimator/EstimatorForm.tsx` → `EstimatorResult.tsx`):
single-page progressive form, side-panel running-total, email gate
before final PDF / shareable link.

**Route.** `/assessment/cms-implementation`

---

## Form structure

Six step-fieldsets, navigable via "Next / Back" + step indicator. The
visitor can skip to any completed step. The running-cost panel updates
live as inputs change.

| Step | Fieldset | Drives |
|---|---|---|
| 1 | Your organisation | implementation effort multiplier; legacy "do nothing" cost |
| 2 | Current platform | replatform-vs-greenfield delta; out-year enhancement weighting |
| 3 | Target platform | licence coefficient table to use |
| 4 | Scope & complexity | implementation effort range; project size band |
| 5 | Run-time profile | ongoing run cost; team size |
| 6 | Email + delivery | lead capture; PDF + shareable link |

---

## Step 1 — Your organisation

| Field | Type | Required | Drives |
|---|---|---|---|
| Organisation size | radio: `small (<200 employees)`, `mid-market (200–2,000)`, `enterprise (2,000+)`, `global enterprise (10,000+)` | Y | Project-size band; default DXP/headless tier |
| Industry | select: financial-services, healthcare, manufacturing, retail, technology, public-sector, energy, professional-services, other | Y (display only in v1) | UI-only — surfaces relevant ECM.dev case studies on result page; no coefficient impact in v1 (industry verticalisation deferred to v2) |
| Region (HQ) | radio: `UK`, `EU`, `US`, `Other` | Y | SI day-rate region; currency default (UK→GBP, EU→EUR, US/Other→USD) |
| Currency | select: `USD`, `GBP`, `EUR` (defaults from region) | Y | Display multiplier (USD anchor × 1.00 / 0.79 / 0.92) |

---

## Step 2 — Current platform

| Field | Type | Required | Drives |
|---|---|---|---|
| Current platform | select: `WordPress`, `Sitecore (on-prem)`, `Sitecore XM Cloud`, `Optimizely`, `Adobe AEM`, `Drupal / Acquia`, `Kentico`, `Umbraco`, `Sitefinity`, `Custom / in-house`, `OpenText`, `Hyland OnBase`, `Other ECM`, `Headless (Sanity/Contentful/Storyblok/etc.)`, `Greenfield (no existing platform)` | Y | Migration complexity multiplier; "do nothing" baseline |
| Years on current platform | radio: `<3`, `3–6`, `6–10`, `10+` | Y | Legacy debt indicator → enhancement-spend weighting |
| Pain points (multi-select) | check: `slow to publish`, `dev bottleneck`, `no localisation support`, `poor mobile/omnichannel`, `expensive to run`, `vendor exiting/EOL`, `security/compliance gaps`, `cannot integrate AI` | N | Surfaces narrative on result page; nudges target-tier recommendation |

**Coefficient logic.**
- Greenfield (no existing platform): migration effort = 0, contingency reduces from 18% → 12%.
- Custom / in-house OR ECM source platform: migration effort × 1.4 (data-shape mismatch).
- 10+ years on platform: out-year enhancement coefficient bumps from 60% → 75% of Year 1 (legacy debt assumption).

---

## Step 3 — Target platform

| Field | Type | Required | Drives |
|---|---|---|---|
| Target tier | radio: `Headless / composable`, `Mid-market CMS`, `DXP / enterprise platform`, `ECM (document-centric)`, `Not sure — show me a comparison` | Y | Which licence coefficient table is used |
| Specific vendor (optional) | select — populated by tier choice; includes "Don't know yet" | N | Picks sub-coefficient inside the tier table; triggers sales-gated disclaimer if applicable |
| Deployment model | radio: `SaaS`, `PaaS / managed cloud`, `Self-hosted`, `Don't know yet` | Y | Run-cost hosting coefficient |

**Vendor → tier mapping.**
- Headless: Sanity, Contentful, Storyblok, Strapi, Kontent.ai, Hygraph, Payload
- Mid-market: Kentico Xperience, Umbraco, Sitefinity, Drupal (community)
- DXP: Sitecore, Optimizely, Adobe AEM, Acquia, Bloomreach
- ECM: Hyland OnBase, OpenText, IBM FileNet, M-Files, Alfresco

**Sales-gated disclaimer trigger.** If the visitor picks Sitecore,
Optimizely, AEM, Acquia, OpenText or Hyland (any size), the result page
prepends:
> *Vendor doesn't publish prices — analyst-broker estimates can diverge
> ±40% from negotiated price. Book a 30-min benchmarking call to tighten
> the range.*

---

## Step 4 — Scope & complexity

| Field | Type | Required | Drives |
|---|---|---|---|
| Number of brands / sites | number input (1–50, default 1) | Y | Implementation effort × √(sites) |
| Locales / languages | number input (1–40, default 1) | Y | Implementation effort × (1 + 0.15 × (locales − 1)); cross-link to localisation estimator |
| Approximate page / asset count | radio: `<500`, `500–5,000`, `5,000–50,000`, `50,000+` | Y | Content-migration effort band |
| Required integrations (multi-select) | check: `CRM`, `ERP`, `PIM/DAM`, `Marketing automation`, `Commerce / cart`, `Identity / SSO`, `Analytics`, `Personalisation engine`, `AI / agents`, `None` | N | Each ticked = +5% implementation; integrations >5 ticked = "high-risk profile" toggle on |
| Personalisation / AI required | radio: `No`, `Light (rules-based)`, `Heavy (AI / ML)` | Y | DXP-tier nudge; +0/+10%/+25% on implementation |
| Compliance constraints (multi-select) | check: `GDPR/UK-GDPR`, `WCAG 2.2 AA`, `ISO 27001`, `SOC 2`, `Public-sector procurement`, `Sector-specific (FS/healthcare/etc.)`, `None` | N | Each = +3% implementation, capped at +15%; surfaces governance section |

**High-risk profile toggle.** Triggered automatically when any TWO of:
- Locales ≥ 6
- Integrations ≥ 5
- Personalisation = Heavy
- Compliance ≥ 3 ticked
- Pages ≥ 50,000

Effect: cost-band high = mid × 1.8 (instead of × 1.4). Disclosed visibly:
*"Your scenario crosses thresholds where projects historically over-run
200%+. We've widened the high band accordingly."*

---

## Step 5 — Run-time profile

| Field | Type | Required | Drives |
|---|---|---|---|
| Editor / content-author count | number input (1–500, default 5) | Y | Per-seat licence cost; editor-productivity-saved benefit |
| Content updates per week | radio: `<10`, `10–50`, `50–200`, `200+` | Y | Editor-productivity benefit multiplier |
| Internal platform team size | radio: `0 (fully agency-led)`, `1–2`, `3–5`, `6+` | Y | Run-cost FTE coefficient |
| Annual online revenue (optional) | number input — currency-aware | N | Unlocks the 0–4% revenue-uplift benefit row; left out by default |
| TCO horizon | radio: `3 years`, `5 years` (default 3) | Y | Multiplies licence + run cost; 5-yr more relevant for ECM contracts |

---

## Step 6 — Email + delivery

| Field | Type | Required | Drives |
|---|---|---|---|
| Full name | text | Y | Personalisation in PDF + email; CRM lead record |
| Work email | email — validated | Y | PDF delivery; shareable link gating; CRM lead |
| Company | text | Y | CRM lead |
| Job title | text | N | Lead segmentation |
| "I'd like a 30-min benchmarking call" | checkbox | N | Triggers Calendly link in confirmation email |
| Marketing consent | checkbox — pre-unticked | N | GDPR-compliant; mailing list opt-in |

**Delivery flow.**
1. On submit → POST `/api/assessment/cms-implementation/submit`
2. Server stores submission in Sanity (`assessmentSubmission` document type, reused from existing tool)
3. Server generates PDF via existing `app/api/assessment/pdf/route.tsx` (extended with new template)
4. Server sends email via Resend with PDF attached + shareable-link URL
5. Server returns shareable-link URL to client (anonymous-public read; result page renders the same calculation server-side)

---

## Result page composition

Mirrors the localisation estimator's result component (`EstimatorResult.tsx`).

Sections, top-to-bottom:

1. **Headline summary block.**
   *"Your indicative 3-year TCO: £840,000 – £1.6M"*
   Below: traffic-light confidence indicator (A/B/C avg across the
   coefficients used).

2. **Cost breakdown table.** Year 1 and recurring split, with
   sub-rows per coefficient (licence, implementation, hosting,
   support, run-team, out-year enhancement).

3. **Benefit-side block.**
   - "Conservative case" — low TEI coefficients
   - "Vendor-cited case" (toggle) — mid TEI coefficients
   - Both labelled with confidence flag.

4. **Risk band visualiser.** Horizontal bar — low / mid / high cost,
   high-risk profile widening explained inline.

5. **Methodology link.** Anchor link to
   `/assessment/cms-implementation/methodology` (renders the
   benchmark doc as a public reference page).

6. **Sales-gated disclaimer** (if triggered).

7. **Cross-sell to ECM.dev services & content.** Reuses
   `AssessmentNextSteps` with `pillars={["technology", "services"]}`
   and `currentSlug="cms-implementation"`.

8. **Shareable-link block.** Visitor can copy the URL or post it
   directly to LinkedIn / Slack / email-to-CFO.

---

## Calculator engine — pseudocode contract

The engine is a pure TypeScript module: `lib/assessment/cms-implementation/engine.ts`.

```ts
export type CmsImplementationInputs = {
  org: { size: 'small' | 'mid' | 'enterprise' | 'global'; industry: string; region: 'UK' | 'EU' | 'US' | 'Other'; currency: 'USD' | 'GBP' | 'EUR' };
  current: { platform: string; yearsOnPlatform: '<3' | '3-6' | '6-10' | '10+'; painPoints: string[] };
  target: { tier: 'headless' | 'mid-market' | 'dxp' | 'ecm' | 'unsure'; vendor?: string; deployment: 'saas' | 'paas' | 'self-hosted' | 'unsure' };
  scope: { sites: number; locales: number; pageBucket: '<500' | '500-5k' | '5k-50k' | '50k+'; integrations: string[]; personalisation: 'none' | 'light' | 'heavy'; compliance: string[] };
  runtime: { editors: number; updateFreq: '<10' | '10-50' | '50-200' | '200+'; teamSize: '0' | '1-2' | '3-5' | '6+'; revenue?: number; horizon: 3 | 5 };
};

export type CmsImplementationResult = {
  currency: 'USD' | 'GBP' | 'EUR';
  totalsByYear: Array<{ year: number; low: number; mid: number; high: number }>;
  threeYearTotal: { low: number; mid: number; high: number };
  fiveYearTotal: { low: number; mid: number; high: number };
  breakdown: {
    licence: Range; implementation: Range; hosting: Range; support: Range;
    runTeam: Range; outYearEnhancement: Range; contingency: Range;
  };
  benefit: {
    conservative: { editorHoursSaved: number; devHoursSaved: number; revenueUplift: number; threeYearValue: Range };
    tei: { editorHoursSaved: number; devHoursSaved: number; revenueUplift: number; threeYearValue: Range };
  };
  flags: {
    salesGated: boolean;          // shows ±40% disclaimer
    highRiskProfile: boolean;     // widens high band
    confidence: 'A' | 'B' | 'C';  // worst-case across used coefficients
  };
};

export function calculate(inputs: CmsImplementationInputs): CmsImplementationResult;
```

The engine takes inputs, looks up coefficients from a typed
`coefficients.ts` table that mirrors the benchmarks doc, applies the
multipliers and toggles, and returns a fully formed result. It does
**no** I/O — that's the API route's job. This makes the engine
unit-testable.

---

## Implementation plan

| Phase | Output | Effort |
|---|---|---|
| 1 | `lib/assessment/cms-implementation/coefficients.ts` (the benchmarks table as typed data) | 0.5 day |
| 2 | `lib/assessment/cms-implementation/engine.ts` (pure calc) + Vitest unit tests | 1 day |
| 3 | `components/assessment/cms-implementation/Form.tsx` (6 step fieldsets, copies the localisation estimator's UX) | 1 day |
| 4 | `components/assessment/cms-implementation/Result.tsx` + breakdown table + benefit toggle + risk-band bar | 1 day |
| 5 | `app/api/assessment/cms-implementation/submit/route.ts` + Sanity submission storage + Resend email | 0.5 day |
| 6 | `app/api/assessment/pdf/route.tsx` extension — new template branch for this assessment | 0.5 day |
| 7 | `app/assessment/cms-implementation/page.tsx` + `app/assessment/cms-implementation/result/[id]/page.tsx` (shareable-link route) + methodology page | 0.5 day |
| **Total** | | **5 dev days** |

---

## Cross-links to existing tools / content

- **Localisation estimator** — when locales ≥ 3, surface a "translate
  this number into per-locale cost" CTA linking to
  `/assessment/localisation-cost`.
- **Article it replaces** — `/post/unlocking-business-potential-with-tailored-cloud-solutions`
  gets a banner at the top: *"Turn this article into a tailored
  business case → Run the assessment"*.
- **MixedRelated component** — already in place; the assessment slug
  feeds it like every other content type.
- **Industry hubs / platform pages** — the result page surfaces the
  ECM.dev page that matches the visitor's `target.vendor` choice (e.g.
  Sitecore → `/platform/sitecore`).

---

## Open implementation questions (non-blocking — flagging for the build phase)

1. **Sanity schema reuse.** Does the existing
   `assessmentSubmission` document type already cover this assessment's
   shape, or do we need a sibling type? Worth checking before the
   submit-route work.
2. **PDF template — full theme or compact?** Localisation estimator
   PDF is dense. CFOs reading this one expect a single landing page
   summary + two pages of detail. Suggest the latter.
3. **A/B vs single price band?** Some calculators present two
   scenarios side-by-side ("Headless replatform" vs "stay on legacy").
   Worth doing in v1, or save for v2?

These are build-phase calls, not gate-keeping decisions. Will surface
each at the relevant phase.
