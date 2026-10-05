# Workflow-led solution pages and the fractional lead card

Status: implemented on branch `claude/laughing-davinci-niqhgi`, 5 October 2026.
Not yet merged or deployed. Source: *ECM.DEV Claude Code implementation brief:
seven workflow-led solution landing pages and a reusable Russell Lack
fractional content operations lead card*.

## 1. What was built

Seven buyer-situation pages under the existing `/solutions` route, one shared
template, a reusable lead card, and the wiring around them. The five
outcome-led solution pages in Sanity are unchanged.

| Route | Kind on the hub | Secondary hero action |
|---|---|---|
| `/solutions/export-manufacturers` | Sector (featured) | Process Assessment |
| `/solutions/engineering-consultancies` | Sector (featured) | Process Assessment |
| `/solutions/saas-industrial-tech` | Sector | Case study: B2B software demand generation |
| `/solutions/maritime-suppliers` | Sector | Case study: Wilhelmsen global platform |
| `/solutions/pe-backed-companies` | Business situation | Case study: Position Green |
| `/solutions/professional-services` | Sector | Content Operations Maturity Assessment |
| `/solutions/multilingual-industrial-teams` | Operating need | Localisation Cost Estimator |

Each page follows the brief's eight sections: hero, recognisable friction,
the workflow (five steps naming who, source and handoff, plus one exception
needing human judgement), a bounded first project (inputs, outputs, what
stays with the client, completion criteria), measures with a baseline agreed
in scoping, attributed evidence, the Russell card, and the next step.

## 2. Where things live

| File | Role |
|---|---|
| `lib/workflowSolutions.ts` | The seven records. Code, not Sanity, because they state first-project scope and client responsibilities: commercial wording that changes through review, like `lib/offers.ts`. |
| `components/WorkflowSolutionPage.tsx` | Shared template. Workflow is a plain ordered list (vertical on every width, readable by screen readers). |
| `components/FractionalLeadCard.tsx` | Russell card, approved copy from the brief, optional page sentence. Uses the existing `/team/russell-lack.png`; links to `/about`. Also placed on `/content-operations` after the audit tiers. |
| `app/solutions/[slug]/page.tsx` | Code records are checked first (no Sanity call); any other slug falls through to the Sanity `solutionPage`. Slug sets do not overlap (checked against production). |
| `app/solutions/page.tsx` | New "Start from your situation" section above the existing outcome cards, now headed "Or explore by outcome". |
| `components/Header.tsx` | Solutions menu: full-width "Start from your situation" row on desktop (a third column would overflow at 1024px); new heading group in the mobile accordion. |
| `app/page.tsx` | One link, "Start from your situation", added to the existing link row under the starting points. Nothing else on the homepage changed. |
| `app/sitemap.ts` | `/solutions` and the seven pages added. |
| `lib/offers.ts` | `SOLUTION_CONTEXT` labels, `isSolutionSlug()`, optional `solution` argument on `enquiryHref()`. |
| `components/ContactForm.tsx` | Reads `?solution=` against the fixed list: "About: A first project · Maritime suppliers". Unknown values are ignored. |
| `lib/analytics.ts`, `OfferViewTracker.tsx` | `solution` parameter on journey events (see `ANALYTICS.md`). |

## 3. Evidence used

Only published case studies, each with a note on why the workflow is
relevant. Since 5 October the cards no longer repeat each employer
attribution (Russell found it too prominent): one sentence above the cards
says the work is by the people behind ECM.DEV, that each case study says how
it was delivered, and that client names do not imply endorsement. The full
attribution stays at the foot of every case-study page, one click away, so
prior work is never presented as ECM.DEV delivery.

Export manufacturers: Jotun product finding; building-materials distributor service platform (replaced a second paints case, 5 October).
Engineering consultancies: project management consultancy relaunch; robotics
copywriting. SaaS and industrial tech: B2B software demand generation; FLIR
demand generation. Maritime suppliers: Wilhelmsen global platform. PE-backed:
Position Green unified positioning; Verdane due diligence (labelled as not
integration work). Professional services: Conexus interview-based case
studies; KLP editorial governance. Multilingual: Norwegian Seafood Council;
Visit Norway.

## 4. Conflicts and decisions to confirm

| # | Item | Handling |
|---|---|---|
| C1 | **O3 in `COMMERCIAL-JOURNEY-2026-09-27.md`** says a standalone trial project or pilot is "not offered". The brief makes a bounded first project the core of every page and states that a completed standalone project is a valid outcome. | Implemented per the brief (the newer decision). No price, duration or pilot product name is published; every page says scope, fee, timing and client involvement are agreed in writing first. **Confirmed by Russell, 5 October 2026:** the first-project framing replaces "not offered"; O3 closed in the commercial journey doc. |
| C2 | The brief proposed `/solutions` as a new hub; it already existed with five Sanity outcome pages. | Kept both: situations first, outcomes second. Nothing removed or renamed, so no redirects needed. |
| C3 | `/about` still says the free assessment leads to "a fixed-price build, usually delivered in one to two weeks, moving into a monthly retained service". This conflicts with the brief (no automatic retainer progression) and with D12 in the commercial journey doc. | **Fixed 5 October 2026** at Russell's request: "Start here" now names the ungated maturity assessment accurately and describes a first project with written scope, fee, timing and client time agreed first; ongoing support is optional and scoped separately. Hero, meta description, "Why this exists", "How we work" and "What makes this different" no longer imply a retainer. The secondary closing button is now "Discuss a first project". |
| C4 | The five Sanity outcome pages render titles as "… \| ECM.DEV \| ECM.DEV" because the layout template already appends the site name. | Fixed for the hub and the seven new pages only. |

## 5. Verification (5 October 2026)

| Check | Result |
|---|---|
| `tsc --noEmit` | Pass |
| `npm run check:sanity` | Pass |
| `next build` | Compiles and type-checks. Page-data collection stops on unrelated Sanity routes because this container has no Sanity credentials (pre-existing and environmental, as recorded on 27 September). Netlify's build is the real gate. |
| `npm run lint` | Not runnable: `next lint` was removed in Next 16, so the script fails before linting (pre-existing). |
| Dev server | All eight routes 200; unknown slug 404; `/`, `/content-operations`, `/contact` 200. |
| Titles and canonicals | Unique per page, single "\| ECM.DEV" suffix, canonical `https://ecm.dev/solutions/<slug>`. |
| Horizontal overflow | None at 390px or 1280px on the hub, all seven pages and `/content-operations`. |
| Screenshots | Mobile and desktop reviewed for the hub and two pages; dark mode reviewed; portrait loads. |
| Keyboard | Hero actions reachable by Tab with a visible 2px outline. |
| Contact context | `?offer=first-project&solution=maritime-suppliers` shows "About: A first project · Maritime suppliers"; a junk `solution` value is ignored. |
| Analytics | `offer_viewed` fires once with `offer = first-project`, `solution = <slug>`. |
| Copy | No em or en dashes, no placeholders, no prices, percentages or guarantees in the new copy. |
| Console | Same dev-only warnings on the new pages as on unchanged `/about` (pre-existing). |

Not verified here: case-study and Sanity-backed links rendering (no Sanity
locally; every case-study slug was checked against production), real form
delivery to Netlify, and GA4 receipt of `solution` (GTM step in `ANALYTICS.md`).

## 6. Left for Russell

- C1 (O3) is confirmed and C3 (`/about`) is fixed.
- Read the seven pages for factual fit, especially the workflow steps and exceptions, which describe typical roles rather than any one client.
- Add the `solution` variable and GA4 dimension in GTM (`ANALYTICS.md`).
- Missing assets: no sector-specific maritime second case study, and no case study yet delivered through ECM.DEV for any of the seven situations. The linked case studies say so in their attribution; replace with direct work as it becomes publishable.
