import React from "react";

/**
 * Per-blog-post line illustrations in the same diagrammatic style as
 * GuideIllustration and CaseStudyIllustration. Used as a thumbnail
 * fallback wherever a post card renders without an editor-uploaded
 * mainImage.
 *
 * Approach
 * --------
 * Each post is mapped to one of 6 motif components keyed to common
 * blog topics. Within a motif, a slug-derived seed varies positions,
 * accent counts, and lime-fill emphasis so every post produces a
 * different composition while staying in the shared visual vocabulary.
 *
 *   CmsMigrationMotif    CMS upgrade / replacement / migration cadence
 *   DxpProductMotif      DXP launch / B2B DXP / playbook posts
 *   AiAgenticMotif       AI workflows, agentic, generative AI
 *   AeoSearchMotif       AEO / GEO / AI search visibility
 *   LocalisationMotif    Multilingual + regional content
 *   ImplementationMotif  Critical success factors / checklists
 *
 * Style invariants (match GuideIllustration / CaseStudyIllustration):
 *   viewBox     0 0 280 144
 *   primary     #316148        (G — ECM green)
 *   accent      #AAF870        (L — ECM lime)
 *   stroke      1.0 to 1.5
 *   fills       rgba versions of G and L at low alpha
 */

const G = "#316148";
const L = "#AAF870";
const FILL_G = "rgba(49,97,72,0.06)";
const FILL_L = "rgba(170,248,112,0.14)";

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

// ─── CmsMigrationMotif ─────────────────────────────────────────────────
// Two stacked CMS platforms with a transformation arrow between them.
// Different from the case-study CMS-migration motif: vertical orientation
// instead of horizontal, plus a "version step" callout.
function CmsMigrationMotif({ seed }: { seed: number }) {
  const upgrade = (seed & 1) === 0;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* old version */}
      <rect x="60" y="20" width="160" height="40" rx="3" stroke={G} strokeWidth="1.2" fill={FILL_G} />
      <line x1="72" y1="32" x2="208" y2="32" stroke={G} strokeWidth="1" />
      <line x1="72" y1="42" x2="180" y2="42" stroke={G} strokeWidth="1" opacity="0.5" />
      <line x1="72" y1="50" x2="160" y2="50" stroke={G} strokeWidth="1" opacity="0.5" />
      <text x="220" y="34" fontSize="9" fill={G} opacity="0.7" fontFamily="monospace">v1</text>
      {/* arrow */}
      <g stroke={upgrade ? L : G} strokeWidth="1.6" fill="none">
        <path d="M 140 64 L 140 80" markerEnd="url(#postCmsArrow)" />
      </g>
      {/* new version */}
      <rect x="60" y="84" width="160" height="40" rx="3" stroke={upgrade ? L : G} strokeWidth="1.4" fill={upgrade ? FILL_L : FILL_G} />
      <line x1="72" y1="96" x2="208" y2="96" stroke={G} strokeWidth="1" />
      <line x1="72" y1="106" x2="184" y2="106" stroke={G} strokeWidth="1" opacity="0.5" />
      <line x1="72" y1="114" x2="170" y2="114" stroke={G} strokeWidth="1" opacity="0.5" />
      <text x="220" y="98" fontSize="9" fill={G} fontFamily="monospace">v{2 + (seed % 3)}</text>
      {/* lime accent dots */}
      <circle cx={20 + (seed % 24)} cy="72" r="2.5" fill={L} />
      <circle cx={260 - ((seed * 3) % 24)} cy="72" r="2.5" fill={L} />
      <defs>
        <marker id="postCmsArrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill={upgrade ? L : G} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── DxpProductMotif ───────────────────────────────────────────────────
// Layered platform stack with a star accent — DXP product launches,
// playbooks, and B2B platform pieces.
function DxpProductMotif({ seed }: { seed: number }) {
  const layerCount = 4;
  const accent = seed % layerCount;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* stacked layers (DXP architecture) */}
      {Array.from({ length: layerCount }).map((_, i) => {
        const w = 200 - i * 8;
        const x = (280 - w) / 2;
        const y = 38 + i * 18;
        const isAccent = i === accent;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={w}
              height="14"
              rx="2"
              stroke={isAccent ? L : G}
              strokeWidth="1.2"
              fill={isAccent ? FILL_L : "white"}
            />
            <line
              x1={x + 8}
              y1={y + 7}
              x2={x + 30}
              y2={y + 7}
              stroke={G}
              strokeWidth="1"
              opacity="0.45"
            />
            <line
              x1={x + 36}
              y1={y + 7}
              x2={x + w - 16}
              y2={y + 7}
              stroke={G}
              strokeWidth="1"
              opacity="0.3"
            />
          </g>
        );
      })}
      {/* hero star marking the launch / accent layer */}
      <g
        transform={`translate(${50 + (seed % 22)}, 24)`}
        stroke={L}
        strokeWidth="1.5"
        fill={FILL_L}
      >
        <path d="M 0 -8 L 2 -2 L 8 -2 L 3 2 L 5 8 L 0 4 L -5 8 L -3 2 L -8 -2 L -2 -2 Z" />
      </g>
      {/* base platform line */}
      <line x1="20" y1="124" x2="260" y2="124" stroke={G} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

// ─── AiAgenticMotif ────────────────────────────────────────────────────
// Central neural/agent node with surrounding satellite nodes connected
// by lime paths. Used for agentic AI, AI workflows, generative AI posts.
function AiAgenticMotif({ seed }: { seed: number }) {
  const satelliteCount = 5 + (seed % 3); // 5, 6, 7
  const accent = seed % satelliteCount;
  const satellites = Array.from({ length: satelliteCount }).map((_, i) => {
    const angle = (i / satelliteCount) * Math.PI * 2 - Math.PI / 2 + (seed % 7) * 0.05;
    const r = 44 + (i % 2) * 6;
    return {
      x: 140 + Math.cos(angle) * r,
      y: 72 + Math.sin(angle) * r * 0.7, // squash vertically
    };
  });
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* connections — lime, dashed feel */}
      <g stroke={L} strokeWidth="1.2" opacity="0.7">
        {satellites.map((s, i) => (
          <line
            key={i}
            x1="140"
            y1="72"
            x2={s.x}
            y2={s.y}
            strokeDasharray={i === accent ? "0" : "3 3"}
          />
        ))}
      </g>
      {/* satellite nodes */}
      {satellites.map((s, i) => (
        <g key={i}>
          <circle
            cx={s.x}
            cy={s.y}
            r={i === accent ? 8 : 6}
            stroke={i === accent ? L : G}
            strokeWidth="1.3"
            fill={i === accent ? FILL_L : "white"}
          />
          <circle cx={s.x} cy={s.y} r="2" fill={i === accent ? L : G} />
        </g>
      ))}
      {/* central agent — hexagonal-ish shape */}
      <g stroke={G} strokeWidth="1.5" fill={FILL_G}>
        <path d="M 140 56 L 156 64 L 156 80 L 140 88 L 124 80 L 124 64 Z" />
      </g>
      <circle cx="140" cy="72" r="4" fill={L} />
      {/* AI sparkle accents */}
      <g fill={L}>
        {[0, 1, 2].map((i) => {
          const x = 30 + ((seed * (i + 1)) % 22);
          const y = 22 + i * 38;
          return <circle key={i} cx={x} cy={y} r="1.5" />;
        })}
      </g>
    </svg>
  );
}

// ─── AeoSearchMotif ───────────────────────────────────────────────────
// Magnifying glass over search-result cards. For AEO / GEO / AI
// visibility posts.
function AeoSearchMotif({ seed }: { seed: number }) {
  const accent = seed % 3;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* search result cards */}
      {[0, 1, 2].map((i) => {
        const y = 30 + i * 28;
        const isAccent = i === accent;
        return (
          <g key={i}>
            <rect
              x="36"
              y={y}
              width="180"
              height="20"
              rx="2"
              stroke={isAccent ? L : G}
              strokeWidth="1.2"
              fill={isAccent ? FILL_L : "white"}
            />
            <line
              x1="44"
              y1={y + 8}
              x2={44 + 90 + (seed % 30)}
              y2={y + 8}
              stroke={G}
              strokeWidth="1"
              opacity="0.55"
            />
            <line
              x1="44"
              y1={y + 14}
              x2={44 + 60 - (seed % 22)}
              y2={y + 14}
              stroke={G}
              strokeWidth="1"
              opacity="0.35"
            />
          </g>
        );
      })}
      {/* magnifying glass */}
      <g stroke={L} strokeWidth="2" fill="none">
        <circle cx="225" cy="46" r="20" fill={FILL_L} />
        <line x1="240" y1="60" x2="258" y2="78" />
      </g>
      {/* AI sparkles inside the magnifier */}
      <g fill={L}>
        <circle cx="220" cy="42" r="1.5" />
        <circle cx="232" cy="48" r="1.5" />
        <circle cx="220" cy="52" r="1" />
      </g>
      {/* baseline */}
      <line x1="20" y1="124" x2="260" y2="124" stroke={G} strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

// ─── LocalisationMotif ─────────────────────────────────────────────────
// Globe with translation tags. Same iconographic vocabulary as the
// case-study version, but slightly different layout so a localisation
// post and a localisation case study don't look identical when both
// appear on the same page.
function LocalisationMotif({ seed }: { seed: number }) {
  const tagCount = 3 + (seed % 3); // 3, 4, 5 language tags
  const accent = seed % tagCount;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* small globe at top-left */}
      <g>
        <circle cx="46" cy="40" r="22" stroke={G} strokeWidth="1.2" fill={FILL_G} />
        <ellipse cx="46" cy="40" rx="22" ry="9" stroke={G} strokeWidth="1" fill="none" opacity="0.45" />
        <line x1="24" y1="40" x2="68" y2="40" stroke={G} strokeWidth="1" opacity="0.45" />
        <line x1="46" y1="18" x2="46" y2="62" stroke={G} strokeWidth="1" opacity="0.45" />
      </g>
      {/* horizontal language band */}
      <line x1="80" y1="40" x2="260" y2="40" stroke={G} strokeWidth="1" opacity="0.4" />
      <circle cx="80" cy="40" r="3" fill={L} />
      <circle cx="260" cy="40" r="3" fill={L} />
      {/* page rows in different languages, fanning down */}
      {Array.from({ length: tagCount }).map((_, i) => {
        const y = 76 + i * 14;
        const isAccent = i === accent;
        return (
          <g key={i}>
            <rect
              x="36"
              y={y - 6}
              width="208"
              height="12"
              rx="1.5"
              stroke={isAccent ? L : G}
              strokeWidth="1.2"
              fill={isAccent ? FILL_L : "white"}
            />
            <line
              x1="44"
              y1={y}
              x2="100"
              y2={y}
              stroke={G}
              strokeWidth="0.8"
              opacity="0.5"
            />
            <line
              x1="108"
              y1={y}
              x2={108 + (i % 2 === 0 ? 80 : 60)}
              y2={y}
              stroke={G}
              strokeWidth="0.8"
              opacity="0.35"
            />
            <text
              x="220"
              y={y + 3}
              fontSize="7"
              fill={isAccent ? G : G}
              opacity={isAccent ? "0.9" : "0.6"}
              fontFamily="monospace"
            >
              {["EN", "FR", "DE", "JA", "ES", "PT"][(i + (seed % 3)) % 6]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── ImplementationMotif ───────────────────────────────────────────────
// Numbered checklist — for posts about success factors / clues / lists.
function ImplementationMotif({ seed }: { seed: number }) {
  const itemCount = 4 + (seed % 2); // 4 or 5
  const accent = seed % itemCount;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* clipboard frame */}
      <rect x="50" y="14" width="180" height="116" rx="3" stroke={G} strokeWidth="1.2" fill="white" />
      <rect x="110" y="8" width="60" height="14" rx="2" stroke={G} strokeWidth="1.2" fill={FILL_G} />
      {/* checklist items */}
      {Array.from({ length: itemCount }).map((_, i) => {
        const y = 36 + i * 20;
        const isAccent = i === accent;
        return (
          <g key={i}>
            {/* checkbox */}
            <rect
              x="64"
              y={y - 6}
              width="12"
              height="12"
              rx="1.5"
              stroke={isAccent ? L : G}
              strokeWidth="1.4"
              fill={isAccent ? L : "white"}
            />
            {/* check mark on accent */}
            {isAccent && (
              <path
                d={`M 66 ${y} L 70 ${y + 3} L 74 ${y - 3}`}
                stroke={G}
                strokeWidth="1.5"
                fill="none"
              />
            )}
            {/* item text lines */}
            <line
              x1="84"
              y1={y - 2}
              x2={84 + 110 + ((seed * (i + 1)) % 22)}
              y2={y - 2}
              stroke={G}
              strokeWidth="1"
              opacity={isAccent ? "0.85" : "0.55"}
            />
            <line
              x1="84"
              y1={y + 4}
              x2={84 + 70 + ((seed * (i + 2)) % 18)}
              y2={y + 4}
              stroke={G}
              strokeWidth="1"
              opacity={isAccent ? "0.7" : "0.35"}
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
      <rect x="50" y="20" width="180" height="104" rx="3" stroke={G} strokeWidth="1.2" fill={FILL_G} />
      <g stroke={G} strokeWidth="1" opacity="0.55">
        <line x1="68" y1="40" x2="212" y2="40" />
        <line x1="68" y1="56" x2="200" y2="56" />
        <line x1="68" y1="72" x2="190" y2="72" />
        <line x1="68" y1="88" x2="178" y2="88" />
        <line x1="68" y1="104" x2="170" y2="104" />
      </g>
      {/* lime emphasis bar — varies by seed */}
      <rect
        x="68"
        y={40 + accent * 16 - 2}
        width={60 + (seed % 50)}
        height="4"
        rx="1"
        fill={L}
      />
      <circle cx="216" cy={36 + accent * 26} r="3" fill={L} />
    </svg>
  );
}

// ─── Slug → motif mapping (14 posts) ──────────────────────────────────
type Motif = (props: { seed: number }) => React.JSX.Element;

const SLUG_TO_MOTIF: Record<string, Motif> = {
  // CMS migration / upgrade
  "kentico-cadence-cuts-migration-risk": CmsMigrationMotif,
  "sanity-cms-upgrades-speed-cx-delivery": CmsMigrationMotif,
  "10-clues-that-show-your-cms-requires-upgrading": CmsMigrationMotif,
  // DXP products / playbooks
  "ibexa-v5-europe-s-b2b-dxp": DxpProductMotif,
  "the-b2b-playbook-for-ai-enhanced-dxps": DxpProductMotif,
  "sitecore-productivity-and-roi": DxpProductMotif,
  "hyland-content-innovation-cloud": DxpProductMotif,
  // AI / agentic / generative
  "agentic-cx-from-journeys-to-agents": AiAgenticMotif,
  "contentful-ai-workflows-boost-speed": AiAgenticMotif,
  "optimizing-efficiency-data-driven-solutions-for-modern-businesses":
    AiAgenticMotif, // "How Generative AI Is Changing Content Marketing"
  // AEO / GEO / search visibility
  "optimizely-aeo-geo-ai-visibility": AeoSearchMotif,
  // localisation / regional
  "navigate-digital-transformation-with-fab-partners-expertise":
    LocalisationMotif, // "Website Localization for Static and Dynamic Websites"
  "leveraging-local-social-media-trends-for-effective-engagement":
    LocalisationMotif,
  // implementation / success factors
  "unlocking-business-potential-with-tailored-cloud-solutions":
    ImplementationMotif, // "Critical Success Factors for ECM/CMS Implementation"
};

// ─── Public component ──────────────────────────────────────────────────
export default function PostIllustration({ slug }: { slug?: string }) {
  if (!slug) return <GenericMotif seed={0} />;
  const Motif = SLUG_TO_MOTIF[slug] ?? GenericMotif;
  return <Motif seed={hashSlug(slug)} />;
}

export function hasPostIllustration(slug: string): boolean {
  return slug in SLUG_TO_MOTIF;
}
