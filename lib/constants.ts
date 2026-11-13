// FILE: lib/constants.ts
// Saari limits, plans aur prices yahin se control hote hain.
// Kuch badalna ho (price, tokens, free limit) to sirf is file mein badlo.

export const APP_NAME = "ScriptD AI";
export const APP_TAGLINE = "Your Content Creation Journey";

// ---------------------------------------------------------------- types
export type PlanKey = "FREE" | "WEEKLY_49" | "WEEKLY_99" | "MONTHLY_249";
export type PackKey = "LONG_3";
export type ProductKey = Exclude<PlanKey, "FREE"> | PackKey;
export type ScriptLength = "SHORT" | "LONG";
export type ProjectStatus =
  | "IDLE"
  | "RESEARCHING"
  | "SCRIPTING"
  | "VPROMPTING"
  | "DONE"
  | "ERROR";

// In status mein kaam chal raha hota hai ("working" indicator dikhao)
export const WORKING_STATUSES: ProjectStatus[] = ["RESEARCHING", "SCRIPTING", "VPROMPTING"];

// ---------------------------------------------------------------- free tier
// 3000 tokens mein ek short script (~4000 tokens) poori hi nahi ho paati thi, isliye 8000.
// Free window har 24 ghante mein reset hoti hai, to ek active free user par roz ~Rs 2-2.5 tak ka kharch.
export const FREE_LIMITS = {
  resetHours: 24, // free window kitne ghante ka
  chatsPerWindow: 3, // 3 free chats
  messagesPerChat: 5, // har chat mein 5 messages  (TODO: tumne kabhi 7 bhi likha tha - confirm karo)
  tokensPerWindow: 10000, // sabhi kaam ka ek shared pool (1 short script + thodi chat)
  shortScriptsPerWindow: 1, // free mein sirf 1 short script
  longScriptsPerWindow: 0,
  maxWordsPerQuestion: 123, // free user ke sawal ki word limit
  extraWordsPerAdUnlock: 50, // 2 ads dekho -> 50 extra words
  adUnlocksPerWindow: 3, // saare chats mila kar sirf 3 ad-unlock
  adsForShortQuestion: 2,
  adsForBigQuestion: 4,
  bigQuestionWords: 60, // is se zyada words = "big question" (TODO: tumhara number batao)
} as const;

// ---------------------------------------------------------------- products
// Tokens ka aadhaar: 1 long ~ 10,000, 1 short ~ 4,000, upar se ~20% chat/follow-up ke liye.
// (lib/token-calculator.ts ke andaazon se ek baar mila lena)
export interface Product {
  key: ProductKey;
  kind: "PLAN" | "PACK";
  label: string;
  pricePaise: number; // 9900 = Rs 99
  days: number; // plan kitne din chalega (pack ke liye 0)
  tokens: number; // kharidne par kitne tokens milenge
  longScripts: number;
  shortScripts: number;
  perks: string[];
  highlight?: boolean;
  badge?: string; // card par chhota nishaan, jaise "Popular"
}

export const PRODUCTS: Record<ProductKey, Product> = {
  WEEKLY_49: {
    key: "WEEKLY_49",
    kind: "PLAN",
    label: "Short Pack",
    pricePaise: 4900,
    days: 7,
    tokens: 50000,
    longScripts: 0,
    shortScripts: 10,
    perks: [
      "10 short scripts",
      "Research with source links",
      "Visual prompts for every script",
      "Title, description and tags",
    ],
  },
  WEEKLY_99: {
    key: "WEEKLY_99",
    kind: "PLAN",
    label: "Long Pack",
    pricePaise: 9900,
    days: 7,
    tokens: 35000,
    longScripts: 2,
    shortScripts: 1, // bonus short script. Hatana ho to 0 kar do
    perks: [
      "2 long scripts + 1 bonus short",
      "Deep research, sources and roadmap",
      "Visual prompts with screenshot guides",
      "Title, description and tags",
    ],
    badge: "Popular",
  },
  MONTHLY_249: {
    key: "MONTHLY_249",
    kind: "PLAN",
    label: "Creator",
    pricePaise: 24900,
    days: 30,
    tokens: 120000,
    longScripts: 5,
    shortScripts: 10,
    perks: [
      "5 long + 10 short scripts",
      "Best research and the full scene-by-scene roadmap",
      "Longer questions and project folders",
      "Visual prompts with screenshot guides",
    ],
    highlight: true,
    badge: "Best value",
  },
  LONG_3: {
    key: "LONG_3",
    kind: "PACK",
    label: "3 Long scripts",
    pricePaise: 12900,
    days: 0,
    tokens: 38000, // pehle packs mein 0 tha, to pack akele par script nahi chalti thi
    longScripts: 3,
    shortScripts: 0,
    perks: ["3 extra long scripts"],
  },
};

export const PLAN_KEYS: Exclude<PlanKey, "FREE">[] = ["WEEKLY_49", "WEEKLY_99", "MONTHLY_249"];
export const PACK_KEYS: PackKey[] = ["LONG_3"];

// Client se aaya hua key trust nahi karte - hamesha yahan se verify karke price lete hain
export function getProduct(key: unknown): Product | null {
  if (typeof key !== "string") return null;
  return Object.prototype.hasOwnProperty.call(PRODUCTS, key) ? PRODUCTS[key as ProductKey] : null;
}

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

// ---------------------------------------------------------------- chat chips
export const SCRIPT_LENGTHS: Record<ScriptLength, { label: string; minutes: number }> = {
  SHORT: { label: "Short (1 min)", minutes: 1 },
  LONG: { label: "Long (10 min)", minutes: 10 },
};

// "Type" chip
export const GENRES = [
  "Documentary",
  "Explainer",
  "News",
  "Storytelling",
  "Comedy",
  "Horror",
  "Motivation",
] as const;

// "Tone" chip
export const TONES = ["Serious", "Engaging", "Emotional", "Dramatic", "Funny"] as const;
