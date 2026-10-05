# Future-facing proof library: implementation record

Status: implemented on branch `claude/laughing-davinci-niqhgi`, 5 October 2026.
Source: `docs/FUTURE-FACING-PROOF-PACK.md` (the implementation pack, v1.0).

## 1. What was built

Ten representative engagements (FP01 to FP10), a full page for each, an
index, and placements on the homepage, the seven ICP solution pages and the
Projects archive.

| ID | Route (`/representative-engagements/...`) | Primary solution page | Starting point |
|---|---|---|---|
| FP01 | `turning-technical-expertise-into-content-engine` | Engineering consultancies | Process Assessment |
| FP02 | `building-a-multilingual-content-system-that-scales` | Multilingual industrial teams | Localisation Cost Estimator |
| FP03 | `making-product-knowledge-machine-readable` | Export manufacturers | Content Audit: Snapshot |
| FP04 | `connecting-content-operations-to-pipeline` | SaaS and industrial tech | Process Assessment |
| FP05 | `turning-customer-questions-into-a-gtm-system` | Professional services | Content Operations Maturity Assessment |
| FP06 | `building-an-ai-ready-content-operating-model` | PE-backed B2B companies | Content Operations Maturity Assessment |
| FP07 | `making-complex-maritime-expertise-easier-to-find-and-sell` | Maritime suppliers | Content Audit: Snapshot |
| FP08 | `redesigning-the-content-supply-chain-around-human-and-ai-work` | SaaS and industrial tech | Process Assessment |
| FP09 | `creating-one-knowledge-layer-for-marketing-sales-and-ai` | none (cross-ICP; links to `/solutions`) | Content Audit: Snapshot |
| FP10 | `building-a-repeatable-gtm-engine-after-acquisition` | PE-backed B2B companies | Content Operations Maturity Assessment |

Solution-page mapping (primary / secondary) follows section 6 of the pack
exactly and lives in `SOLUTION_PROOF`. Homepage shows FP01, FP04, FP06.

## 2. Where things live

| File | Role |
|---|---|
| `lib/representativeEngagements.ts` | The ten records, `PROVENANCE_STATEMENT`, `SOLUTION_PROOF`, `HOMEPAGE_ENGAGEMENTS`. Each record carries `contentType: "representative-engagement"` and `representative: true`. |
| `components/proof/RepresentativeEngagementPage.tsx` | Full page, sections in the pack's order (section 5). Inherits the case-study page layout: green hero, breadcrumbs, two columns, sidebar, green CTA. |
| `components/proof/ProofCard.tsx` | Featured and compact cards. Light, bordered, outlined "Representative engagement" badge, client type not name, no imagery: deliberately unlike the solid-green named case-study cards. |
| `components/proof/FlowSteps.tsx` | Responsive workflow diagram: vertical with downward arrows on phones, wrapping with rightward arrows from `sm`. Arrows are `aria-hidden` inside each step's `<li>`. |
| `app/representative-engagements/` | Index and `[slug]` routes; static, no Sanity calls; `dynamicParams = false`. |
| `components/WorkflowSolutionPage.tsx` | "What this looks like in practice" after the workflow, before "A bounded first project". |
| `app/page.tsx` | Homepage section between "Your CMS is not broken" and "Featured work", with the live project count. |
| `app/case-study/page.tsx` | A small strip below the grid linking to the index. The grid and its count are unchanged. |
| `app/sitemap.ts` | Index plus ten pages. |

## 3. Decisions taken

| # | Pack instruction | Decision |
|---|---|---|
| D1 | Option A (subtype in Projects) or B (separate index) | **B**, plus the small archive strip the pack suggests. Historical projects live in Sanity; mixing code records into that grid would complicate counts and filters. |
| D2 | Section 26 names ten first-engagement offers ("Expert Knowledge Workflow Diagnostic" and others) | **Not published.** None exists, and section 26 says to reuse existing offers. Each page links to an existing tool or the Content Audit Snapshot, plus "Discuss a first project" carrying the primary solution context. |
| D3 | Schema must not represent a scenario as a client review | Only `BreadcrumbList` JSON-LD. No Article, Review or Organization schema. |
| D4 | Copy | Transcribed from the pack. Changes: dashes removed (house style), some arrow chains converted into list items for the diagram, "+" and "/" spelt out where they read awkwardly in chips (e.g. "QA and escalation"). No claims added. |
| D5 | Homepage "See 70+ named and anonymised projects" | Uses the live `caseStudyCount` from Sanity rather than a fixed "70+". |
| D6 | Historical evidence | Curated by hand from the published archive (28 slugs verified in production Sanity), 3 to 4 per scenario, each with a one-line note on which component it evidences. Numbers in those notes ("14 languages", "since 2012") come from the case studies' own approved descriptions, attributed to them, never imported into the scenario text. |
| D7 | "What Changes" | A note under each list says measures are agreed against the client's own baseline, consistent with the solution pages. |

## 4. Verification (5 October 2026)

| Check | Result |
|---|---|
| `tsc --noEmit`, `npm run check:sanity` | Pass |
| All ten pages, the index | 200; unique titles and meta descriptions; canonical per page |
| Each page | Provenance statement, visible label, Before and After flows, 3 or more case-study links, a solution link, a contact link with context |
| Solution pages (all seven) | Primary then secondary scenario, inside "What this looks like in practice", before "A bounded first project" |
| Homepage | Exactly three cards (FP01, FP04, FP06) |
| Sitemap | 11 entries |
| Overflow at 390px and 1280px | None on the homepage, index, two scenario pages and a solution page |
| Dark mode | Homepage section reviewed |
| Copy scan | No em or en dashes, no percentages, no hype words |
| Not verified locally | `/case-study` strip (that page needs Sanity, unavailable here; check on the deploy preview) |

## 5. Left for Russell

- Read the ten scenarios for fit with real delivery, especially the
  "We redesigned..." narration, which is the pack's wording.
- Decide whether any of the section 26 offers should become real products;
  if so, add them to `lib/offers.ts` and point `startingPoint` at them.
