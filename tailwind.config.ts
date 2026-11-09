// FILE: tailwind.config.ts  (purani file ko poora replace karo)
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
        // Login screen ka gehra plum
        plum: { DEFAULT: "#54474d", deep: "#3f353a", glass: "#7a5651" },
        // App screens ka taupe (design jaisa, bas thoda gehra taaki text saaf padhe)
        taupe: { DEFAULT: "#766964", light: "#8a7c77", deep: "#5f5450" },
        // Text
        cream: { DEFAULT: "#fbeee8", dim: "#efdfd7" },
        // Orange accent
        ember: { DEFAULT: "#ff6b35", hover: "#f0581f", soft: "#ffd9c7", deep: "#c2410c" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-hindi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px -8px rgba(255,107,53,0.55)",
        glass: "0 12px 40px -12px rgba(0,0,0,0.35)",
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
