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
        // Mauve = main brand colour, Ember = orange accent (softer than default orange)
        mauve: {
          50: "#faf7fc",
          100: "#f1e9f6",
          200: "#e1cfec",
          300: "#cbadde",
          400: "#b085c9",
          500: "#9764b2",
          600: "#7f4d99",
          700: "#673d7c",
          800: "#553264",
          900: "#472b53",
        },
        ember: {
          50: "#fff5ec",
          100: "#ffe6cf",
          200: "#fcc99a",
          300: "#f8a966",
          400: "#f3904a",
          500: "#e97b2e",
          600: "#cf6320",
          700: "#a94d1a",
        },
        ink: "#1e1426", // main text (dark, easy to read)
        muted: "#6b5d78", // secondary text (still readable on white)
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-hindi)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(30,20,38,0.04), 0 10px 28px -14px rgba(103,61,124,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "soft-pulse": "soft-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
