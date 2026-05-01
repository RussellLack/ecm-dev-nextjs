import React from "react";

/**
 * Per-blog-post line illustrations. Same colour vocabulary as
 * GuideIllustration and CaseStudyIllustration but with bolder central
 * motifs and minimal text — the previous version relied on small
 * type that didn't read at thumbnail size.
 *
 * Approach
 * --------
 * Six motifs keyed to common blog topics. A slug-derived seed varies
 * positions, accent counts, and lime-fill emphasis so two posts using
 * the same motif still produce different compositions.
 *
 *   CmsMigrationMotif    Source CMS  →  Target CMS (horizontal flow)
 *   DxpProductMotif      DXP hub fanning out to channels
 *   AiAgenticMotif       AI core brain with orbiting agent nodes
 *   AeoSearchMotif       Magnifying glass over a result with AI sparkle
 *   LocalisationMotif    Globe with regional swatches
 *   ImplementationMotif  Clipboard with checkmarks (oversized)
 *
 * Style invariants:
 *   viewBox     0 0 280 144
 *   primary     #316148   (G — ECM green)
 *   accent      #AAF870   (L — ECM lime)
 *   stroke      1.4 to 2.0 (bumped from previous 1.0-1.5 for legibility)
 *   text        fontSize 14+ where used at all
 */

const G = "#316148";
const L = "#AAF870";
const FILL_G = "rgba(49,97,72,0.06)";
const FILL_L = "rgba(170,248,112,0.18)";

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

// ─── CmsMigrationMotif ─────────────────────────────────────────────────
// Two CMS boxes side-by-side with a heavy lime arrow between them.
// Source = grey-filled (old), target = lime-filled (new). No labels.
function CmsMigrationMotif({ seed }: { seed: number }) {
  const accentRow = seed % 3;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* source CMS */}
      <rect x="14" y="22" width="100" height="100" rx="4" stroke={G} strokeWidth="1.6" fill={FILL_G} />
      <rect x="14" y="22" width="100" height="20" rx="4" stroke={G} strokeWidth="1.4" fill="white" />
      <circle cx="24" cy="32" r="2.5" fill={G} opacity="0.5" />
      <circle cx="32" cy="32" r="2.5" fill={G} opacity="0.5" />
      <circle cx="40" cy="32" r="2.5" fill={G} opacity="0.5" />
      {[0, 1, 2].map((i) => (
        <rect
          key={`s${i}`}
          x="22"
          y={50 + i * 16}
          width={i === 1 ? 70 : 84}
          height="6"
          rx="1"
          fill={G}
          opacity="0.45"
        />
      ))}

      {/* arrow */}
      <g stroke={L} strokeWidth="3.5" fill="none" strokeLinecap="round">
        <line x1="124" y1="72" x2="156" y2="72" markerEnd="url(#postCmsArrowBig)" />
      </g>

      {/* target CMS — lime-tinted */}
      <rect x="166" y="22" width="100" height="100" rx="4" stroke={L} strokeWidth="2" fill={FILL_L} />
      <rect x="166" y="22" width="100" height="20" rx="4" stroke={L} strokeWidth="1.6" fill="white" />
      <circle cx="176" cy="32" r="2.5" fill={L} />
      <circle cx="184" cy="32" r="2.5" fill={L} />
      <circle cx="192" cy="32" r="2.5" fill={L} />
      {[0, 1, 2].map((i) => (
        <rect
          key={`t${i}`}
          x="174"
          y={50 + i * 16}
          width={i === accentRow ? 84 : 70}
          height="6"
          rx="1"
          fill={i === accentRow ? L : G}
          opacity={i === accentRow ? 1 : 0.55}
        />
      ))}

      <defs>
        <marker id="postCmsArrowBig" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill={L} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── DxpProductMotif ───────────────────────────────────────────────────
// Central platform hub with channels fanning out. Reads as "DXP that
// powers many surfaces".
function DxpProductMotif({ seed }: { seed: number }) {
  const accent = seed % 5;
  // 5 channel destinations radiating out
  const channels = [
    { x: 44, y: 38 },
    { x: 44, y: 106 },
    { x: 236, y: 38 },
    { x: 236, y: 106 },
    { x: 240, y: 72 },
  ];
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* connecting lines */}
      <g stroke={G} strokeWidth="1.4" opacity="0.55">
        {channels.map((c, i) => (
          <line key={i} x1="140" y1="72" x2={c.x} y2={c.y} />
        ))}
      </g>
      {/* channel boxes */}
      {channels.map((c, i) => (
        <rect
          key={i}
          x={c.x - 14}
          y={c.y - 11}
          width="28"
          height="22"
          rx="3"
          stroke={i === accent ? L : G}
          strokeWidth={i === accent ? 2 : 1.4}
          fill={i === accent ? FILL_L : "white"}
        />
      ))}
      {/* small device-frame detail inside each channel */}
      {channels.map((c, i) => (
        <line
          key={`det${i}`}
          x1={c.x - 8}
          y1={c.y - 4}
          x2={c.x + 8}
          y2={c.y - 4}
          stroke={G}
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      {/* central DXP hub — bold rounded rect */}
      <rect x="106" y="50" width="68" height="44" rx="6" stroke={G} strokeWidth="2" fill={FILL_G} />
      <rect x="106" y="50" width="68" height="12" rx="6" stroke={G} strokeWidth="1.6" fill={L} />
      {/* hub icon: stacked horizontal bars */}
      <line x1="118" y1="74" x2="162" y2="74" stroke={G} strokeWidth="2" />
      <line x1="118" y1="82" x2="150" y2="82" stroke={G} strokeWidth="1.5" opacity="0.6" />
      <line x1="118" y1="88" x2="158" y2="88" stroke={G} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

// ─── AiAgenticMotif ────────────────────────────────────────────────────
// Bold AI core (rounded square with internal grid) with three orbiting
// agent nodes connected by lime dashed paths. Sparkles for AI cue.
function AiAgenticMotif({ seed }: { seed: number }) {
  const accent = seed % 3;
  const agents = [
    { x: 50, y: 50, label: "doc" },
    { x: 50, y: 96, label: "msg" },
    { x: 230, y: 72, label: "act" },
  ];
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* connecting dashed lines */}
      <g stroke={L} strokeWidth="1.6" strokeDasharray="4 3" fill="none">
        {agents.map((a, i) => (
          <line key={i} x1="140" y1="72" x2={a.x} y2={a.y} />
        ))}
      </g>

      {/* AI core — central rounded square with internal grid */}
      <rect x="112" y="44" width="56" height="56" rx="8" stroke={G} strokeWidth="2.2" fill={FILL_G} />
      <g stroke={G} strokeWidth="1" opacity="0.55">
        <line x1="124" y1="56" x2="156" y2="56" />
        <line x1="124" y1="68" x2="156" y2="68" />
        <line x1="124" y1="80" x2="156" y2="80" />
        <line x1="124" y1="92" x2="156" y2="92" />
        <line x1="132" y1="48" x2="132" y2="100" />
        <line x1="148" y1="48" x2="148" y2="100" />
      </g>
      {/* core nodes */}
      <circle cx="132" cy="68" r="3" fill={L} />
      <circle cx="148" cy="80" r="3" fill={L} />
      <circle cx="140" cy="56" r="2" fill={G} />

      {/* agent satellites */}
      {agents.map((a, i) => {
        const isAccent = i === accent;
        return (
          <g key={i}>
            <circle
              cx={a.x}
              cy={a.y}
              r={isAccent ? 14 : 11}
              stroke={isAccent ? L : G}
              strokeWidth={isAccent ? 2 : 1.6}
              fill={isAccent ? FILL_L : "white"}
            />
            {/* simple agent symbol — three dots */}
            <circle cx={a.x - 4} cy={a.y} r="1.5" fill={isAccent ? L : G} />
            <circle cx={a.x} cy={a.y} r="1.5" fill={isAccent ? L : G} />
            <circle cx={a.x + 4} cy={a.y} r="1.5" fill={isAccent ? L : G} />
          </g>
        );
      })}

      {/* AI sparkles (three small four-point stars) */}
      <g fill={L}>
        {[
          { x: 88, y: 24 },
          { x: 200, y: 28 },
          { x: 198, y: 118 },
        ].map((s, i) => (
          <path
            key={i}
            d={`M ${s.x} ${s.y - 5} L ${s.x + 1.5} ${s.y - 1.5} L ${s.x + 5} ${s.y} L ${s.x + 1.5} ${s.y + 1.5} L ${s.x} ${s.y + 5} L ${s.x - 1.5} ${s.y + 1.5} L ${s.x - 5} ${s.y} L ${s.x - 1.5} ${s.y - 1.5} Z`}
          />
        ))}
      </g>
    </svg>
  );
}

// ─── AeoSearchMotif ───────────────────────────────────────────────────
// Single oversized magnifying glass over a content card with a lime
// AI sparkle inside the lens. Reads as "AI looking at content".
function AeoSearchMotif({ seed }: { seed: number }) {
  // Slight rotation + accent line variation by seed
  const accentLineWidth = 70 + (seed % 50);
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* content card behind */}
      <rect x="34" y="34" width="160" height="84" rx="4" stroke={G} strokeWidth="1.6" fill="white" />
      {/* card "title" */}
      <rect x="48" y="48" width={accentLineWidth + 30} height="8" rx="1.5" fill={G} opacity="0.7" />
      {/* card body lines */}
      <line x1="48" y1="68" x2="180" y2="68" stroke={G} strokeWidth="1.4" opacity="0.45" />
      <line x1="48" y1="78" x2={48 + accentLineWidth} y2="78" stroke={G} strokeWidth="1.4" opacity="0.45" />
      <line x1="48" y1="88" x2="170" y2="88" stroke={G} strokeWidth="1.4" opacity="0.45" />
      <line x1="48" y1="98" x2={48 + accentLineWidth - 20} y2="98" stroke={G} strokeWidth="1.4" opacity="0.45" />

      {/* magnifying glass — large, oriented top-right */}
      <g>
        <circle cx="206" cy="56" r="40" stroke={L} strokeWidth="3" fill={FILL_L} />
        <line
          x1="234"
          y1="84"
          x2="262"
          y2="120"
          stroke={L}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* inner lens shine */}
        <path
          d="M 184 36 Q 198 30 212 36"
          stroke="white"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
      </g>

      {/* AI sparkles inside lens */}
      <g fill={G}>
        <path d="M 198 50 L 200 56 L 206 58 L 200 60 L 198 66 L 196 60 L 190 58 L 196 56 Z" />
      </g>
      <circle cx="218" cy="44" r="2.5" fill={G} />
      <circle cx="216" cy="68" r="2" fill={G} />
    </svg>
  );
}

// ─── LocalisationMotif ─────────────────────────────────────────────────
// A bold globe with three regional swatches stacked beside it. Swatches
// use lime / green / muted tones to evoke flag-like region indicators
// without text labels.
function LocalisationMotif({ seed }: { seed: number }) {
  const swatchCount = 4;
  const accent = seed % swatchCount;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* globe — large */}
      <g>
        <circle cx="80" cy="72" r="48" stroke={G} strokeWidth="2" fill={FILL_G} />
        <g stroke={G} strokeWidth="1.4" fill="none" opacity="0.55">
          <ellipse cx="80" cy="72" rx="48" ry="20" />
          <ellipse cx="80" cy="72" rx="48" ry="36" />
          <line x1="32" y1="72" x2="128" y2="72" />
          <line x1="80" y1="24" x2="80" y2="120" />
          <ellipse cx="80" cy="72" rx="22" ry="48" />
        </g>
        {/* pin marker */}
        <circle cx={70 + (seed % 24)} cy={56 + ((seed * 3) % 18)} r="4" fill={L} />
      </g>

      {/* horizontal connector */}
      <line x1="128" y1="72" x2="156" y2="72" stroke={G} strokeWidth="1.4" opacity="0.5" />

      {/* regional swatches — stacked rectangles with simple stripe pattern */}
      {Array.from({ length: swatchCount }).map((_, i) => {
        const y = 30 + i * 24;
        const isAccent = i === accent;
        return (
          <g key={i}>
            <rect
              x="166"
              y={y}
              width="92"
              height="18"
              rx="2"
              stroke={isAccent ? L : G}
              strokeWidth="1.6"
              fill={isAccent ? FILL_L : "white"}
            />
            {/* two stripes inside, like an abstract flag */}
            <rect x="170" y={y + 3} width="20" height="12" rx="1" fill={isAccent ? L : G} opacity="0.55" />
            <rect x="194" y={y + 6} width="58" height="3" rx="0.5" fill={G} opacity="0.4" />
            <rect x="194" y={y + 11} width="42" height="3" rx="0.5" fill={G} opacity="0.4" />
          </g>
        );
      })}
    </svg>
  );
}

// ─── ImplementationMotif ───────────────────────────────────────────────
// Clipboard with oversized checkmarks. Bold and direct — for "X clues"
// or "critical success factors" posts.
function ImplementationMotif({ seed }: { seed: number }) {
  const itemCount = 4;
  const checkedThrough = 1 + (seed % 3); // 1, 2, or 3 items already checked
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* clipboard back */}
      <rect x="50" y="14" width="180" height="120" rx="4" stroke={G} strokeWidth="2" fill="white" />
      {/* clipboard clip */}
      <rect x="116" y="6" width="48" height="16" rx="3" stroke={G} strokeWidth="2" fill={FILL_G} />
      <rect x="124" y="3" width="32" height="6" rx="1.5" stroke={G} strokeWidth="1.4" fill="white" />

      {/* checklist items — bigger boxes, bigger checks */}
      {Array.from({ length: itemCount }).map((_, i) => {
        const y = 36 + i * 24;
        const isChecked = i < checkedThrough;
        return (
          <g key={i}>
            {/* checkbox — 16x16 px */}
            <rect
              x="64"
              y={y - 8}
              width="16"
              height="16"
              rx="2"
              stroke={isChecked ? L : G}
              strokeWidth="2"
              fill={isChecked ? L : "white"}
            />
            {/* check mark — bold */}
            {isChecked && (
              <path
                d={`M 67 ${y} L 71 ${y + 4} L 77 ${y - 4}`}
                stroke={G}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* item line */}
            <line
              x1="92"
              y1={y}
              x2={92 + 110 + ((seed * (i + 1)) % 14)}
              y2={y}
              stroke={G}
              strokeWidth="2"
              opacity={isChecked ? 0.85 : 0.45}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Generic / fallback ────────────────────────────────────────────────
function GenericMotif({ seed }: { seed: number }) {
  const accent = seed % 3;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="20" width="180" height="104" rx="4" stroke={G} strokeWidth="2" fill={FILL_G} />
      <g stroke={G} strokeWidth="1.6" opacity="0.6">
        <line x1="68" y1="42" x2="212" y2="42" />
        <line x1="68" y1="60" x2="200" y2="60" />
        <line x1="68" y1="78" x2="190" y2="78" />
        <line x1="68" y1="96" x2="178" y2="96" />
      </g>
      <rect
        x="68"
        y={42 + accent * 18 - 2}
        width={70 + (seed % 50)}
        height="6"
        rx="1.5"
        fill={L}
      />
    </svg>
  );
}

// ─── Slug → motif mapping (14 posts) ──────────────────────────────────
type Motif = (props: { seed: number }) => React.JSX.Element;

const SLUG_TO_MOTIF: Record<string, Motif> = {
  "kentico-cadence-cuts-migration-risk": CmsMigrationMotif,
  "sanity-cms-upgrades-speed-cx-delivery": CmsMigrationMotif,
  "10-clues-that-show-your-cms-requires-upgrading": CmsMigrationMotif,
  "ibexa-v5-europe-s-b2b-dxp": DxpProductMotif,
  "the-b2b-playbook-for-ai-enhanced-dxps": DxpProductMotif,
  "sitecore-productivity-and-roi": DxpProductMotif,
  "hyland-content-innovation-cloud": DxpProductMotif,
  "agentic-cx-from-journeys-to-agents": AiAgenticMotif,
  "contentful-ai-workflows-boost-speed": AiAgenticMotif,
  "optimizing-efficiency-data-driven-solutions-for-modern-businesses":
    AiAgenticMotif,
  "optimizely-aeo-geo-ai-visibility": AeoSearchMotif,
  "navigate-digital-transformation-with-fab-partners-expertise":
    LocalisationMotif,
  "leveraging-local-social-media-trends-for-effective-engagement":
    LocalisationMotif,
  "unlocking-business-potential-with-tailored-cloud-solutions":
    ImplementationMotif,
};

export default function PostIllustration({ slug }: { slug?: string }) {
  if (!slug) return <GenericMotif seed={0} />;
  const Motif = SLUG_TO_MOTIF[slug] ?? GenericMotif;
  return <Motif seed={hashSlug(slug)} />;
}

export function hasPostIllustration(slug: string): boolean {
  return slug in SLUG_TO_MOTIF;
}
