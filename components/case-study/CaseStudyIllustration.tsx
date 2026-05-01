import React from "react";

/**
 * Per-case-study line illustrations in the same diagrammatic style as
 * components/guides/GuideIllustration. Used as a thumbnail fallback
 * wherever a case-study card renders without an editor-uploaded image.
 *
 * Approach
 * --------
 * Each case study is mapped to one of ~12 motif components keyed by
 * the work-type of the engagement (taxonomy, intranet migration, CMS
 * migration, localisation, content strategy, etc.). Within a motif,
 * a slug-derived seed varies positions, accent counts, label widths,
 * and lime-fill emphasis — so every case study produces a different
 * composition while staying in the shared visual vocabulary.
 *
 * Style invariants
 * ----------------
 *   viewBox     0 0 280 144   (matches GuideIllustration)
 *   primary     #316148        (G — ECM green)
 *   accent      #AAF870        (L — ECM lime)
 *   stroke      1.0 to 1.5
 *   fills       rgba versions of G and L at low alpha
 */

const G = "#316148";
const L = "#AAF870";
const FILL_G = "rgba(49,97,72,0.06)";
const FILL_L = "rgba(170,248,112,0.14)";

// ─── Slug → seed helper ───────────────────────────────────────────────
// Stable 32-bit hash so per-slug variation is deterministic between
// builds. Different slugs produce different parameter values across the
// motifs below.
function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
}

// Tiny utility to pick from an array by seed
function pick<T>(seed: number, arr: readonly T[]): T {
  return arr[seed % arr.length];
}

// ─── Motif: Taxonomy / Information Architecture ──────────────────────
// Hierarchical tree — root, branch, leaf nodes with lime accent on a
// seed-selected level.
function TaxonomyMotif({ seed }: { seed: number }) {
  const rootX = 140;
  const rootY = 30;
  const leafCount = 3 + (seed % 3); // 3 to 5 leaves
  const accentSet = pick(seed, ["root", "branchA", "branchB", "leaves"]);
  const branches = [110, 170];
  const leafSpread = 200 - 30 * (leafCount - 3);
  const leafStart = (280 - leafSpread) / 2;

  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* root */}
      <circle
        cx={rootX}
        cy={rootY}
        r="9"
        stroke={G}
        strokeWidth="1.2"
        fill={accentSet === "root" ? L : FILL_G}
      />
      {/* branches */}
      <g stroke={G} strokeWidth="1.2" fill="none">
        <line x1={rootX} y1={rootY + 9} x2={branches[0]} y2={70} />
        <line x1={rootX} y1={rootY + 9} x2={branches[1]} y2={70} />
        <circle
          cx={branches[0]}
          cy={70}
          r="6"
          fill={accentSet === "branchA" ? L : "white"}
        />
        <circle
          cx={branches[1]}
          cy={70}
          r="6"
          fill={accentSet === "branchB" ? L : "white"}
        />
      </g>
      {/* leaves */}
      <g stroke={G} strokeWidth="1" fill="none">
        {Array.from({ length: leafCount }).map((_, i) => {
          const x = leafStart + (i * leafSpread) / Math.max(1, leafCount - 1);
          const parent = i < leafCount / 2 ? branches[0] : branches[1];
          return (
            <g key={i}>
              <line x1={parent} y1={76} x2={x} y2={110} />
              <rect
                x={x - 12}
                y={110}
                width="24"
                height="14"
                rx="1"
                fill={accentSet === "leaves" ? FILL_L : "white"}
                stroke={accentSet === "leaves" ? L : G}
                strokeWidth="1"
              />
            </g>
          );
        })}
      </g>
      {/* accent dots — vary by seed */}
      <g fill={L}>
        <circle cx={20 + (seed % 13)} cy="20" r="2" />
        <circle cx={260 - (seed % 11)} cy="124" r="2" />
      </g>
    </svg>
  );
}

// ─── Motif: Intranet / Employee Portal ───────────────────────────────
// Central hub with surrounding cells, like a portal homepage.
function IntranetMotif({ seed }: { seed: number }) {
  const cellCount = 6 + (seed % 3); // 6, 7, 8 surrounding cells
  const radius = 48;
  const accentIndex = seed % cellCount;
  const cells = Array.from({ length: cellCount }).map((_, i) => {
    const angle = (i / cellCount) * Math.PI * 2 - Math.PI / 2;
    return {
      x: 140 + Math.cos(angle) * radius,
      y: 72 + Math.sin(angle) * radius,
    };
  });
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* outer frame */}
      <rect
        x="20"
        y="14"
        width="240"
        height="116"
        rx="3"
        stroke={G}
        strokeWidth="1"
        fill={FILL_G}
        opacity="0.6"
      />
      {/* spokes */}
      <g stroke={G} strokeWidth="1" opacity="0.55">
        {cells.map((c, i) => (
          <line key={i} x1="140" y1="72" x2={c.x} y2={c.y} />
        ))}
      </g>
      {/* cells */}
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x - 9}
          y={c.y - 7}
          width="18"
          height="14"
          rx="1.5"
          stroke={i === accentIndex ? L : G}
          strokeWidth="1.2"
          fill={i === accentIndex ? FILL_L : "white"}
        />
      ))}
      {/* central hub */}
      <circle cx="140" cy="72" r="10" stroke={G} strokeWidth="1.2" fill={L} />
      <circle cx="140" cy="72" r="3" fill={G} />
    </svg>
  );
}

// ─── Motif: CMS Migration ────────────────────────────────────────────
// Source platform → arrow → target platform.
function CmsMigrationMotif({ seed }: { seed: number }) {
  const accentSide = (seed & 1) === 0 ? "target" : "source";
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* source platform */}
      <rect
        x="22"
        y="38"
        width="80"
        height="68"
        rx="3"
        stroke={G}
        strokeWidth="1.2"
        fill={accentSide === "source" ? FILL_L : FILL_G}
      />
      {[0, 1, 2].map((i) => (
        <rect
          key={`s${i}`}
          x="32"
          y={50 + i * 16}
          width="60"
          height="8"
          rx="1"
          stroke={G}
          strokeWidth="1"
          fill="white"
        />
      ))}
      {/* arrow */}
      <g stroke={accentSide === "target" ? L : G} strokeWidth="1.5" fill="none">
        <line x1="110" y1="72" x2="170" y2="72" markerEnd="url(#csArrow)" />
      </g>
      {/* target platform */}
      <rect
        x="178"
        y="38"
        width="80"
        height="68"
        rx="3"
        stroke={G}
        strokeWidth="1.2"
        fill={accentSide === "target" ? FILL_L : FILL_G}
      />
      {[0, 1, 2].map((i) => (
        <rect
          key={`t${i}`}
          x="188"
          y={50 + i * 16}
          width="60"
          height="8"
          rx="1"
          stroke={G}
          strokeWidth="1"
          fill="white"
        />
      ))}
      {/* lime accents */}
      <circle cx={accentSide === "target" ? 244 : 36} cy="32" r="3" fill={L} />
      <defs>
        <marker
          id="csArrow"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={accentSide === "target" ? L : G} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── Motif: E-commerce ───────────────────────────────────────────────
function EcommerceMotif({ seed }: { seed: number }) {
  const accentTile = seed % 6;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* product grid */}
      <g>
        {Array.from({ length: 6 }).map((_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 22 + col * 50;
          const y = 26 + row * 50;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width="42"
                height="40"
                rx="2"
                stroke={G}
                strokeWidth="1.2"
                fill={i === accentTile ? FILL_L : "white"}
              />
              <circle
                cx={x + 21}
                cy={y + 18}
                r="6"
                stroke={i === accentTile ? L : G}
                strokeWidth="1"
                fill={FILL_G}
              />
              <rect
                x={x + 8}
                y={y + 30}
                width="26"
                height="3"
                rx="0.5"
                fill={G}
                opacity="0.4"
              />
            </g>
          );
        })}
      </g>
      {/* cart */}
      <g stroke={L} strokeWidth="1.5" fill="none">
        <path d="M 188 28 L 198 28 L 206 60 L 254 60 L 250 40 L 200 40" />
        <circle cx="212" cy="70" r="3" fill={L} />
        <circle cx="246" cy="70" r="3" fill={L} />
      </g>
    </svg>
  );
}

// ─── Motif: Localisation / Multilingual ──────────────────────────────
function LocalisationMotif({ seed }: { seed: number }) {
  const tagCount = 4 + (seed % 3); // 4, 5, 6 language tags
  const accent = seed % tagCount;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* globe */}
      <circle cx="100" cy="72" r="44" stroke={G} strokeWidth="1.2" fill={FILL_G} />
      <g stroke={G} strokeWidth="1" fill="none" opacity="0.45">
        <ellipse cx="100" cy="72" rx="44" ry="18" />
        <ellipse cx="100" cy="72" rx="44" ry="32" />
        <line x1="56" y1="72" x2="144" y2="72" />
        <line x1="100" y1="28" x2="100" y2="116" />
        <ellipse cx="100" cy="72" rx="22" ry="44" />
      </g>
      {/* language tags fanned to the right */}
      {Array.from({ length: tagCount }).map((_, i) => {
        const y = 28 + (i * (88 / Math.max(1, tagCount - 1)));
        const isAccent = i === accent;
        return (
          <g key={i}>
            <line
              x1={100 + 44}
              y1="72"
              x2="180"
              y2={y}
              stroke={G}
              strokeWidth="1"
              opacity="0.6"
            />
            <rect
              x="180"
              y={y - 7}
              width="78"
              height="14"
              rx="2"
              stroke={isAccent ? L : G}
              strokeWidth="1.2"
              fill={isAccent ? FILL_L : "white"}
            />
            <line
              x1="190"
              y1={y}
              x2="226"
              y2={y}
              stroke={G}
              strokeWidth="0.8"
              opacity="0.4"
            />
            <line
              x1="232"
              y1={y}
              x2="252"
              y2={y}
              stroke={G}
              strokeWidth="0.8"
              opacity="0.4"
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Motif: Content Strategy / flow ──────────────────────────────────
function ContentStrategyMotif({ seed }: { seed: number }) {
  const nodeCount = 4 + (seed % 3); // 4, 5, 6
  const accent = seed % nodeCount;
  const startX = 30;
  const endX = 250;
  const xs = Array.from({ length: nodeCount }).map(
    (_, i) => startX + ((endX - startX) * i) / (nodeCount - 1)
  );
  // staggered y coordinates
  const ys = xs.map((_, i) =>
    i % 2 === 0 ? 50 + (seed % 7) : 96 - (seed % 9)
  );
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* connectors */}
      <g stroke={G} strokeWidth="1.2" fill="none">
        {xs.slice(0, -1).map((x, i) => (
          <path
            key={i}
            d={`M ${x + 10} ${ys[i]} Q ${(x + xs[i + 1]) / 2} ${(ys[i] + ys[i + 1]) / 2 - 6} ${xs[i + 1] - 10} ${ys[i + 1]}`}
          />
        ))}
      </g>
      {/* nodes */}
      {xs.map((x, i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={ys[i]}
            r="11"
            stroke={i === accent ? L : G}
            strokeWidth="1.4"
            fill={i === accent ? FILL_L : "white"}
          />
          <circle cx={x} cy={ys[i]} r="3" fill={i === accent ? L : G} />
        </g>
      ))}
      {/* horizontal baseline */}
      <line
        x1="20"
        y1="124"
        x2="260"
        y2="124"
        stroke={G}
        strokeWidth="0.8"
        opacity="0.3"
      />
    </svg>
  );
}

// ─── Motif: Website (layout boxes) ───────────────────────────────────
function WebsiteMotif({ seed }: { seed: number }) {
  const variant = seed % 3; // three layout variants
  const accent = (seed >> 2) % 4;
  const block = (i: number, base: string) => (i === accent ? FILL_L : base);
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* browser frame */}
      <rect x="20" y="18" width="240" height="108" rx="3" stroke={G} strokeWidth="1.2" fill="white" />
      <line x1="20" y1="32" x2="260" y2="32" stroke={G} strokeWidth="1" />
      <circle cx="29" cy="25" r="2" fill={G} opacity="0.5" />
      <circle cx="37" cy="25" r="2" fill={G} opacity="0.5" />
      <circle cx="45" cy="25" r="2" fill={G} opacity="0.5" />
      {/* layout */}
      {variant === 0 && (
        <g>
          <rect x="32" y="42" width="216" height="22" rx="1" stroke={G} strokeWidth="1" fill={block(0, FILL_G)} />
          <rect x="32" y="70" width="100" height="48" rx="1" stroke={G} strokeWidth="1" fill={block(1, "white")} />
          <rect x="140" y="70" width="48" height="22" rx="1" stroke={G} strokeWidth="1" fill={block(2, "white")} />
          <rect x="140" y="96" width="48" height="22" rx="1" stroke={G} strokeWidth="1" fill={block(3, "white")} />
          <rect x="196" y="70" width="52" height="48" rx="1" stroke={G} strokeWidth="1" fill="white" />
        </g>
      )}
      {variant === 1 && (
        <g>
          <rect x="32" y="42" width="216" height="14" rx="1" stroke={G} strokeWidth="1" fill={block(0, FILL_G)} />
          <rect x="32" y="62" width="68" height="56" rx="1" stroke={G} strokeWidth="1" fill={block(1, "white")} />
          <rect x="106" y="62" width="68" height="56" rx="1" stroke={G} strokeWidth="1" fill={block(2, "white")} />
          <rect x="180" y="62" width="68" height="56" rx="1" stroke={G} strokeWidth="1" fill={block(3, "white")} />
        </g>
      )}
      {variant === 2 && (
        <g>
          <rect x="32" y="42" width="80" height="76" rx="1" stroke={G} strokeWidth="1" fill={block(0, FILL_G)} />
          <rect x="120" y="42" width="128" height="36" rx="1" stroke={G} strokeWidth="1" fill={block(1, "white")} />
          <rect x="120" y="84" width="60" height="34" rx="1" stroke={G} strokeWidth="1" fill={block(2, "white")} />
          <rect x="186" y="84" width="62" height="34" rx="1" stroke={G} strokeWidth="1" fill={block(3, "white")} />
        </g>
      )}
      {/* lime accent line */}
      <line
        x1={36 + (seed % 90)}
        y1="48"
        x2={86 + (seed % 90)}
        y2="48"
        stroke={L}
        strokeWidth="2"
        opacity={0.8}
      />
    </svg>
  );
}

// ─── Motif: Marketing / campaigns ────────────────────────────────────
function MarketingMotif({ seed }: { seed: number }) {
  // Funnel with seed-varied levels and accent ring
  const levels = 4;
  const accent = seed % levels;
  const baseW = 200;
  const baseX = 140;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* megaphone abstraction at left */}
      <g stroke={G} strokeWidth="1.2" fill={FILL_G}>
        <path d="M 30 50 L 60 38 L 60 106 L 30 94 Z" />
        <rect x="60" y="54" width="20" height="36" rx="2" />
      </g>
      <g stroke={L} strokeWidth="1.5" fill="none">
        <path d="M 84 60 Q 96 60 96 72 Q 96 84 84 84" />
        <path d="M 96 50 Q 116 50 116 72 Q 116 94 96 94" opacity="0.6" />
      </g>
      {/* funnel on the right */}
      {Array.from({ length: levels }).map((_, i) => {
        const w = baseW * (1 - (i * 0.18));
        const x = baseX - w / 2;
        const y = 30 + i * 22;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w * 0.55}
            height="14"
            rx="1"
            stroke={i === accent ? L : G}
            strokeWidth="1.2"
            fill={i === accent ? FILL_L : "white"}
          />
        );
      })}
      {/* drop accents */}
      <circle cx={(baseX) + 30 + (seed % 14)} cy="124" r="3" fill={L} />
    </svg>
  );
}

// ─── Motif: CRM / connected users ────────────────────────────────────
function CrmMotif({ seed }: { seed: number }) {
  const userCount = 4 + (seed % 3); // 4, 5, 6
  const accent = seed % userCount;
  const positions = Array.from({ length: userCount }).map((_, i) => {
    const angle = (i / userCount) * Math.PI * 2 - Math.PI / 2;
    return {
      x: 140 + Math.cos(angle) * 50,
      y: 72 + Math.sin(angle) * 38,
    };
  });
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* central CRM */}
      <rect
        x="118"
        y="58"
        width="44"
        height="28"
        rx="3"
        stroke={G}
        strokeWidth="1.4"
        fill={FILL_G}
      />
      <line x1="124" y1="68" x2="156" y2="68" stroke={G} strokeWidth="1" />
      <line x1="124" y1="74" x2="146" y2="74" stroke={G} strokeWidth="1" opacity="0.5" />
      <line x1="124" y1="80" x2="150" y2="80" stroke={G} strokeWidth="1" opacity="0.5" />
      {/* connectors */}
      <g stroke={G} strokeWidth="1" opacity="0.55">
        {positions.map((p, i) => (
          <line key={i} x1="140" y1="72" x2={p.x} y2={p.y} />
        ))}
      </g>
      {/* user nodes */}
      {positions.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y - 3}
            r="5"
            stroke={i === accent ? L : G}
            strokeWidth="1.2"
            fill={i === accent ? FILL_L : "white"}
          />
          <path
            d={`M ${p.x - 7} ${p.y + 9} Q ${p.x} ${p.y + 2} ${p.x + 7} ${p.y + 9}`}
            stroke={i === accent ? L : G}
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Motif: ECM Vision / pillars ─────────────────────────────────────
function EcmVisionMotif({ seed }: { seed: number }) {
  const pillarCount = 3 + (seed % 2); // 3 or 4
  const accent = seed % pillarCount;
  const baseY = 116;
  const topY = 32;
  const totalW = 200;
  const pillarW = 22;
  const gap = (totalW - pillarCount * pillarW) / (pillarCount - 1);
  const startX = (280 - totalW) / 2;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* horizon */}
      <line x1="20" y1={baseY} x2="260" y2={baseY} stroke={G} strokeWidth="1" />
      {/* pediment */}
      <path
        d={`M 38 ${topY} L 140 18 L 242 ${topY}`}
        stroke={G}
        strokeWidth="1.2"
        fill={FILL_G}
      />
      <line x1="38" y1={topY + 6} x2="242" y2={topY + 6} stroke={G} strokeWidth="1" />
      {/* pillars */}
      {Array.from({ length: pillarCount }).map((_, i) => {
        const x = startX + i * (pillarW + gap);
        const isAccent = i === accent;
        return (
          <g key={i}>
            <rect
              x={x}
              y={topY + 8}
              width={pillarW}
              height={baseY - topY - 8}
              stroke={isAccent ? L : G}
              strokeWidth="1.2"
              fill={isAccent ? FILL_L : "white"}
            />
            <line
              x1={x + 4}
              y1={topY + 14}
              x2={x + 4}
              y2={baseY - 4}
              stroke={G}
              strokeWidth="0.8"
              opacity="0.35"
            />
            <line
              x1={x + pillarW - 4}
              y1={topY + 14}
              x2={x + pillarW - 4}
              y2={baseY - 4}
              stroke={G}
              strokeWidth="0.8"
              opacity="0.35"
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Motif: Data ops / analytics ─────────────────────────────────────
function DataOpsMotif({ seed }: { seed: number }) {
  const barCount = 5 + (seed % 3); // 5, 6, 7
  const accent = seed % barCount;
  const baseX = 36;
  const baseY = 116;
  const widthPer = 200 / barCount;
  const heights = Array.from({ length: barCount }).map(
    (_, i) => 30 + ((seed * (i + 1)) % 60)
  );
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* axes */}
      <line x1={baseX} y1="20" x2={baseX} y2={baseY} stroke={G} strokeWidth="1.2" />
      <line x1={baseX} y1={baseY} x2="252" y2={baseY} stroke={G} strokeWidth="1.2" />
      {/* faint grid */}
      <g stroke={G} strokeWidth="0.6" opacity="0.25">
        {[40, 60, 80, 100].map((y) => (
          <line key={y} x1={baseX} y1={y} x2="252" y2={y} />
        ))}
      </g>
      {/* bars */}
      {heights.map((h, i) => {
        const x = baseX + 6 + i * widthPer;
        return (
          <rect
            key={i}
            x={x}
            y={baseY - h}
            width={widthPer - 6}
            height={h}
            stroke={i === accent ? L : G}
            strokeWidth="1.1"
            fill={i === accent ? FILL_L : FILL_G}
          />
        );
      })}
      {/* trend line */}
      <polyline
        points={heights
          .map(
            (h, i) =>
              `${baseX + 6 + i * widthPer + (widthPer - 6) / 2},${baseY - h - 6}`
          )
          .join(" ")}
        stroke={L}
        strokeWidth="1.6"
        fill="none"
      />
      {heights.map((h, i) => (
        <circle
          key={`d${i}`}
          cx={baseX + 6 + i * widthPer + (widthPer - 6) / 2}
          cy={baseY - h - 6}
          r="2.5"
          fill={L}
        />
      ))}
    </svg>
  );
}

// ─── Motif: Workflow / process steps ─────────────────────────────────
function WorkflowMotif({ seed }: { seed: number }) {
  const steps = 4 + (seed % 2); // 4 or 5
  const accent = seed % steps;
  const baseY = 72;
  const startX = 30;
  const stepW = (220 / steps) - 6;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* steps */}
      {Array.from({ length: steps }).map((_, i) => {
        const x = startX + i * (stepW + 6);
        return (
          <g key={i}>
            <rect
              x={x}
              y={baseY - 18}
              width={stepW}
              height="36"
              rx="2"
              stroke={i === accent ? L : G}
              strokeWidth="1.3"
              fill={i === accent ? FILL_L : "white"}
            />
            <circle
              cx={x + 8}
              cy={baseY}
              r="3"
              fill={i === accent ? L : G}
            />
            <line
              x1={x + 16}
              y1={baseY - 4}
              x2={x + stepW - 6}
              y2={baseY - 4}
              stroke={G}
              strokeWidth="1"
              opacity="0.45"
            />
            <line
              x1={x + 16}
              y1={baseY + 4}
              x2={x + stepW - 14}
              y2={baseY + 4}
              stroke={G}
              strokeWidth="1"
              opacity="0.45"
            />
            {i < steps - 1 && (
              <path
                d={`M ${x + stepW + 1} ${baseY} L ${x + stepW + 5} ${baseY}`}
                stroke={G}
                strokeWidth="1.5"
                markerEnd="url(#wfArrow)"
              />
            )}
          </g>
        );
      })}
      {/* lime accent dots above */}
      <circle cx={startX + 8 + accent * (stepW + 6)} cy="32" r="3" fill={L} />
      <defs>
        <marker
          id="wfArrow"
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L6,3 z" fill={G} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── Motif: Prototype / layered cards ────────────────────────────────
function PrototypeMotif({ seed }: { seed: number }) {
  const offset = 6 + (seed % 4);
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* layered cards */}
      {[2, 1, 0].map((layer) => {
        const x = 70 + layer * offset;
        const y = 30 + layer * offset;
        const isTop = layer === 0;
        return (
          <rect
            key={layer}
            x={x}
            y={y}
            width="140"
            height="80"
            rx="3"
            stroke={isTop ? L : G}
            strokeWidth={isTop ? "1.4" : "1.2"}
            fill={isTop ? FILL_L : layer === 1 ? FILL_G : "white"}
            opacity={1 - layer * 0.25}
          />
        );
      })}
      {/* sketch lines on top */}
      <g stroke={G} strokeWidth="1" opacity="0.7">
        <line x1="80" y1="46" x2="200" y2="46" />
        <line x1="80" y1="58" x2="170" y2="58" />
        <line x1="80" y1="70" x2="150" y2="70" />
        <rect x="80" y="80" width="40" height="22" rx="1" />
        <rect x="130" y="80" width="40" height="22" rx="1" />
        <rect x="180" y="80" width="22" height="22" rx="1" />
      </g>
      <circle cx="218" cy="36" r="3" fill={L} />
    </svg>
  );
}

// ─── Motif: Broadcast / event ────────────────────────────────────────
function BroadcastMotif({ seed }: { seed: number }) {
  const ringCount = 3 + (seed % 2);
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* tower */}
      <g stroke={G} strokeWidth="1.2" fill="none">
        <line x1="140" y1="34" x2="124" y2="116" />
        <line x1="140" y1="34" x2="156" y2="116" />
        <line x1="130" y1="64" x2="150" y2="64" />
        <line x1="128" y1="84" x2="152" y2="84" />
        <line x1="126" y1="104" x2="154" y2="104" />
      </g>
      <circle cx="140" cy="32" r="4" fill={L} />
      {/* radiating rings */}
      <g stroke={L} strokeWidth="1.4" fill="none">
        {Array.from({ length: ringCount }).map((_, i) => (
          <g key={i}>
            <path
              d={`M ${140 - 30 - i * 26} ${50 + i * 6} Q ${140 - 18 - i * 24} ${30 + i * 4} ${140 - 4} ${28 - i * 2}`}
              opacity={1 - i * 0.25}
            />
            <path
              d={`M ${140 + 30 + i * 26} ${50 + i * 6} Q ${140 + 18 + i * 24} ${30 + i * 4} ${140 + 4} ${28 - i * 2}`}
              opacity={1 - i * 0.25}
            />
          </g>
        ))}
      </g>
      {/* base */}
      <line x1="100" y1="120" x2="180" y2="120" stroke={G} strokeWidth="1.2" />
      <circle cx={100 + (seed % 80)} cy="128" r="2" fill={L} />
    </svg>
  );
}

// ─── Motif: Generic fallback ─────────────────────────────────────────
function GenericMotif({ seed }: { seed: number }) {
  const accent = seed % 3;
  return (
    <svg viewBox="0 0 280 144" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="22" width="200" height="100" rx="3" stroke={G} strokeWidth="1.2" fill={FILL_G} />
      <g stroke={G} strokeWidth="1" opacity="0.6">
        <line x1="60" y1="44" x2="220" y2="44" />
        <line x1="60" y1="60" x2="200" y2="60" />
        <line x1="60" y1="76" x2="190" y2="76" />
        <line x1="60" y1="92" x2="170" y2="92" />
      </g>
      <rect
        x="60"
        y={104 + (accent === 0 ? -78 : accent === 1 ? -62 : -46)}
        width={accent === 0 ? 60 : accent === 1 ? 80 : 100}
        height="6"
        rx="1"
        fill={L}
      />
      <circle cx="226" cy={36 + accent * 30} r="4" fill={L} />
    </svg>
  );
}

// ─── Slug → motif mapping ────────────────────────────────────────────
type Motif = (props: { seed: number }) => React.JSX.Element;

const SLUG_TO_MOTIF: Record<string, Motif> = {
  // taxonomy
  "intranet-content-migration-for-food-manufacturer": TaxonomyMotif,
  "cms-migration": CmsMigrationMotif,
  "redesigning-content-taxonomy-for-a-regional-bank": TaxonomyMotif,
  "redesigning-content-taxonomy-paints-chemicals-manufacturer": TaxonomyMotif,
  "new-information-architecture": TaxonomyMotif,
  "global-b2b-website-platform-migration": CmsMigrationMotif,
  "multitenant-retail-platform-strategy": EcommerceMotif,
  "enterprise-content-taxonomy": TaxonomyMotif,
  "sitecore-cms-migration-nordic-maritime-classification-society":
    CmsMigrationMotif,
  "cms-migration-to-episerver-nordic-training-company": CmsMigrationMotif,
  "enterprise-cms-migration-sitecore-optimizely": CmsMigrationMotif,
  "enterprise-content-taxonomy-metadata-architecture": TaxonomyMotif,
  // intranet
  "sharepoint-employee-portal": IntranetMotif,
  "sharepoint-migration-and-employee-communications": IntranetMotif,
  "intranet-upgrade-for-national-parliament": IntranetMotif,
  "global-intranet-migration-to-sharepoint-global-coatings-company": IntranetMotif,
  "sharepoint-migration-and-employee-portal-design-global-paints":
    IntranetMotif,
  "sharepoint-intranet-employee-portal-financial-services": IntranetMotif,
  // ecommerce
  "new-e-commerce-platform-for-automotive-group": EcommerceMotif,
  "automotive-content-ecommerce": EcommerceMotif,
  // localisation
  "multilingual-seo-and-content-localization": LocalisationMotif,
  "content-and-localization-services-for-national-tourism-portal":
    LocalisationMotif,
  "multilingual-website-for-hotel-chain": LocalisationMotif,
  "content-localization-15-countrieslanguages": LocalisationMotif,
  "hospitality-tourism-multilingual-website": LocalisationMotif,
  // content strategy
  "enterprise-website-redesign-and-new-customer-services-portal": WebsiteMotif,
  "growth-strategy-and-new-website": ContentStrategyMotif,
  "industrial-robots-website": WebsiteMotif,
  "content-strategy-and-streamlined-cms-implementation": ContentStrategyMotif,
  "content-strategy-and-cms-migration": CmsMigrationMotif,
  "content-marketing-thought-leadership-strategy": MarketingMotif,
  "website-redesign": WebsiteMotif,
  "content-strategy": ContentStrategyMotif,
  "corporate-website": WebsiteMotif,
  "content-strategy-us-regional-rail-network": ContentStrategyMotif,
  "content-strategy-nordic-esg-consultancy": ContentStrategyMotif,
  "corporate-website-nordic-m2m-technology-company": WebsiteMotif,
  "esg-sustainability-content-strategy": ContentStrategyMotif,
  // crm
  "digital-growth-strategy": DataOpsMotif,
  "digital-tools-for-product-selection-in-pim": EcommerceMotif,
  "customer-platform-prototype": PrototypeMotif,
  "digital-b2b-strategy-global-paints-and-coatings-manufacturer": CrmMotif,
  "digital-services-strategy-global-coatings-company": CrmMotif,
  "digital-b2b-strategy-content-operations": CrmMotif,
  "crm-activation-program": CrmMotif,
  "crm-activation-b2b-sales-teams": CrmMotif,
  // ecm vision
  "future-state-ecm-vision": EcmVisionMotif,
  "ecm-governance-financial-services": EcmVisionMotif,
  // marketing
  "data-operations-strategy": DataOpsMotif,
  "advertising-and-content-marketing-campaign": MarketingMotif,
  "marketing-technology-due-diligence": DataOpsMotif,
  "multichannel-brand-advertising": MarketingMotif,
  "digital-advertising-for-saas-vendor": MarketingMotif,
  "marketing-technology-advisory": DataOpsMotif,
  "digital-advertising-and-content-marketing": MarketingMotif,
  "digital-campaign-management": MarketingMotif,
  "digital-marketing-strategy": MarketingMotif,
  "inbound-marketing-strategy-global-shipping-firm": MarketingMotif,
  "inbound-marketing-strategy-energy-consultancy": MarketingMotif,
  "customer-segmentation-nordic-online-book-retailer": CrmMotif,
  "customer-segmentation-predictive-marketing": CrmMotif,
  "digital-campaign-management-ngo": MarketingMotif,
  "private-equity-martech-due-diligence": DataOpsMotif,
  "inbound-marketing-thought-leadership-b2b": MarketingMotif,
  // prototype
  "service-prototyping": PrototypeMotif,
  "new-product-concepts": PrototypeMotif,
  // workflow / website-side
  "digital-process-improvements": WorkflowMotif,
  "gdpr-compliant-web-analytics-migration": DataOpsMotif,
  "forms-ux-and-workflow-redesign": WorkflowMotif,
  "website-optimization-programme-oil-and-gas-company": WebsiteMotif,
  // broadcast / event
  "conference-webcasting-dubai-energy-conference": BroadcastMotif,
  "conference-webcasting-event-content-production": BroadcastMotif,
};

// ─── Public component ────────────────────────────────────────────────
export default function CaseStudyIllustration({ slug }: { slug?: string }) {
  if (!slug) return <GenericMotif seed={0} />;
  const Motif = SLUG_TO_MOTIF[slug] ?? GenericMotif;
  return <Motif seed={hashSlug(slug)} />;
}

export function hasCaseStudyIllustration(slug: string): boolean {
  return slug in SLUG_TO_MOTIF;
}
