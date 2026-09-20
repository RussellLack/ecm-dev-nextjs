import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ecm: {
          green: "#316148",
          "green-dark": "#264a37",
          lime: "#AAF870",
          "lime-hover": "#95e05c",
          gray: {
            light: "#f5f5f5",
            DEFAULT: "#6e6e6e",
            dark: "#4a4b4d",
          },
        },
        // Theme-aware tokens (see the CSS custom properties in
        // globals.css) for the site's light sections. Use these instead
        // of bg-white / bg-gray-50 / border-gray-100 / text-ecm-green /
        // text-ecm-gray(-dark) anywhere that should invert in dark mode.
        // Leave bg-ecm-green / text-ecm-lime / text-white as they are —
        // those brand panels are deliberately constant across themes.
        surface: {
          DEFAULT: "var(--color-surface)",
          alt: "var(--color-surface-alt)",
          border: "var(--color-surface-border)",
        },
        heading: "var(--color-heading)",
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
        },
      },
      fontFamily: {
        // Resolves to the next/font CSS variable defined in app/layout.tsx
        // with Helvetica Neue as the cross-platform fallback the imported
        // Google Fonts URL never had.
        barlow: ["var(--font-barlow)", "Helvetica Neue", "Arial", "sans-serif"],
        "barlow-light": ["var(--font-barlow)", "Helvetica Neue", "Arial", "sans-serif"],
        din: ["DIN Next W01", "sans-serif"],
        display: ["var(--font-barlow)", "Helvetica Neue", "Arial", "sans-serif"],
        body: ["DIN Next W01", "Helvetica Neue", "sans-serif"],
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
