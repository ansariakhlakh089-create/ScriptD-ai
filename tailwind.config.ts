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
        plum: { DEFAULT: "#080B18", deep: "#04060D", glass: "#191B32" },
        taupe: { DEFAULT: "#191B32", light: "#232645", deep: "#080B18" },
        cream: { DEFAULT: "#FFFFFF", dim: "#A995FF" },
        ember: { DEFAULT: "#7545F5", hover: "#8B62FF", soft: "#A995FF", deep: "#5A32D6" },
        gold: { DEFAULT: "#E9AE36", hover: "#F0BC52", deep: "#C48B1B" },
      },
      fontFamily: {
        // यहाँ नया फॉन्ट जोड़ दिया गया है
        sans: ["var(--font-outfit)", "var(--font-hindi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px -8px rgba(117, 69, 245, 0.45)",
        glass: "0 12px 40px -12px rgba(0,0,0,0.6)",
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
