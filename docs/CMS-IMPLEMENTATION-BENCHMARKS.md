# CMS Implementation — Benchmark Research & Coefficients Table

**Purpose.** This document feeds Section 2 ("Business Case / TCO model") of the
self-serve assessment tool we are building from the
*Critical Success Factors for ECM/CMS Implementation* article
(`/post/unlocking-business-potential-with-tailored-cloud-solutions`).

The visitor will input a small number of plain-English answers (organisation
size, current platform, target platform tier, locales, content volume, in-house
team) and the tool will return a 3-year TCO range plus a benefit-side estimate.
Every coefficient below is the input that the calculator will multiply against
those answers.

**How to read the tables.**
- **Range (low / mid / high)** — the figure to multiply against the visitor's
  answer. Always presented as a range; the calculator will surface low and high
  as a band, never a false-precision single number.
- **Confidence** — A (publicly published rate cards / multiple corroborating
  analyst sources), B (published vendor or analyst sources but commonly
  discounted in practice), C (industry-anecdotal — partner blogs, broker
  estimates, no primary source).
- **Source bucket** — vendor pricing page, analyst firm (Forrester / Gartner /
  Real Story Group), broker / aggregator (Vendr, ITQlick, G2, Capterra), or
  partner / SI commentary.

All figures are stated in USD unless marked GBP/EUR. Currency conversion will
be a UI selector; the underlying coefficients are USD-anchored.

> **Status.** Drafted from desk research May 2026. Awaiting your sign-off
> before any UI is built. Where confidence is C and stakes are high (Sitecore,
> Optimizely, AEM, Acquia, OpenText, Hyland) the assessment will phrase the
> output as "indicative — confirm with vendor" and link to a
> consultation-request CTA.

---

## 1. Headless CMS — annual licence subscription

Used when the visitor selects target tier = "headless / composable" (Sanity,
Contentful, Storyblok, Strapi, Kontent.ai, Hygraph, Payload).

| Vendor | Entry SaaS | Mid (Team / Business) | Enterprise floor | Confidence | Source |
|---|---|---|---|---|---|
| Sanity | $15 / seat / mo | ~$949 / mo (Growth → Enterprise add-ons) | $30k–$80k / yr typical (SAML SSO alone $1,399/mo) | A (entry), B (enterprise) | sanity.io/pricing; FocusReactive 2026 buyer's guide |
| Contentful | Basic $300 / mo (20 users, 3 locales) | ~$2,000 / mo (Premium) | $60k–$140k+ / yr typical | B | Contentful pricing; Webstacks 2026; Vendr |
| Storyblok | Growth $99 / mo (5 users, 4 locales) | ~$3,300 / mo (Business) | Custom (likely $50k–$120k) | A (entry), B (enterprise) | storyblok.com/pricing; Monterail comparison |
| Strapi | Cloud Pro $99 / project / mo | Cloud Team $499 / project / mo | Self-hosted Enterprise $99 / seat / mo (admins only) | A | strapi.io/pricing-cloud; strapi.io/pricing-self-hosted |
| Kontent.ai | (no public price — sales-led) | — | $50k–$150k / yr typical | C | Kontent.ai; ITQlick |
| Hygraph / Payload | $0–$59 / mo (Hobby/Pro) | $499–$999 / mo (Scale) | $25k–$75k / yr typical | B | Hygraph pricing; Payload Cloud |

**Coefficients to use in calculator (USD / yr):**

| Headless tier | Low | Mid | High | Notes |
|---|---|---|---|---|
| Self-serve / startup | 1,800 | 6,000 | 12,000 | ≤5 editors, 1–2 locales |
| Growing team | 12,000 | 30,000 | 60,000 | 5–20 editors, 3–6 locales |
| Mid-enterprise | 60,000 | 110,000 | 180,000 | 20–60 editors, 6–15 locales, SSO required |
| Enterprise | 140,000 | 220,000 | 350,000 | 60+ editors, 15+ locales, multi-brand, SLA |

---

## 2. DXP / enterprise platform — annual licence subscription

Used when the visitor selects target tier = "DXP" (Sitecore, Optimizely,
Adobe Experience Manager, Acquia, Bloomreach, Pimcore Enterprise).

| Vendor | Entry deployment | Mid-enterprise | Large enterprise | Confidence | Source |
|---|---|---|---|---|---|
| Sitecore XM Cloud | $40k–$60k / yr | $80k–$150k / yr | $150k–$300k+ / yr | C (vendor sales-gated) | SaM Solutions; Fishtank XM Cloud guide; ITQlick |
| Optimizely (One — Content + Commerce) | ~$40k–$60k / yr | $80k–$150k / yr | $150k–$500k+ / yr | C | Vendr Optimizely; FigPii; DXP Scorecard |
| Adobe AEM Sites | $60k–$120k / yr (Forms/Sites entry) | $200k–$500k / yr | $1M+ / yr (multi-product, AEM as Cloud Service) | B | Brainvire 2026; 40Q AEM cost; Software Pricing Guide 2026 |
| Acquia DXP (Drupal Cloud) | $30k–$60k / yr (Core) | $80k–$200k / yr (Core+ / Enterprise) | $200k–$500k+ / yr | C | Acquia pricing pages; G2; SoftwareAdvice |

**Coefficients to use in calculator (USD / yr):**

| DXP tier | Low | Mid | High | Notes |
|---|---|---|---|---|
| Entry DXP | 45,000 | 70,000 | 110,000 | Single-brand, ~1M monthly page views |
| Mid-enterprise DXP | 110,000 | 180,000 | 280,000 | Multi-site, 5–10M monthly page views, personalisation |
| Global enterprise DXP | 280,000 | 500,000 | 900,000 | Multi-brand, multi-region, commerce, advanced AI |

---

## 3. Mid-market CMS — annual licence subscription

| Vendor | Entry | Standard | Enterprise / Premium | Confidence | Source |
|---|---|---|---|---|---|
| Xperience by Kentico (licence-only) | $12,600 / yr | $22,300 / yr | $29,999 / yr (channels add to base) | A | kentico.com/platform/how-to-buy; ITQlick |
| Xperience by Kentico (SaaS) | $24,600 / yr | — | Custom | A | kentico.com pricing PDF |
| Umbraco Heartcore | Starter $75 / mo | Standard $340 / mo | Professional $1,350 / mo | A | umbraco.com/products/umbraco-heartcore/pricing |
| Umbraco CMS (self-hosted) | Free OSS | Cloud Standard ~£60/mo per env | Enterprise — custom (£20k–£80k / yr typical) | B | umbraco.com/pricing; AdTelic |
| Progress Sitefinity | $25k–$40k / yr | $40k–$80k / yr | $80k–$160k / yr | C | DesignRush; Sitefinity DXP marketing |

**Coefficients to use in calculator (USD / yr):**

| Mid-market tier | Low | Mid | High |
|---|---|---|---|
| Entry | 6,000 | 14,000 | 25,000 |
| Standard | 18,000 | 32,000 | 55,000 |
| Premium | 50,000 | 90,000 | 150,000 |

---

## 4. ECM — annual licence subscription

Used when the visitor selects target tier = "ECM" (document-centric:
Hyland OnBase, OpenText Content Management / Documentum,
IBM FileNet, M-Files).

| Vendor | Per-user starting | Mid deployment (500–1,000 users) | Confidence | Source |
|---|---|---|---|---|
| Hyland OnBase | $672 / user / yr (first 100 users) | $200k–$600k / yr | B (per-user), C (deployment) | ITQlick; SelectHub OnBase; Capterra |
| OpenText Content Mgmt / Extended ECM | $25–$40 / user / mo basic; $60–$100 / user / mo enterprise | $200k–$800k / yr inc. first-year support | B | ITQlick; Vendr |
| IBM FileNet / Cloud Pak | (not publicly listed) | $300k–$1M / yr typical | C | TEC; partner commentary |
| M-Files | ~$59 / user / mo Cloud, custom on-prem | $50k–$300k / yr | C | M-Files; aggregator data |

**Coefficients to use in calculator (USD / yr):**

| ECM size | Low | Mid | High |
|---|---|---|---|
| Departmental (≤200 users) | 60,000 | 120,000 | 220,000 |
| Mid-enterprise (200–1,000 users) | 200,000 | 450,000 | 800,000 |
| Enterprise (1,000+ users) | 600,000 | 1,100,000 | 2,500,000 |

---

## 5. Implementation cost — one-off

**SI day rates** (used to convert estimated effort-days → cost). The
calculator should default to the visitor's region selection.

| Region / role | Day rate (USD) low | mid | high | Confidence | Source |
|---|---|---|---|---|---|
| UK senior consultant / architect | 1,000 | 1,400 | 2,000 | B | ContractorUK Jan 2026; Index.dev |
| UK senior developer | 700 | 950 | 1,300 | B | PayScale UK; Lemon.io UK calculator; Index.dev |
| Western Europe senior dev | 600 | 900 | 1,200 | B | Index.dev European rates 2026 |
| Central/Eastern Europe senior dev | 360 | 540 | 720 | B | Qubit Labs; Index.dev |
| US senior consultant / architect | 1,400 | 1,900 | 2,600 | B | Vendr SI rate cards; partner commentary |
| US senior developer | 900 | 1,300 | 1,800 | B | Same |
| Offshore (India/LatAm) senior dev | 250 | 380 | 550 | B | Qubit Labs; RemoteCrew |

**Project sizing** (effort estimate → multiplier on day rate). Use these to
estimate effort-days when the visitor describes scope:

| Project size | Effort range (consultant-days) | Duration (months) | Confidence | Source |
|---|---|---|---|---|
| Small (single brochure site, headless) | 60–150 | 2–3 | A | Storyblok migration guide; Dellos timeline guide |
| Mid-market (B2B site, integrations, ~500 pages) | 300–700 | 3–6 | B | Webflow Enterprise Build cost; Clear Digital |
| Enterprise (multi-site, multi-locale, commerce/personalisation) | 1,000–2,500 | 6–12 | B | Forrester CMS Wave; AEM/Sitecore implementation studies |
| Global enterprise (multi-brand replatform) | 2,500–6,000+ | 12–24 | C | Brainvire AEM; analyst commentary |

**Phase split** (apply to total implementation budget):

| Phase | % of implementation budget | Source |
|---|---|---|
| Discovery & requirements | 10–15% | atechsight; Solutions Review CMS phases |
| Design & UX | 15–25% | atechsight; Ingeniux |
| Build & integrations | 35–45% | atechsight; Clear Digital |
| Content modelling & migration | 10–15% | atechsight; Real Story Group |
| Testing & launch | 5–10% | atechsight; Solutions Review |
| Training & change | 5–10% | Solutions Review; Forrester TEI commentary |
| **Contingency (always add)** | **15–20%** | Multiple sources — atechsight, Clear Digital |

**Cost-overrun reality** (used to surface a "risk band" in the calculator):

- 66% of enterprise software projects experience cost overruns
  (McKinsey via Forecast.app).
- Mean overrun on large IT programmes: 27%; large projects can run
  **200–400% over** when they go wrong (BCG / McKinsey via Runn 2025
  PM stats roundup).
- Only ~0.5% of IT projects hit all three of on-time / on-budget /
  on-benefit (McKinsey).

→ **Calculator behaviour:** quote a low/mid/high band where high = mid × 1.4;
add a "high-risk profile" toggle (legacy migration + multi-locale +
commerce + AI) which lifts high to mid × 1.8.

---

## 6. Ongoing run cost — annual

| Run-cost item | Coefficient | Confidence | Source |
|---|---|---|---|
| Hosting / cloud infrastructure (mid-market site, ~5M MPV) | $12,000–$45,000 / yr | B | TrustRadius CMS pricing 2026; Akamai cost calc |
| Hosting (enterprise multi-site, 25M+ MPV) | $80,000–$300,000 / yr | B | Same |
| Vendor support & maintenance (% of licence) | 18–22% / yr | A | Brainvire AEM 2026; SaM Sitecore guide |
| Out-year enhancement spend | **~80–110% of Year 1 implementation, recurring** | A | Real Story Group "CMS implementation cost curve" |
| Internal content-ops headcount (mid-market) | 2–4 FTE | C | Forrester CMS Wave 2025 commentary; SI partner data |
| Internal content-ops headcount (enterprise) | 6–15 FTE | C | Same |
| Translation / localisation per locale | Use ECM.dev localisation estimator | A | Cross-reference existing tool |
| Third-party integrations (CRM/ERP/PIM/MarTech) | $25k–$150k / yr typical | B | Brainvire; ITQlick aggregated |
| Performance & monitoring (APM, observability) | $8k–$40k / yr | B | Industry standard tooling pricing |

**Coefficients to use in calculator (USD / yr — total run cost excluding licence):**

| Org size | Low | Mid | High | Notes |
|---|---|---|---|---|
| Mid-market (single site, 5–10M MPV) | 60,000 | 110,000 | 180,000 | Hosting + support + 2 FTE + integrations |
| Mid-enterprise (multi-site / multi-locale) | 180,000 | 320,000 | 520,000 | + dedicated platform team |
| Enterprise (global, multi-brand) | 500,000 | 900,000 | 1,800,000 | + multi-region hosting, full content ops |

**Legacy "do nothing" cost** (used when visitor reports staying on legacy):

- Legacy systems consume **60–80% of IT budget** (RecordPoint;
  Hashbyt 2025 modernisation analysis).
- Estimated annual hidden cost of a legacy enterprise system:
  **$2.0–$2.4M / yr** all-in for a mid-large org (Medium / Hashbyt analysis,
  confidence C — directional only).

---

## 7. ROI / productivity benefits

These are the headline numbers the calculator uses to populate the
"benefit side" of the business case. All come from Forrester
*Total Economic Impact* studies — caveat: TEI studies are vendor-commissioned
on composite-organisation models, so we present them as **upper-bound
illustrative benchmarks** and never as guarantees.

| Benefit | Reported gain | Source | Confidence (use as benchmark) |
|---|---|---|---|
| Headless CMS ROI (3-yr) | **295–702%** | Forrester TEI: Contentstack (295%), Kontent.ai (320%), Storyblok (582%); Contentful retail case (702%) | B (vendor-commissioned but published) |
| Payback period | **<6 months** typical; 2–3 months in best case | Forrester TEI Storyblok, Kontent.ai; industry averages | B |
| Time-to-publish reduction | **70–90%** | Forrester TEI Contentstack ("90% reduction"); CMS-stats roundups (69% report improvement) | B |
| Content-related dev time reduction | **60–80%** | Forrester TEI Contentstack | B |
| Editor productivity multiplier | **2.5×–3×** | Forrester TEI Storyblok ("3× productivity boost") | B |
| Revenue uplift attributable to platform | **3–5%** | Forrester TEI Contentstack ("4% revenue lift, $3M profit over 3 years") | C (highly context-dependent) |
| TCO reduction vs. legacy monolith | **30–75%** | Salling Group composable case (75%); broader analyst consensus 30–50% | C |
| Page-load speed improvement | **20–40%** | Nike headless case (30%); industry benchmarks | C |

**Coefficients to use in benefit-side calculator:**

| Benefit lever | Low | Mid | High | How calculator uses it |
|---|---|---|---|---|
| Editor hours saved / yr / FTE | 80 | 240 | 520 | × loaded FTE cost (mid $90k / yr ≈ $43/hr UK; $120k ≈ $58/hr US) |
| Dev hours saved / yr (platform team) | 200 | 600 | 1,400 | × dev day rate ÷ 8 |
| Time-to-market reduction (weeks per major release) | 1 | 3 | 8 | Surfaces qualitative not monetary |
| Revenue lift assumption (online-revenue dependent only) | 0% | 2% | 4% | Disabled by default; visitor can enable with site-revenue input |

---

## Calculator architecture implications

1. **Two-track output.** "Cost side" (sections 1–6) is reasonably defensible.
   "Benefit side" (section 7) sits behind a clearly-labelled
   *"Indicative benefits — your mileage will vary"* banner.
2. **Always show a band, never a single number.** Inputs feed low / mid / high
   coefficients independently.
3. **Route every assumption to a methodology page.** Same pattern as the
   localisation estimator — every coefficient row in the PDF has a footnote
   linking to the methodology page anchor.
4. **Confidence-driven CTA.** Where the visitor's selections push them into
   high-stakes / low-confidence territory (Sitecore, AEM, large ECM,
   global enterprise), the calculator surfaces:
   *"Your scenario crosses thresholds where vendor list price diverges
   significantly from negotiated price. Book a 30-min benchmarking call."*
5. **Lead capture (email-gated PDF).** Captured email is the only required
   field for the take-away PDF + shareable link, in line with the user
   brief.

---

## Sources

### Primary vendor pricing pages
- [Sanity Pricing](https://www.sanity.io/pricing)
- [Strapi Cloud Pricing](https://strapi.io/pricing-cloud)
- [Strapi Self-hosted Pricing](https://strapi.io/pricing-self-hosted)
- [Strapi Cloud price changes 2024–25](https://strapi.io/blog/lower-prices-and-greater-flexibility-with-improved-strapi-cloud-pricing)
- [Strapi user-based Enterprise pricing](https://strapi.io/blog/introducing-user-based-pricing-for-strapi-enterprise-edition)
- [Kentico — How to Buy](https://www.kentico.com/platform/how-to-buy)
- [Xperience by Kentico SaaS pricing PDF](https://www.kentico.com/getattachment/8c4825a7-befd-4ae4-abde-e539a1dcf264/Xperience-by-Kentico-pricing-information.pdf)
- [Umbraco Pricing](https://umbraco.com/pricing/)
- [Umbraco Heartcore Pricing](https://umbraco.com/products/umbraco-heartcore/pricing/)
- [Umbraco 2026 price changes](https://umbraco.com/blog/annual-price-changes-2026/)
- [Acquia Cloud Platform Pricing](https://www.acquia.com/products/acquia-cloud-platform/pricing-plans)
- [Acquia Drupal Cloud subscriptions docs](https://docs.acquia.com/service-offerings/drupal-cloud-subscriptions)
- [Sitecore XM Cloud product page](https://www.sitecore.com/products/xm-cloud)
- [Optimizely Plans](https://www.optimizely.com/plans/)
- [OpenText Content Management plans guide](https://www.opentext.com/media/guide/simple-purpose-built-pricing-plans-for-opentext-content-management-guide-en.pdf)

### Analyst / TEI studies
- [Forrester TEI of Contentstack — 295% ROI summary](https://www.contentstack.com/blog/all-about-headless/contentstack-demonstrated-295-percent-roi-in-forrester-study)
- [Forrester TEI of Kontent.ai — landing](https://kontent.ai/resources/forrester-total-economic-impact-study/)
- [6 takeaways from Kontent.ai TEI](https://kontent.ai/blog/6-key-takeaways-from-the-tei-study-on-kontent-ai-s-roi/)
- [Forrester TEI of Storyblok — 582% ROI press](https://www.storyblok.com/mp/storyblok-tei-study-press)
- [Forrester TEI of Storyblok — landing](https://www.storyblok.com/lp/tei-study)
- [Forrester Wave: CMS Q1 2025 — Optimizely summary](https://www.optimizely.com/insights/forrester-wave-content-management-systems/)
- [Forrester Wave: CMS Q1 2025 — Adobe summary](https://business.adobe.com/resources/reports/forrester-wave-content-management-systems-2025.html)
- [Forrester CMS landscape Q4 2024 — Contentstack](https://www.contentstack.com/resources/report/forrester-content-management-system-landscape)
- [Real Story Group: CMS Implementation Cost Curve](https://realstorygroup.com/Blog/cms-implementation-cost-curve)

### Brokers / aggregators / partner commentary
- [Vendr — Optimizely pricing](https://www.vendr.com/marketplace/optimizely)
- [Vendr — OpenText pricing](https://www.vendr.com/marketplace/opentext)
- [ITQlick — Sitecore pricing](https://www.itqlick.com/sitecore-customer-engagement/pricing)
- [ITQlick — Adobe Experience pricing](https://www.itqlick.com/adobe-experience-manager/pricing)
- [ITQlick — Kentico pricing](https://www.itqlick.com/kentico/pricing)
- [ITQlick — OpenText ECM pricing](https://www.itqlick.com/opentext-enterprise-content-management/pricing)
- [G2 — Strapi pricing](https://www.g2.com/products/strapi/pricing)
- [G2 — Umbraco pricing](https://www.g2.com/products/umbraco/pricing)
- [G2 — Acquia DXP pricing](https://www.g2.com/products/acquia-digital-experience-platform/pricing)
- [G2 — OpenText Extended ECM pricing](https://www.g2.com/products/opentext-extended-ecm/pricing)
- [Capterra — OnBase](https://www.capterra.com/p/62208/OnBase/)
- [SoftwareAdvice — Acquia Cloud Platform](https://www.softwareadvice.com/cms/acquia-platform-profile/)
- [TrustRadius — Kentico Xperience pricing](https://www.trustradius.com/products/kentico/pricing)
- [TrustRadius — CMS pricing & cost guide 2026](https://solutions.trustradius.com/buyer-blog/content-management-system-pricing-guide/)
- [Webstacks — Headless CMS cost factors](https://www.webstacks.com/blog/how-much-does-a-headless-cms-cost)
- [FocusReactive — startup-to-enterprise pricing surprises](https://focusreactive.com/blog/headless-cms-for-startups-how-to-scale-without-enterprise-pricing-surprises/)
- [Monterail — Storyblok vs Sanity vs Contentful 2026](https://www.monterail.com/blog/which-cms-to-choose)
- [Brainvire — AEM US enterprise cost guide 2026](https://www.brainvire.com/blog/adobe-aem-cost-breakdown-us-enterprises/)
- [40Q — AEM enterprise pricing reality](https://40q.agency/the-true-cost-of-adobe-experience-manager/)
- [Software Pricing Guide — Adobe Experience Cloud 2026](https://softwarepricingguide.com/adobe-experience-cloud-pricing-2026-analytics-aem-target-campaign-and-the-true-enterprise-cost/)
- [Fishtank — Sitecore XM Cloud pricing](https://www.getfishtank.com/insights/sitecore-xm-cloud-pricing)
- [SaM Solutions — Sitecore price guide](https://sam-solutions.us/insights/sitecore-price/)
- [DXP Scorecard — Optimizely PaaS](https://www.dxpscorecard.com/platform/optimizely-paas)
- [SelectHub — OnBase ECM](https://www.selecthub.com/p/enterprise-content-management-software/onbase/)

### Implementation cost / project sizing
- [atechsight — CMS implementation cost 2026](https://atechsight.com/blog/professional-cms-implementation-cost)
- [Solutions Review — 8 steps of CMS implementation](https://solutionsreview.com/content-management/the-steps-of-a-content-management-system-cms-implementation/)
- [Clear Digital — CMS migration checklist](https://www.cleardigital.com/insights/cms-migration-checklist-for-enterprises-a-complete-guide-to-seamless-platform-transitions)
- [ThreeSixtyEight — Webflow Enterprise build cost 2026](https://www.threesixtyeight.com/articles/webflow-enterprise-build-cost)
- [Dellos — CMS migration timeline](https://dellos.in/cms-migration-timeline-how-long-each-stage-actually-takes/)
- [Enterprise CMS Guide — project timeline expectations](https://www.enterprisecms.org/guides/enterprise-cms-project-timeline-expectations)

### SI / developer rate cards
- [Index.dev — European developer rates 2026](https://www.index.dev/blog/european-developer-hourly-rates)
- [Index.dev — UK developer rates 2025](https://lemon.io/rate-calculator/united-kingdom/)
- [ContractorUK — January 2026 market rates](https://www.contractoruk.com/market_rates)
- [PayScale — UK software development rates](https://www.payscale.com/research/UK/Industry=Software_Development/Hourly_Rate)
- [Qubit Labs — offshore rates by country 2026](https://qubit-labs.com/average-hourly-rates-offshore-development-services-software-development-costs-guide/)
- [DevTechnoSys — EU dedicated dev rates 2026](https://devtechnosys.com/insights/dedicated-developer-hourly-rates-in-europe/)

### Cost overrun / project risk
- [Forecast — 66% of enterprise software projects overrun (McKinsey)](https://www.forecast.app/blog/66-of-enterprise-software-projects-have-cost-overruns)
- [Runn — IT project management statistics 2025](https://www.runn.io/blog/it-project-management-statistics)
- [Statista — ERP cost overruns 2023](https://www.statista.com/statistics/526423/worldwide-erp-implementation-projects-cost-overrun/)
- [Enterprise CMS Guide — hidden costs](https://www.enterprisecms.org/guides/hidden-costs-in-enterprise-cms-implementations)

### Legacy / do-nothing cost
- [Progress — ROI of doing nothing on legacy CMS](https://www.progress.com/blogs/roi-doing-nothing-why-your-legacy-cms-costing-more)
- [RecordPoint — hidden costs of legacy systems](https://www.recordpoint.com/blog/maintaining-legacy-systems-costs)
- [Hashbyt — legacy modernisation hidden costs](https://medium.com/@hashbyt/legacy-modernization-costs-hidden-costs-59241b5e2623)
- [Clear Digital — hidden costs of an outdated CMS](https://www.cleardigital.com/insights/hidden-costs-outdated-cms)

### CMS market & adoption stats
- [Storyblok — Headless vs monolithic CMS stats 2025](https://www.storyblok.com/mp/cms-statistics)
- [Contentful — replatforming made easy](https://www.contentful.com/blog/cms-replatforming-made-easy-with-contentful/)
- [Quba — replatforming guide for digital directors](https://www.quba.co.uk/insights/articles/replatforming-your-cms-a-guide-for-digital-directors)

---

## Open questions for your review

1. **Currency.** USD-anchor coefficients with a UI selector for GBP (×0.79)
   and EUR (×0.92), or hold separate GBP coefficient sets given the bulk of
   ECM.dev clients are UK/EU? **Recommendation:** USD-anchor with a UI
   selector — keeps the coefficient table single-sourced.
2. **Sitecore / Optimizely / AEM ranges.** Confidence C is structurally
   unavoidable for sales-gated DXPs. We should keep Sitecore and AEM in
   the calculator but always flag *"these vendors don't publish prices —
   the calculator uses analyst-broker estimates which can diverge ±40%
   from your negotiated price."* Comfortable with that disclaimer?
3. **Benefit-side defaults.** Forrester TEI numbers are real but
   vendor-commissioned. **Recommendation:** the calculator defaults to
   **mid** values for cost and **low** values for benefit — i.e. the
   business case shown is the *conservative* one, with a checkbox to
   "use vendor-cited benchmarks (TEI)" for the optimistic case.
4. **TCO horizon.** 3 years is the analyst standard. Any reason to also
   show a 5-year option? Most ECM contracts are 5-yr.
5. **Out-year enhancement coefficient.** The Real Story Group claim that
   "out-year enhancement spend ≈ Year 1 implementation, recurring" is
   our single most consequential coefficient. Want to adopt it as-is or
   soften to 60% of Year 1 to be conservative?
6. **Industry verticalisation.** The article (and current ECM.dev industry
   taxonomy) recognises FS / healthcare / manufacturing / public sector /
   etc. Should the calculator apply industry-specific multipliers (e.g.
   regulated industries +20% on implementation, public sector +30% on
   procurement overhead)? **Recommendation:** v1 doesn't — too many
   coefficients to defend simultaneously. Add as v2 once we have leads.

Once you sign off on the coefficient table and the open questions above, the
next deliverable is the input form spec → the calculator engine →
the result page + PDF generator. Estimated 3–5 dev days for v1 on the
existing assessment infrastructure (`app/api/assessment/pdf/route.tsx`,
already in place for the localisation estimator).
