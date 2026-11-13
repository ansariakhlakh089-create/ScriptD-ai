// FILE: lib/plans.ts  (NAYI FILE)
// Saare plans ka ek hi jagah hisaab. Price, tokens, scripts yahin badlo, baaki code isse padhega.
// Tokens ka aadhaar: 1 long ~ 10,000, 1 short ~ 4,000, upar se ~20% chat/follow-up ke liye.
// (token-calculator.ts se in andaazon ko ek baar mila lena)

export type PlanId = "SHORT_PACK" | "LONG_PACK" | "CREATOR";
export type TopUpId = "TOPUP_LONG_3";

export interface PlanDef {
  id: PlanId;
  name: string;
  badge: string | null;
  priceInr: number;
  days: number; // kitne din ka plan
  tokens: number;
  longScripts: number;
  shortScripts: number;
  research: "SONAR" | "AGENT_FAST"; // research ka level
  fullRoadmap: boolean; // poora scene-by-scene roadmap
  features: string[];
}

export const PLANS: Record<PlanId, PlanDef> = {
  SHORT_PACK: {
    id: "SHORT_PACK",
    name: "Short Pack",
    badge: null,
    priceInr: 49,
    days: 7,
    tokens: 50_000,
    longScripts: 0,
    shortScripts: 10,
    research: "SONAR",
    fullRoadmap: false,
    features: [
      "10 short scripts",
      "Research with source links",
      "Visual prompts for every script",
      "Title, description and tags",
    ],
  },
  LONG_PACK: {
    id: "LONG_PACK",
    name: "Long Pack",
    badge: "Popular",
    priceInr: 99,
    days: 7,
    tokens: 35_000,
    longScripts: 2,
    shortScripts: 1, // bonus. Hatana ho to 0 kar do
    research: "SONAR",
    fullRoadmap: false,
    features: [
      "2 long scripts + 1 bonus short",
      "Deep research, sources and roadmap",
      "Visual prompts with screenshot guides",
      "Title, description and tags",
    ],
  },
  CREATOR: {
    id: "CREATOR",
    name: "Creator",
    badge: "Best value",
    priceInr: 249,
    days: 30,
    tokens: 120_000,
    longScripts: 5,
    shortScripts: 10,
    research: "AGENT_FAST",
    fullRoadmap: true,
    features: [
      "5 long + 10 short scripts",
      "Best research and the full scene-by-scene roadmap",
      "Longer questions and project folders",
      "Visual prompts with screenshot guides",
    ],
  },
};

export const PLAN_LIST: PlanDef[] = [PLANS.SHORT_PACK, PLANS.LONG_PACK, PLANS.CREATOR];

export interface TopUpDef {
  id: TopUpId;
  name: string;
  priceInr: number;
  tokens: number;
  longScripts: number;
  shortScripts: number;
}

export const TOPUPS: Record<TopUpId, TopUpDef> = {
  TOPUP_LONG_3: {
    id: "TOPUP_LONG_3",
    name: "3 long scripts",
    priceInr: 129,
    tokens: 41_000,
    longScripts: 3,
    shortScripts: 0,
  },
};

// Free tier ke naye number (lib/constants.ts ke FREE_LIMITS mein bhi yahi rakhna)
export const FREE_PLAN = {
  tokensPerWindow: 10_000,
  chatsPerWindow: 3,
  shortScriptsPerWindow: 1,
  maxWordsPerQuestion: 123,
  resetHours: 24,
} as const;
