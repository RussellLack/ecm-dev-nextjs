import React from "react";

/**
 * Per-blog-post line illustrations.
 *
 * One bespoke composition per slug — no shared motifs, no seed-based
 * variation. Same visual vocabulary as GuideIllustration and
 * CaseStudyIllustration: viewBox 0 0 280 144, two colours
 * (G=#316148, L=#AAF870), 1.4-2.2 stroke widths, faint rgba fills.
 *
 * Each illustration is tailored to its post's specific subject:
 *   01  Kentico cadence            release-train timeline
 *   02  Agentic CX                 linear journey -> agent network
 *   03  Sanity speed               CMS box with speed lines
 *   04  Sitecore productivity      lock + ascending key
 *   05  Ibexa v5 B2B DXP           map outline + B2B trade flow
 *   06  Hyland cloud federation    cloud over multiple repositories
 *   07  Contentful AI workflows    workflow steps with lightning
 *   08  Optimizely AEO/GEO         magnifier with ranked AI results
 *   09  Website localisation       browser + language flag tabs
 *   10  B2B DXP playbook           open book with phase markers
 *   11  10 clues your CMS          numbered grid 3x3+1 with warnings
 *   12  Local social trends        chat bubbles + trending arrow
 *   13  Generative AI marketing    sparkle emitting content tiles
 *   14  ECM/CMS CSFs               classical pillars (foundations)
 *   default                        plain document fallback
 */

const G = "#316148";
const L = "#AAF870";
const FILL_G = "rgba(49,97,72,0.06)";
const FILL_L = "rgba(170,248,112,0.18)";

// ─── 01: Kentico cadence — release-train timeline ─────────────────────
function KenticoCadence() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* timeline rail */}
      <line x1="20" y1="72" x2="260" y2="72" stroke={G} strokeWidth="1.6" />
      {/* release stations */}
      {[40, 100, 160, 220].map((x, i) => (
        <g key={i}>
          <circle
            cx={x}
            cy="72"
            r={i === 2 ? 12 : 9}
            stroke={i === 2 ? L : G}
            strokeWidth={i === 2 ? 2.2 : 1.6}
            fill={i === 2 ? FILL_L : "white"}
          />
          {/* tick mark below */}
          <line x1={x} y1="86" x2={x} y2="100" stroke={G} strokeWidth="1.4" />
          {/* version step blocks above */}
          <rect
            x={x - 14}
            y={36 - i * 4}
            width="28"
            height={20 + i * 4}
            rx="2"
            stroke={G}
            strokeWidth="1.4"
            fill={i === 2 ? FILL_L : "white"}
          />
        </g>
      ))}
      {/* current train */}
      <g transform="translate(160, 72)">
        <circle r="4" fill={L} />
      </g>
      {/* arrow at end */}
      <line x1="234" y1="72" x2="252" y2="72" stroke={L} strokeWidth="2" markerEnd="url(#kArrow)" />
      <defs>
        <marker id="kArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill={L} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── 02: Agentic CX — linear journey transforms into agent network ────
function AgenticCx() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* left side: linear journey (4 dots on a line) */}
      <line x1="22" y1="72" x2="118" y2="72" stroke={G} strokeWidth="1.6" />
      {[28, 60, 92, 118].map((x, i) => (
        <circle key={i} cx={x} cy="72" r="6" stroke={G} strokeWidth="1.6" fill="white" />
      ))}
      {/* transition arrow */}
      <line x1="124" y1="72" x2="156" y2="72" stroke={L} strokeWidth="3" markerEnd="url(#agArrow)" />
      {/* right side: agent network (central + 4 satellites) */}
      <g>
        {/* central agent — hexagonal */}
        <path
          d="M 218 56 L 232 64 L 232 80 L 218 88 L 204 80 L 204 64 Z"
          stroke={G}
          strokeWidth="2"
          fill={FILL_G}
        />
        <circle cx="218" cy="72" r="4" fill={L} />
        {/* satellites */}
        {[
          { x: 178, y: 38 },
          { x: 178, y: 106 },
          { x: 258, y: 38 },
          { x: 258, y: 106 },
        ].map((s, i) => (
          <g key={i}>
            <line
              x1="218"
              y1="72"
              x2={s.x}
              y2={s.y}
              stroke={L}
              strokeWidth="1.4"
              strokeDasharray="3 3"
            />
            <circle cx={s.x} cy={s.y} r="7" stroke={L} strokeWidth="1.6" fill={FILL_L} />
            <circle cx={s.x} cy={s.y} r="2.5" fill={G} />
          </g>
        ))}
      </g>
      <defs>
        <marker id="agArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill={L} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── 03: Sanity speed — CMS box with motion lines ─────────────────────
function SanitySpeed() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* speed lines behind */}
      <g stroke={L} strokeWidth="2" strokeLinecap="round" opacity="0.85">
        <line x1="20" y1="44" x2="80" y2="44" />
        <line x1="14" y1="72" x2="92" y2="72" />
        <line x1="20" y1="100" x2="76" y2="100" />
        <line x1="34" y1="58" x2="78" y2="58" opacity="0.5" />
        <line x1="34" y1="86" x2="78" y2="86" opacity="0.5" />
      </g>
      {/* CMS box, leaning forward */}
      <g transform="translate(0, 0)">
        <path
          d="M 100 32 L 240 32 L 246 128 L 106 128 Z"
          stroke={G}
          strokeWidth="2"
          fill={FILL_G}
        />
        {/* header */}
        <path
          d="M 100 32 L 240 32 L 242 50 L 102 50 Z"
          fill="white"
          stroke={G}
          strokeWidth="1.6"
        />
        {/* dots in header */}
        <circle cx="112" cy="41" r="2" fill={G} opacity="0.5" />
        <circle cx="120" cy="41" r="2" fill={G} opacity="0.5" />
        <circle cx="128" cy="41" r="2" fill={G} opacity="0.5" />
        {/* content lines */}
        <line x1="116" y1="68" x2="220" y2="68" stroke={G} strokeWidth="1.6" />
        <line x1="116" y1="80" x2="200" y2="80" stroke={G} strokeWidth="1.4" opacity="0.55" />
        <line x1="116" y1="92" x2="208" y2="92" stroke={G} strokeWidth="1.4" opacity="0.55" />
        <rect x="116" y="102" width="60" height="6" rx="1" fill={L} />
        <line x1="116" y1="116" x2="180" y2="116" stroke={G} strokeWidth="1.4" opacity="0.4" />
      </g>
      {/* trailing speed wedge */}
      <path d="M 252 64 L 270 72 L 252 80 Z" fill={L} />
    </svg>
  );
}

// ─── 04: Sitecore productivity — lock + ascending bars (unlocked ROI) ─
function SitecoreProductivity() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* padlock — body + shackle, unlocked */}
      <g>
        {/* shackle, raised (unlocked) */}
        <path
          d="M 56 60 L 56 38 Q 56 22 72 22 Q 88 22 88 38"
          stroke={G}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* body */}
        <rect x="44" y="60" width="56" height="44" rx="4" stroke={G} strokeWidth="2" fill={FILL_G} />
        {/* keyhole */}
        <circle cx="72" cy="78" r="5" stroke={G} strokeWidth="1.6" fill="white" />
        <path d="M 72 80 L 72 92" stroke={G} strokeWidth="2" />
      </g>
      {/* ascending bars on the right (productivity) */}
      <g>
        {[34, 50, 70, 92].map((h, i) => {
          const x = 134 + i * 30;
          return (
            <rect
              key={i}
              x={x}
              y={120 - h}
              width="22"
              height={h}
              rx="2"
              stroke={i === 3 ? L : G}
              strokeWidth={i === 3 ? 2 : 1.6}
              fill={i === 3 ? FILL_L : "white"}
            />
          );
        })}
        {/* trend arrow */}
        <line
          x1="138"
          y1={120 - 34 + 8}
          x2="244"
          y2={120 - 92 - 8}
          stroke={L}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="244" cy={120 - 92 - 8} r="4" fill={L} />
      </g>
    </svg>
  );
}

// ─── 05: Ibexa v5 — Europe B2B DXP, abstract map + B2B trade flow ─────
function IbexaV5() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* "Europe" abstracted — soft hex shape */}
      <path
        d="M 50 36 L 110 28 L 142 50 L 138 96 L 92 116 L 44 92 Z"
        stroke={G}
        strokeWidth="2"
        fill={FILL_G}
      />
      {/* internal grid lines for map feel */}
      <g stroke={G} strokeWidth="1" opacity="0.35">
        <line x1="60" y1="50" x2="130" y2="50" />
        <line x1="55" y1="72" x2="138" y2="72" />
        <line x1="60" y1="94" x2="128" y2="94" />
        <line x1="80" y1="32" x2="80" y2="110" />
        <line x1="110" y1="30" x2="110" y2="112" />
      </g>
      {/* node markers — country pins */}
      <circle cx="78" cy="58" r="5" fill={L} />
      <circle cx="112" cy="80" r="5" fill={L} />
      <circle cx="86" cy="98" r="4" fill={G} />
      {/* B2B trade arrow from map to box on right */}
      <g stroke={L} strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M 148 72 Q 178 62 198 72" markerEnd="url(#ibArr1)" />
        <path d="M 198 72 Q 178 82 148 72" markerEnd="url(#ibArr2)" opacity="0.7" />
      </g>
      {/* B2B partner card on right */}
      <rect x="200" y="48" width="64" height="48" rx="4" stroke={G} strokeWidth="1.8" fill="white" />
      {/* "B2B" suggested by stacked pairs of bars */}
      <g stroke={G} strokeWidth="1.6">
        <line x1="210" y1="64" x2="254" y2="64" />
        <line x1="210" y1="74" x2="246" y2="74" opacity="0.55" />
        <line x1="210" y1="84" x2="252" y2="84" opacity="0.55" />
      </g>
      <defs>
        <marker id="ibArr1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill={L} />
        </marker>
        <marker id="ibArr2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill={L} opacity="0.7" />
        </marker>
      </defs>
    </svg>
  );
}

// ─── 06: Hyland cloud federation — cloud over multiple repositories ───
function HylandCloud() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* cloud */}
      <path
        d="M 90 48 Q 86 32 110 30 Q 124 18 144 26 Q 158 22 168 36 Q 192 36 188 56 Q 196 64 188 74 L 96 74 Q 80 70 90 48 Z"
        stroke={G}
        strokeWidth="2"
        fill={FILL_G}
      />
      {/* connecting lines from cloud to repositories */}
      <g stroke={G} strokeWidth="1.6" opacity="0.55">
        <line x1="116" y1="74" x2="80" y2="100" />
        <line x1="140" y1="74" x2="140" y2="100" />
        <line x1="164" y1="74" x2="200" y2="100" />
      </g>
      {/* three repository boxes */}
      {[
        { x: 56, y: 100 },
        { x: 116, y: 100 },
        { x: 176, y: 100 },
      ].map((r, i) => {
        const isAccent = i === 1;
        return (
          <g key={i}>
            <rect
              x={r.x}
              y={r.y}
              width="48"
              height="32"
              rx="3"
              stroke={isAccent ? L : G}
              strokeWidth={isAccent ? 2 : 1.6}
              fill={isAccent ? FILL_L : "white"}
            />
            <line
              x1={r.x + 6}
              y1={r.y + 11}
              x2={r.x + 38}
              y2={r.y + 11}
              stroke={G}
              strokeWidth="1.4"
              opacity="0.55"
            />
            <line
              x1={r.x + 6}
              y1={r.y + 21}
              x2={r.x + 30}
              y2={r.y + 21}
              stroke={G}
              strokeWidth="1.4"
              opacity="0.4"
            />
          </g>
        );
      })}
      {/* federation accent — small spark */}
      <circle cx="140" cy="50" r="3" fill={L} />
    </svg>
  );
}

// ─── 07: Contentful AI workflows — workflow with lightning bolt ───────
function ContentfulAiWorkflows() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* workflow steps */}
      {[0, 1, 2].map((i) => {
        const x = 24 + i * 76;
        const isAccent = i === 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y="48"
              width="56"
              height="48"
              rx="3"
              stroke={isAccent ? L : G}
              strokeWidth={isAccent ? 2 : 1.6}
              fill={isAccent ? FILL_L : "white"}
            />
            {/* step icon — three lines */}
            <line x1={x + 8} y1="64" x2={x + 48} y2="64" stroke={G} strokeWidth="1.6" />
            <line x1={x + 8} y1="74" x2={x + 40} y2="74" stroke={G} strokeWidth="1.4" opacity="0.55" />
            <line x1={x + 8} y1="84" x2={x + 44} y2="84" stroke={G} strokeWidth="1.4" opacity="0.55" />
            {/* arrow to next */}
            {i < 2 && (
              <line
                x1={x + 60}
                y1="72"
                x2={x + 72}
                y2="72"
                stroke={G}
                strokeWidth="1.6"
                markerEnd="url(#cfArr)"
              />
            )}
          </g>
        );
      })}
      {/* lightning bolt on top, accelerating */}
      <path
        d="M 160 8 L 138 56 L 158 56 L 144 100 L 188 44 L 168 44 Z"
        fill={L}
        stroke={G}
        strokeWidth="1.6"
      />
      {/* trailing sparkles */}
      <circle cx="218" cy="20" r="2.5" fill={L} />
      <circle cx="240" cy="36" r="2" fill={L} />
      <circle cx="232" cy="60" r="1.5" fill={L} />
      <defs>
        <marker id="cfArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" fill={G} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── 08: Optimizely AEO/GEO — magnifier over ranked AI results ────────
function OptimizelyAeo() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* ranked result list */}
      {[0, 1, 2, 3].map((i) => {
        const y = 28 + i * 24;
        const isTop = i === 0;
        return (
          <g key={i}>
            {/* rank number circle */}
            <circle
              cx="36"
              cy={y + 8}
              r="11"
              stroke={isTop ? L : G}
              strokeWidth={isTop ? 2 : 1.6}
              fill={isTop ? L : "white"}
            />
            <text
              x="36"
              y={y + 12}
              fontSize="14"
              fill={isTop ? G : G}
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="middle"
            >
              {i + 1}
            </text>
            {/* result line */}
            <line
              x1="56"
              y1={y + 4}
              x2={isTop ? 200 : 180}
              y2={y + 4}
              stroke={G}
              strokeWidth={isTop ? 2 : 1.6}
              opacity={isTop ? 1 : 0.55}
            />
            <line
              x1="56"
              y1={y + 14}
              x2={isTop ? 170 : 150}
              y2={y + 14}
              stroke={G}
              strokeWidth="1.4"
              opacity={isTop ? 0.6 : 0.35}
            />
          </g>
        );
      })}
      {/* magnifier hovering over the top result */}
      <g>
        <circle cx="220" cy="44" r="22" stroke={L} strokeWidth="2.8" fill="none" />
        <line x1="236" y1="60" x2="252" y2="80" stroke={L} strokeWidth="3.5" strokeLinecap="round" />
      </g>
      {/* sparkle inside lens */}
      <path
        d="M 220 36 L 222 42 L 228 44 L 222 46 L 220 52 L 218 46 L 212 44 L 218 42 Z"
        fill={G}
      />
    </svg>
  );
}

// ─── 09: Website localisation — browser with language flag tabs ───────
function WebsiteLocalisation() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* browser frame */}
      <rect x="20" y="32" width="200" height="96" rx="4" stroke={G} strokeWidth="2" fill="white" />
      {/* tab strip */}
      <line x1="20" y1="48" x2="220" y2="48" stroke={G} strokeWidth="1.6" />
      <circle cx="29" cy="40" r="2.5" fill={G} opacity="0.5" />
      <circle cx="37" cy="40" r="2.5" fill={G} opacity="0.5" />
      <circle cx="45" cy="40" r="2.5" fill={G} opacity="0.5" />
      {/* page content lines */}
      <rect x="32" y="58" width="120" height="8" rx="1.5" fill={G} opacity="0.7" />
      <line x1="32" y1="78" x2="200" y2="78" stroke={G} strokeWidth="1.4" opacity="0.5" />
      <line x1="32" y1="88" x2="180" y2="88" stroke={G} strokeWidth="1.4" opacity="0.5" />
      <line x1="32" y1="98" x2="190" y2="98" stroke={G} strokeWidth="1.4" opacity="0.5" />
      <line x1="32" y1="108" x2="160" y2="108" stroke={G} strokeWidth="1.4" opacity="0.5" />

      {/* language flag tabs on the right side, vertically stacked */}
      {[
        { y: 38, accent: false },
        { y: 60, accent: true },
        { y: 82, accent: false },
        { y: 104, accent: false },
      ].map((tab, i) => (
        <g key={i}>
          <rect
            x="232"
            y={tab.y}
            width="34"
            height="18"
            rx="2"
            stroke={tab.accent ? L : G}
            strokeWidth={tab.accent ? 2 : 1.6}
            fill={tab.accent ? FILL_L : "white"}
          />
          {/* mini stripes inside */}
          <rect x="234" y={tab.y + 2} width="8" height="14" rx="1" fill={tab.accent ? L : G} opacity="0.55" />
          <line x1="246" y1={tab.y + 6} x2="262" y2={tab.y + 6} stroke={G} strokeWidth="1.2" opacity="0.4" />
          <line x1="246" y1={tab.y + 12} x2="258" y2={tab.y + 12} stroke={G} strokeWidth="1.2" opacity="0.4" />
        </g>
      ))}
    </svg>
  );
}

// ─── 10: B2B DXP playbook — open book with phase markers ──────────────
function B2bDxpPlaybook() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* open book — two pages */}
      <path
        d="M 30 36 Q 30 28 38 28 L 132 28 L 140 36 L 140 116 L 132 124 L 38 124 Q 30 124 30 116 Z"
        stroke={G}
        strokeWidth="2"
        fill={FILL_G}
      />
      <path
        d="M 250 36 Q 250 28 242 28 L 148 28 L 140 36 L 140 116 L 148 124 L 242 124 Q 250 124 250 116 Z"
        stroke={G}
        strokeWidth="2"
        fill="white"
      />
      {/* spine */}
      <line x1="140" y1="32" x2="140" y2="120" stroke={G} strokeWidth="1.6" />
      {/* left page: phase headings */}
      <rect x="44" y="44" width="76" height="6" rx="1" fill={G} opacity="0.7" />
      <rect x="44" y="58" width="60" height="4" rx="0.5" fill={G} opacity="0.4" />
      <rect x="44" y="68" width="68" height="4" rx="0.5" fill={G} opacity="0.4" />
      <rect x="44" y="78" width="56" height="4" rx="0.5" fill={G} opacity="0.4" />
      <rect x="44" y="92" width="76" height="6" rx="1" fill={L} />
      <rect x="44" y="106" width="50" height="4" rx="0.5" fill={G} opacity="0.4" />
      {/* right page: phase markers as numbered checkboxes */}
      {[0, 1, 2, 3].map((i) => {
        const y = 44 + i * 18;
        const isAccent = i === 1;
        return (
          <g key={i}>
            <rect
              x="156"
              y={y}
              width="14"
              height="14"
              rx="2"
              stroke={isAccent ? L : G}
              strokeWidth={isAccent ? 2 : 1.6}
              fill={isAccent ? L : "white"}
            />
            {isAccent && (
              <path
                d={`M 158 ${y + 7} L 162 ${y + 11} L 168 ${y + 4}`}
                stroke={G}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            )}
            <line
              x1="178"
              y1={y + 7}
              x2={178 + 50 + (i % 2) * 8}
              y2={y + 7}
              stroke={G}
              strokeWidth="1.6"
              opacity={isAccent ? 0.85 : 0.45}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── 11: 10 clues your CMS — numbered grid (10 dots) with warning ─────
function TenCluesUpgrade() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* grid container */}
      <rect x="16" y="14" width="180" height="116" rx="4" stroke={G} strokeWidth="1.8" fill="white" />
      {/* 10 numbered circles in a 5x2 grid */}
      {Array.from({ length: 10 }).map((_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = 36 + col * 32;
        const y = 44 + row * 48;
        const isAccent = i === 5; // arbitrary highlighted clue
        return (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="14"
              stroke={isAccent ? L : G}
              strokeWidth={isAccent ? 2.2 : 1.6}
              fill={isAccent ? FILL_L : "white"}
            />
            <text
              x={x}
              y={y + 5}
              fontSize="14"
              fill={G}
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="middle"
            >
              {i + 1}
            </text>
          </g>
        );
      })}
      {/* warning triangle on the right */}
      <g>
        <path
          d="M 236 44 L 264 96 L 208 96 Z"
          stroke={L}
          strokeWidth="2.4"
          fill={FILL_L}
          strokeLinejoin="round"
        />
        {/* exclamation mark */}
        <line x1="236" y1="60" x2="236" y2="80" stroke={G} strokeWidth="3" strokeLinecap="round" />
        <circle cx="236" cy="88" r="2.4" fill={G} />
      </g>
    </svg>
  );
}

// ─── 12: Local social trends — chat bubbles + trending arrow ──────────
function LocalSocialTrends() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* trending up arrow on the left */}
      <g stroke={L} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,108 60,76 88,90 128,42" />
      </g>
      {/* dots on the trend */}
      <circle cx="22" cy="108" r="4" fill={L} />
      <circle cx="60" cy="76" r="4" fill={L} />
      <circle cx="88" cy="90" r="4" fill={L} />
      <circle cx="128" cy="42" r="6" fill={L} />
      {/* arrowhead at top */}
      <path d="M 128 42 L 124 50 M 128 42 L 136 46" stroke={L} strokeWidth="2.6" strokeLinecap="round" fill="none" />

      {/* chat bubbles on the right */}
      <g>
        {/* bubble 1 */}
        <path
          d="M 162 32 Q 154 32 154 40 L 154 60 Q 154 68 162 68 L 200 68 L 206 76 L 206 68 L 220 68 Q 228 68 228 60 L 228 40 Q 228 32 220 32 Z"
          stroke={G}
          strokeWidth="1.8"
          fill={FILL_G}
        />
        <line x1="162" y1="46" x2="220" y2="46" stroke={G} strokeWidth="1.4" opacity="0.55" />
        <line x1="162" y1="56" x2="206" y2="56" stroke={G} strokeWidth="1.4" opacity="0.55" />

        {/* bubble 2, accent */}
        <path
          d="M 178 80 Q 170 80 170 88 L 170 108 Q 170 116 178 116 L 240 116 L 246 124 L 246 116 L 252 116 Q 260 116 260 108 L 260 88 Q 260 80 252 80 Z"
          stroke={L}
          strokeWidth="2"
          fill={FILL_L}
        />
        <line x1="180" y1="94" x2="248" y2="94" stroke={G} strokeWidth="1.4" />
        <line x1="180" y1="104" x2="232" y2="104" stroke={G} strokeWidth="1.4" opacity="0.7" />
      </g>

      {/* region pin marker on the trend peak */}
      <g transform="translate(128, 42)">
        <path d="M 0 -12 Q 8 -12 8 -4 Q 8 4 0 14 Q -8 4 -8 -4 Q -8 -12 0 -12 Z" fill={G} />
        <circle cx="0" cy="-4" r="3" fill="white" />
      </g>
    </svg>
  );
}

// ─── 13: Generative AI marketing — sparkle emitting content tiles ─────
function GenerativeAiMarketing() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* big AI sparkle on the left */}
      <g transform="translate(56, 72)">
        <path
          d="M 0 -36 L 8 -8 L 36 0 L 8 8 L 0 36 L -8 8 L -36 0 L -8 -8 Z"
          fill={L}
          stroke={G}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="0" r="6" fill={G} />
      </g>
      {/* small companion sparkles */}
      <circle cx="22" cy="28" r="3" fill={L} />
      <circle cx="92" cy="32" r="3" fill={L} />
      <circle cx="100" cy="116" r="2.5" fill={L} />
      <circle cx="20" cy="116" r="2" fill={L} />

      {/* emerging content tiles on the right */}
      {[
        { x: 130, y: 28, accent: false },
        { x: 170, y: 50, accent: true },
        { x: 210, y: 28, accent: false },
        { x: 130, y: 88, accent: false },
        { x: 210, y: 88, accent: false },
      ].map((tile, i) => (
        <g key={i}>
          <rect
            x={tile.x}
            y={tile.y}
            width="50"
            height="36"
            rx="3"
            stroke={tile.accent ? L : G}
            strokeWidth={tile.accent ? 2 : 1.6}
            fill={tile.accent ? FILL_L : "white"}
          />
          <line
            x1={tile.x + 6}
            y1={tile.y + 12}
            x2={tile.x + 40}
            y2={tile.y + 12}
            stroke={G}
            strokeWidth="1.4"
            opacity="0.6"
          />
          <line
            x1={tile.x + 6}
            y1={tile.y + 22}
            x2={tile.x + 32}
            y2={tile.y + 22}
            stroke={G}
            strokeWidth="1.4"
            opacity="0.4"
          />
        </g>
      ))}
    </svg>
  );
}

// ─── 14: ECM/CMS CSF — classical pillars (foundations) ────────────────
function EcmCsfs() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {/* horizon */}
      <line x1="20" y1="120" x2="260" y2="120" stroke={G} strokeWidth="2" />
      {/* pediment (triangular roof) */}
      <path
        d="M 30 36 L 140 14 L 250 36"
        stroke={G}
        strokeWidth="2"
        fill={FILL_G}
        strokeLinejoin="round"
      />
      <line x1="30" y1="42" x2="250" y2="42" stroke={G} strokeWidth="1.8" />
      <line x1="30" y1="48" x2="250" y2="48" stroke={G} strokeWidth="1.4" opacity="0.45" />
      {/* 4 pillars */}
      {[0, 1, 2, 3].map((i) => {
        const x = 50 + i * 50;
        const isAccent = i === 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y="54"
              width="32"
              height="62"
              stroke={isAccent ? L : G}
              strokeWidth={isAccent ? 2.2 : 1.8}
              fill={isAccent ? FILL_L : "white"}
            />
            {/* pillar fluting */}
            <line x1={x + 6} y1="58" x2={x + 6} y2="112" stroke={G} strokeWidth="0.9" opacity="0.4" />
            <line x1={x + 16} y1="58" x2={x + 16} y2="112" stroke={G} strokeWidth="0.9" opacity="0.4" />
            <line x1={x + 26} y1="58" x2={x + 26} y2="112" stroke={G} strokeWidth="0.9" opacity="0.4" />
            {/* pillar capital + base */}
            <rect x={x - 3} y="50" width="38" height="6" stroke={G} strokeWidth="1.4" fill="white" />
            <rect x={x - 3} y="116" width="38" height="6" stroke={G} strokeWidth="1.4" fill="white" />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Generic / fallback ────────────────────────────────────────────────
function GenericMotif() {
  return (
    <svg viewBox="0 0 280 144" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="20" width="180" height="104" rx="4" stroke={G} strokeWidth="2" fill={FILL_G} />
      <g stroke={G} strokeWidth="1.6" opacity="0.6">
        <line x1="68" y1="42" x2="212" y2="42" />
        <line x1="68" y1="60" x2="200" y2="60" />
        <line x1="68" y1="78" x2="190" y2="78" />
        <line x1="68" y1="96" x2="178" y2="96" />
      </g>
      <rect x="68" y="40" width="92" height="6" rx="1.5" fill={L} />
    </svg>
  );
}

// ─── Slug → illustration mapping ───────────────────────────────────────
const SLUG_TO_ILLUSTRATION: Record<string, () => React.JSX.Element> = {
  "kentico-cadence-cuts-migration-risk": KenticoCadence,
  "agentic-cx-from-journeys-to-agents": AgenticCx,
  "sanity-cms-upgrades-speed-cx-delivery": SanitySpeed,
  "sitecore-productivity-and-roi": SitecoreProductivity,
  "ibexa-v5-europe-s-b2b-dxp": IbexaV5,
  "hyland-content-innovation-cloud": HylandCloud,
  "contentful-ai-workflows-boost-speed": ContentfulAiWorkflows,
  "optimizely-aeo-geo-ai-visibility": OptimizelyAeo,
  // "Website Localization for Static and Dynamic Websites"
  "navigate-digital-transformation-with-fab-partners-expertise":
    WebsiteLocalisation,
  "the-b2b-playbook-for-ai-enhanced-dxps": B2bDxpPlaybook,
  "10-clues-that-show-your-cms-requires-upgrading": TenCluesUpgrade,
  "leveraging-local-social-media-trends-for-effective-engagement":
    LocalSocialTrends,
  // "How Generative AI Is Changing Content Marketing"
  "optimizing-efficiency-data-driven-solutions-for-modern-businesses":
    GenerativeAiMarketing,
  // "Critical Success Factors for ECM/CMS Implementation"
  "unlocking-business-potential-with-tailored-cloud-solutions": EcmCsfs,
};

export default function PostIllustration({ slug }: { slug?: string }) {
  if (!slug) return <GenericMotif />;
  const Illustration = SLUG_TO_ILLUSTRATION[slug] ?? GenericMotif;
  return <Illustration />;
}

export function hasPostIllustration(slug: string): boolean {
  return slug in SLUG_TO_ILLUSTRATION;
}
