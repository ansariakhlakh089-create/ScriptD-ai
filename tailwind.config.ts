// FILE: tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm, low-glare palette: deep slate-teal surfaces, soft seafoam accent, muted sand highlight.
        // Pure white is softened on purpose so text never glares on dark backgrounds.
        white: "#EEF3F4",
        plum: { DEFAULT: "#0F1A1F", deep: "#0A1317", glass: "#1A2B33" }, // page base
        taupe: { DEFAULT: "#172830", light: "#20343E", deep: "#0F1A1F" }, // raised surfaces
        cream: { DEFAULT: "#E8EEF0", dim: "#9FB4BC" }, // text
        ember: { DEFAULT: "#237A6F", hover: "#2B8F82", soft: "#8FD6CA", deep: "#1A5C54" }, // accent
        gold: { DEFAULT: "#D4B06A", hover: "#DDBE82", deep: "#B08D4A" }, // highlight
        blush: { DEFAULT: "#E8A29B", soft: "#F2C1BB", deep: "#C97B73" }, // emotional lines
        mist: { DEFAULT: "#8DB9E8", soft: "#B5D3F2", deep: "#5F93C9" }, // quotes, links, camera terms
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-hindi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px -8px rgba(35, 122, 111, 0.45)",
        glass: "0 12px 40px -12px rgba(0, 0, 0, 0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        blink: "blink 1s steps(1) infinite",
        "soft-pulse": "soft-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
