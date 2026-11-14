// FILE: app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Outfit, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

// 1. Primary UI font (clean, modern)
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// 2. Devanagari font, used when a generated script is written in Hindi
const hindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hindi",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// 3. SEO and sharing metadata
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "ScriptD AI - Your Content Creation Journey",
    template: "%s · ScriptD AI",
  },
  description: "Research, script and visual prompts for Indian content creators - sources included.",
  keywords: [
    "AI script writer",
    "Content creation",
    "YouTube script",
    "Instagram reels",
    "Indian creators",
    "ScriptD AI",
  ],
  authors: [{ name: "ScriptD AI Team" }],
  creator: "ScriptD AI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "ScriptD AI - Your Content Creation Journey",
    description: "Research, script and visual prompts for Indian content creators - sources included.",
    siteName: "ScriptD AI",
    images: [
      {
        url: "/og-image.png", // place this image in the public folder
        width: 1200,
        height: 630,
        alt: "ScriptD AI Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScriptD AI - Your Content Creation Journey",
    description: "Research, script and visual prompts for Indian content creators.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

// 4. Mobile viewport. Zooming stays enabled so people with low vision can enlarge text.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1A1F",
};

// 5. Root HTML structure
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${hindi.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased selection:bg-ember/40">
        {children}
      </body>
    </html>
  );
}
