// FILE: lib/constants.ts
// Saari limits, plans aur prices yahin se control hote hain.
// Kuch badalna ho (price, tokens, free limit) to sirf is file mein badlo.

export const APP_NAME = "ScriptD AI";
export const APP_TAGLINE = "Your Content Creation Journey";

// ---------------------------------------------------------------- types
export type PlanKey = "FREE" | "WEEKLY_99" | "MONTHLY_699" | "MONTHLY_999";
export type PackKey = "LONG_5" | "SHORT_5";
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
export const FREE_LIMITS = {
  resetHours: 24, // free window kitne ghante ka
  chatsPerWindow: 3, // 3 free chats
  messagesPerChat: 5, // har chat mein 5 messages  (TODO: tumne kabhi 7 bhi likha tha - confirm karo)
  tokensPerWindow: 3000, // sabhi kaam ka ek shared pool
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
export interface Product {
  key: ProductKey;
  kind: "PLAN" | "PACK";
  label: string;
  pricePaise: number; // 9900 = Rs 99
  days: number; // plan kitne din chalega (pack ke liye 0)
  tokens: number; // plan ke saath kitne tokens milenge
  longScripts: number;
  shortScripts: number;
  perks: string[];
  highlight?: boolean;
}

export const PRODUCTS: Record<ProductKey, Product> = {
  WEEKLY_99: {
    key: "WEEKLY_99",
    kind: "PLAN",
    label: "Weekly",
    pricePaise: 9900,
    days: 7,
    tokens: 35000,
    longScripts: 2,
    shortScripts: 3,
    perks: ["2 long + 3 short scripts", "Research with source links", "Visual prompts"],
  },
  MONTHLY_699: {
    key: "MONTHLY_699",
    kind: "PLAN",
    label: "Monthly",
    pricePaise: 69900,
    days: 30,
    tokens: 175000,
    longScripts: 8,
    shortScripts: 15,
    perks: ["8 long + 15 short scripts", "Deeper research", "Visual prompts"],
    highlight: true,
  },
  MONTHLY_999: {
    key: "MONTHLY_999",
    kind: "PLAN",
    label: "Monthly Pro",
    pricePaise: 99900,
    days: 30,
    tokens: 250000,
    longScripts: 8,
    shortScripts: 15,
    perks: ["8 long + 15 short scripts", "Best research + script quality", "Visual prompts + images"],
  },
  LONG_5: {
    key: "LONG_5",
    kind: "PACK",
    label: "5 Long scripts",
    pricePaise: 29900,
    days: 0,
    tokens: 0,
    longScripts: 5,
    shortScripts: 0,
    perks: ["5 extra long scripts"],
  },
  SHORT_5: {
    key: "SHORT_5",
    kind: "PACK",
    label: "5 Short scripts",
    pricePaise: 4900, // TODO: tumne Rs 49 ya Rs 99 kaha tha - final karo
    days: 0,
    tokens: 0,
    longScripts: 0,
    shortScripts: 5,
    perks: ["5 extra short scripts"],
  },
};

export const PLAN_KEYS: Exclude<PlanKey, "FREE">[] = ["WEEKLY_99", "MONTHLY_699", "MONTHLY_999"];
export const PACK_KEYS: PackKey[] = ["LONG_5", "SHORT_5"];

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
