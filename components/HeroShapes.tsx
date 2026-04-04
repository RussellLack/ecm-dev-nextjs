"use client";

export default function HeroShapes() {
  // C-arc: circle circumference = 2 * PI * 80 ≈ 502.65
  // Show ~75% of circle (C-shape): dasharray = 377 (visible) + 126 (gap)
  const circumference = 2 * Math.PI * 80;
  const visibleArc = circumference * 0.75;
  const gap = circumference - visibleArc;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Dark green triangle — upper-right, behind the arc */}
      <div
        className="absolute animate-float-triangle"
        style={{
          top: "0%",
          right: "-5%",
          width: "65%",
          height: "60%",
          overflow: "visible",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="100,8 198,178 2,178"
            fill="#2d4a35"
            transform="rotate(8, 100, 100)"
          />
        </svg>
      </div>

      {/* Lime C-arc — circle with stroke-dasharray for the gap */}
      <div
        className="absolute animate-oscillate-arc"
        style={{
          top: "-5%",
          left: "-5%",
          width: "90%",
          height: "90%",
          overflow: "visible",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#7FFF00"
            strokeWidth="26"
            strokeLinecap="round"
            strokeDasharray={`${visibleArc} ${gap}`}
            strokeDashoffset={visibleArc * 0.5}
            transform="rotate(-135, 100, 100)"
          />
        </svg>
      </div>

      {/* White circle — bottom-right, overlapping arc and triangle */}
      <div
        className="absolute animate-float-circle"
        style={{
          bottom: "-10%",
          right: "0%",
          width: "52%",
          height: "52%",
          overflow: "visible",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="rgba(255,255,255,0.85)"
          />
        </svg>
      </div>
    </div>
  );
}
