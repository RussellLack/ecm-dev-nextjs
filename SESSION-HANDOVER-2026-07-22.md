# ECM.DEV session handover, 22 July 2026

Two workstreams this session: a navigation consolidation, and an incident where the Sanity API request quota was exhausted and blocked deploys. Everything below is the state as of 22 July 2026.

## 1. Navigation consolidation

The header had grown to nine top-level items (Home, Problems We Solve, Solutions, Work, Services, Assessments, Briefings, Guides, Blog, Contact) plus the CTA. It was consolidated to four primary items plus the CTA:

* **Solutions**: a mega menu with two columns, "Start with a problem" (the five problem pages) and "Explore by outcome" (the five solution pages), with a "Ready to engage, see services and pricing" callout across the foot that links to the commercial pages.
* **Work**: a plain link to the case studies.
* **Insights**: a mega menu with the three executive briefings (with standfirsts) on the left and All briefings, Guides and Blog on the right.
* **Services**: kept as its own top-level item because it is the only page set with a concrete offer and pricing. A compact panel lists the three offers with a "Fixed-scope engagements with clear pricing" line.
* Contact sits as a quiet secondary link, then the "Take the assessment" pill. Home is dropped (the logo covers it). Mobile is a clean accordion.

Nav menu data is hardcoded in the component, so the header renders without any Sanity dependency.

File: `components/Header.tsx`. Committed on branch `nav-consolidation` as `6bbc9a4`. Type-checked clean (tsc --noEmit exit 0).

An interactive offline preview of this nav was produced as `nav-preview.html` for review while deploys were blocked.

## 2. Sanity API quota incident

The Netlify deploy of the `nav-consolidation` branch failed. The build compiled and TypeScript passed; the failure was a Sanity `402 plan_limit_reached` during "Collecting page data" while building `/guide/[slug]`. The main Sanity project `0dep7ult` had reached 100% of its monthly API request quota on a Free (or Growth Trial) plan.

Per Sanity's plans documentation, once a Free project reaches 100% of any request bucket, its public data plane is hard-blocked until the quota resets on the 1st of the month or the project is upgraded to Growth (which enables overage and unblocks instantly). The Studio keeps working, which is why content can still be edited.

### Root cause

The read client `lib/sanity.server.ts` ran with `useCdn: false` and a read token, so every read hit Sanity's small, uncached API request bucket rather than the larger CDN bucket. Combined with roughly two dozen routes on 60-second ISR revalidation and repeated no-cache production rebuilds, this drained the monthly quota.

### Fix applied (validated, in the working tree)

* `lib/sanity.server.ts`: `useCdn: true`. Verified that `@sanity/client` 6.29.1 keeps `useCdn: true` with a token present and routes to `apicdn.sanity.io`, so the private-dataset security model (unauthenticated requests get 401) is preserved. The client is read-only, so moving it to the CDN cannot affect any writes.
* ISR revalidate windows raised from 60s to 3600s across 21 route files, cutting revalidation reads.
* Type-checked clean (tsc --noEmit exit 0, zero errors).

At handover these 22 files were staged in the working tree, ready to commit alongside the header.

### Decision

Russell chose to WAIT for the monthly quota reset (around 1 August) rather than upgrade to Growth.

## Current live state

Production is deploy `6a614a52...`, commit `e90fadf` ("Phase 2"), branch `main`, state ready (built at 22:56, about fifteen minutes before the quota was exhausted, so its build-time pages have real content; Lighthouse performance 98). The homepage renders. New Sanity-backed routes render on demand and therefore currently 404 during the outage: `ecm.dev/briefings` returns 404, and `/problems`, `/solutions` and the briefing detail pages behave the same way. The live menu is still the older nav, which does not link to those routes, so a visitor browsing normally does not reach them; only a direct link does.

### Optional rollback while waiting

Netlify can re-publish any earlier successful deploy instantly without rebuilding (Deploys, pick a deploy, Publish deploy), which makes no Sanity calls and works during the block. The clean target is a pre-repositioning deploy, so the whole site is coherent with no half-live routes. Trade-off: the repositioning is not visible until the redeploy after the reset. This cannot be driven from the Netlify MCP tools (the only write operation triggers a fresh build, which would fail on the quota); it is a manual action in the Netlify dashboard.

## Outstanding actions

1. Commit the Sanity consumption fix on `nav-consolidation` (if not already done).
2. After the quota resets (around 1 August): in Russell's own terminal, clear `.git/index.lock`, merge `nav-consolidation` into `main`, and push. This first post-reset build should succeed and carries the CDN fix, so consumption stays low.
3. Run `npx sanity deploy` so the new "Cornerstone Essay" schema type appears in the Studio at ecm-dev.sanity.studio.
4. Optionally roll back to a pre-repositioning deploy in Netlify if the currently 404ing routes are a concern before then.

A scheduled reminder for 1 August 2026 was created to prompt the redeploy.

## Why the API quota was consumed (analysis)

The heavy consumers, in likely order of impact:

1. **Uncached reads (`useCdn: false`).** Every read, at build time and on every ISR revalidation, went to the metered API request bucket instead of the CDN. This is the single biggest multiplier and is what the fix addresses.
2. **Frequent no-cache rebuilds.** Netlify reported "No build cache found." Each full build runs `generateStaticParams` across twelve dynamic collection routes (guides, case studies, briefings, problems, solutions, platforms, industries, intel, blog tags, guide series and tags) plus per-page queries. With a large content set (on the order of 50 guides and 71 case studies), a single from-scratch build issues thousands of API requests. There were many builds this month, including several today.
3. **Short 60-second revalidation across roughly two dozen routes.** Under any steady traffic, including search-engine and AI crawlers, each page refetched Sanity up to once a minute, and every refetch counted against the API bucket.

Nineteen routes query Sanity; twelve of them fan out over collections at build time.

### Which days (proxy)

Exact daily API usage is only available in the Sanity management dashboard: manage.sanity.io, project `0dep7ult`, API, Usage, where a day-by-day graph is shown. As a proxy from git history, commit activity in July (each push triggers a build) concentrated on:

* 9 July: 6 commits
* 12 July: 4 commits
* 13 July: 3 commits
* **14 July: 17 commits (heaviest day)**
* 17 July: 1 commit
* 18 July: 4 commits
* 21 to 23 July: the repositioning work, with several production deploys

Build bursts are only part of the total; runtime revalidation and crawler traffic between builds also consumed the bucket and do not show in git. The authoritative daily breakdown is the Sanity usage graph.

## Key references

* Repo: `/Users/russell/Claude-Projects/ecm-dev-nextjs`
* Branch: `nav-consolidation`, header commit `6bbc9a4`
* Netlify site: `tangerine-blini-ad1e27`, site id `f7e70ebb-aad2-4c0f-a0e1-b3b4ef0b6ead`, production commit `e90fadf`
* Sanity project: `0dep7ult` ("ecm-dev-studio"); separate intel project `288or5eh`
* Sanity usage dashboard: manage.sanity.io, project `0dep7ult`, API, Usage
