import { ImageResponse } from "next/og";

// Dynamic OG card for guide pages — used as the fallback when a guide has
// neither seo.ogImage nor mainImage set. Renders a 1200×630 PNG keyed on
// title / series / number passed via query string, so the route stays a pure
// renderer (no Sanity fetch) and is cacheable by the CDN.
//
// Colours and typography mirror tailwind.config.ts:
//   ecm-green #316148, ecm-lime #AAF870. Barlow isn't fetched as a font file
//   here — system-ui keeps parity with app/opengraph-image.tsx and avoids the
//   extra per-render font fetch over the edge.

export const runtime = "edge";

const GREEN = "#316148";
const LIME = "#AAF870";

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = truncate(searchParams.get("title") ?? "Guide", 140);
  const series = searchParams.get("series") ?? "";
  const number = searchParams.get("number") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: GREEN,
          padding: "70px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Brand accent triangles. Inline SVG because Satori renders the
            classic CSS border-triangle hack as full rectangles. */}
        <svg
          width="480"
          height="190"
          viewBox="0 0 480 190"
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <polygon points="0,190 0,0 480,190" fill={LIME} />
        </svg>
        <svg
          width="420"
          height="220"
          viewBox="0 0 420 220"
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          <polygon points="420,0 0,0 420,220" fill={LIME} />
        </svg>

        {/* Top row: wordmark + guide number */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              color: LIME,
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: "-1px",
            }}
          >
            ECM.DEV
          </div>
          {number && (
            <div
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {`Guide ${number}`}
            </div>
          )}
        </div>

        {/* Middle: series chip + title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            position: "relative",
            maxWidth: 1040,
          }}
        >
          {series && (
            <div
              style={{
                display: "flex",
                color: LIME,
                backgroundColor: "rgba(170,248,112,0.15)",
                fontSize: 22,
                fontWeight: 700,
                padding: "8px 18px",
                borderRadius: 999,
                alignSelf: "flex-start",
              }}
            >
              {truncate(series, 60)}
            </div>
          )}
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 80 ? 56 : title.length > 50 ? 68 : 80,
              fontWeight: 800,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: URL, right-aligned to clear the bottom-left accent triangle */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            color: LIME,
            fontSize: 24,
            fontWeight: 700,
            position: "relative",
          }}
        >
          ecm.dev/guides
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
