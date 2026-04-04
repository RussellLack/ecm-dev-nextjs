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
      },
      fontFamily: {
        barlow: ["Barlow", "sans-serif"],
        "barlow-light": ["Barlow", "sans-serif"],
        din: ["DIN Next W01", "sans-serif"],
        display: ["Barlow", "sans-serif"],
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
