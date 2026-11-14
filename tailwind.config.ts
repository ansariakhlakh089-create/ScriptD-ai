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
        // New Navy & Crimson/Rose Palette
        white: "#F8FAFC",
        plum: { DEFAULT: "#0A0F1D", deep: "#050812", glass: "#1A2333" }, // Overall App Background (Image 1)
        taupe: { DEFAULT: "#111827", light: "#1F2937", deep: "#0A0F1D" }, // Raised surfaces
        cream: { DEFAULT: "#F8FAFC", dim: "#94A3B8" }, // Text
        ember: { DEFAULT: "#F43F5E", hover: "#FB7185", soft: "#FDA4AF", deep: "#E11D48" }, // Button & Accent Color (Image 2 Stroke)
        gold: { DEFAULT: "#F59E0B", hover: "#FBBF24", deep: "#B45309" }, // Highlight
        blush: { DEFAULT: "#FDA4AF", soft: "#FECDD3", deep: "#F43F5E" }, // Emotional lines
        mist: { DEFAULT: "#38BDF8", soft: "#7DD3FC", deep: "#0284C7" }, // Quotes, links, camera terms
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "var(--font-hindi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px -8px rgba(244, 63, 94, 0.45)", // Changed to Rose glow
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
