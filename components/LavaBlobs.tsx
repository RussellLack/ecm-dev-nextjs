"use client";

import { useId } from "react";

interface LavaBlobsProps {
  /** Color variant — controls blob colors */
  variant?: "lime" | "green" | "mixed";
  /** Opacity of the overall effect (0-1) */
  opacity?: number;
  /** Number of blobs (3-8) */
  count?: number;
}

export default function LavaBlobs({
  variant = "mixed",
  opacity = 0.35,
  count = 6,
}: LavaBlobsProps) {
  const filterId = useId().replace(/:/g, "");

  // Brighter palette — all variants use high-contrast colors
  // so blobs stand out against the dark green section backgrounds
  const palette = {
    lime:  ["#7FFF00", "#AAFF50", "#7FFF00", "#CCFF80", "#7FFF00", "#AAFF50", "#7FFF00", "#CCFF80"],
    green: ["#5aba7c", "#6fcf8a", "#5aba7c", "#80d99a", "#6fcf8a", "#5aba7c", "#6fcf8a", "#80d99a"],
    mixed: ["#7FFF00", "#6fcf8a", "#AAFF50", "#7FFF00", "#80d99a", "#CCFF80", "#5aba7c", "#7FFF00"],
  };
  const colors = palette[variant];

  // Blobs scattered across the full section — varied top/left positions
  const blobs = [
    { className: "blob-roam-1", size: "30%", left: "10%",  top: "5%",   color: colors[0] },
    { className: "blob-roam-2", size: "25%", left: "60%",  top: "55%",  color: colors[1] },
    { className: "blob-roam-3", size: "20%", left: "40%",  top: "15%",  color: colors[2] },
    { className: "blob-roam-4", size: "28%", left: "-5%",  top: "45%",  color: colors[3] },
    { className: "blob-roam-5", size: "22%", left: "75%",  top: "10%",  color: colors[4] },
    { className: "blob-roam-6", size: "18%", left: "50%",  top: "70%",  color: colors[5] },
    { className: "blob-roam-7", size: "35%", left: "25%",  top: "60%",  color: colors[6] },
    { className: "blob-roam-8", size: "15%", left: "85%",  top: "35%",  color: colors[7] },
  ].slice(0, count);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/*
        SVG gooey filter — blurs shapes together then snaps alpha
        to a hard threshold for crisp metaball edges.
      */}
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 25 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className="absolute inset-0"
        style={{ filter: `url(#${filterId})` }}
      >
        {blobs.map((blob, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${blob.className}`}
            style={{
              width: blob.size,
              aspectRatio: "1 / 1",
              left: blob.left,
              top: blob.top,
              backgroundColor: blob.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
