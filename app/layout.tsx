// FILE: app/layout.tsx  (purani file ko poora replace karo)
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Hindi script ke liye (taaki Hindi text sundar dikhe)
const hindi = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
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
