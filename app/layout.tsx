// FILE: app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Outfit, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

// 1. मुख्य इंग्लिश फॉन्ट (SaaS और ChatGPT जैसा मॉडर्न लुक)
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// 2. हिंदी (देवनागरी) फॉन्ट
const hindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hindi",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// 3. पूरा SEO और मेटाडेटा सेटअप (Google पर रैंक करने और शेयरिंग के लिए)
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
        url: "/og-image.png", // आप चाहें तो public फोल्डर में एक इमेज रख सकते हैं
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

// 4. मोबाइल के लिए व्यूअपोर्ट सेटिंग्स (थीम कलर डार्क ब्लू कर दिया है)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // जूम होने से रोकने के लिए (App जैसा फील देने के लिए)
  userScalable: false,
  themeColor: "#080B18", // आपके नए Deep Navy कलर के अनुसार
};

// 5. पूरा HTML स्ट्रक्चर
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${hindi.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased selection:bg-ember/40">
        {children}
      </body>
    </html>
  );
}
