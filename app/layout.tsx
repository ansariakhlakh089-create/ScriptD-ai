// FILE: app/layout.tsx
import type { Metadata, Viewport } from "next";
// 1. next/font/google की जगह next/font/local इम्पोर्ट करें
import localFont from "next/font/local"; 
import "./globals.css";

// 2. Inter फॉन्ट को local कर दिया (Fontsource वाले पैकेज से)
const inter = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

// 3. Hindi फॉन्ट को भी local कर दिया
const hindi = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-hindi",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ScriptD AI - Your Content Creation Journey",
    template: "%s · ScriptD AI",
  },
  description: "Research, script and visual prompts for Indian content creators - sources included.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#766964",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${hindi.variable}`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
