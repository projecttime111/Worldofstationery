import type { Config } from "tailwindcss";

/**
 * Design tokens from design-reference/Brand.dc.html and Main.dc.html.
 * Use only these. Pencil Yellow is for highlights and offer backgrounds only,
 * never as text on white.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#1B3A6B", dark: "#122848", line: "#3A5A8C", pill: "#5A77A6" },
        yellow: "#F2B33D",
        paper: "#F7F5EF",
        ink: "#1A1D21",
        body: "#3F444B",
        muted: "#5A5F66",
        line: "#E6E2D6",
        wa: "#1F7A4D",
        "on-navy": "#D5DDEA",
        slot: { DEFAULT: "#EEEBE2", edge: "#B9B4A5" },
        field: "#A9A493",
        error: "#B3261E",
        // Yamuna Enterprises (parent company) brand colours, for its brand card only.
        yamuna: { DEFAULT: "#2B2A7E", pink: "#FFD3D5", line: "#4A49A0" },
      },
      borderRadius: {
        pill: "999px",
        card: "18px",
        tile: "14px",
        photo: "20px",
      },
      maxWidth: { content: "1200px" },
      fontFamily: {
        heading: ["BalooDeva", "var(--font-baloo)", "system-ui", "sans-serif"],
        sans: ["RupeeLocal", "var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;
