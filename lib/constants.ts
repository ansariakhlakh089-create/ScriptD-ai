// FILE: lib/constants.ts
// All limits, plans and prices are controlled from this file.
// To change a price, token amount or free limit, edit only this file.

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

// While a project is in one of these statuses, show the "working" indicator
export const WORKING_STATUSES: ProjectStatus[] = ["RESEARCHING", "SCRIPTING", "VPROMPTING"];

// ---------------------------------------------------------------- free tier
// 3,000 tokens was not enough to finish one short script (~4,000 tokens), so the free pool is larger.
// The free window resets every 24 hours, so an active free user costs roughly Rs 2-2.5 per day.
export const FREE_LIMITS = {
  resetHours: 24, // length of the free window in hours
  chatsPerWindow: 3, // 3 free chats
  messagesPerChat: 5, // 5 messages per chat (TODO: an earlier note said 7 - please confirm)
  tokensPerWindow: 10000, // one shared pool for all work (1 short script + a little chat)
  shortScriptsPerWindow: 1, // the free plan includes only 1 short script
  longScriptsPerWindow: 0,
  maxWordsPerQuestion: 123, // word limit for a free user's question
  extraWordsPerAdUnlock: 50, // watch 2 ads -> 50 extra words
  adUnlocksPerWindow: 3, // only 3 ad unlocks across all chats
  adsForShortQuestion: 2,
  adsForBigQuestion: 4,
  bigQuestionWords: 60, // more words than this counts as a "big question" (TODO: confirm the number)
} as const;

// ---------------------------------------------------------------- products
// Token basis: 1 long script ~ 10,000, 1 short ~ 4,000, plus ~20% for chat and follow-ups.
// (Cross-check once against the estimates in lib/token-calculator.ts)
export interface Product {
  key: ProductKey;
  kind: "PLAN" | "PACK";
  label: string;
  pricePaise: number; // 9900 = Rs 99
  days: number; // how long the plan lasts (0 for packs)
  tokens: number; // tokens granted on purchase
  longScripts: number;
  shortScripts: number;
  perks: string[];
  highlight?: boolean;
  badge?: string; // small label on the card, e.g. "Popular"
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
    shortScripts: 1, // bonus short script. Set to 0 to remove it
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
    tokens: 38000, // packs used to grant 0 tokens, so a pack on its own could not run a script
    longScripts: 3,
    shortScripts: 0,
    perks: ["3 extra long scripts"],
  },
};

export const PLAN_KEYS: Exclude<PlanKey, "FREE">[] = ["WEEKLY_49", "WEEKLY_99", "MONTHLY_249"];
export const PACK_KEYS: PackKey[] = ["LONG_3"];

// The key sent by the client is never trusted - always verify it here and take the price from this file
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
