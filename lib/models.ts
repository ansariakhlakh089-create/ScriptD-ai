// FILE: lib/models.ts
export type PlanType = "FREE" | "PAID";
export type TaskType = "RESEARCH" | "SCRIPT" | "VPROMPT" | "QUALITY_CHECK" | "CHAT";

// हर model का नाम Vercel के Environment Variables से बदला जा सकता है (कोड बदले बिना)।
// नाम हमेशा https://openrouter.ai/models पर देखकर कॉपी करें।
function pick(envName: string, fallback: string): string {
  const v = process.env[envName]?.trim();
  return v ? v : fallback;
}

export const MODELS = {
  // Perplexity के पुराने llama-3.1-sonar-* models फरवरी 2025 में बंद हो चुके हैं
  PERPLEXITY_SEARCH: pick("MODEL_RESEARCH_FREE", "perplexity/sonar"),
  PERPLEXITY_AGENT: pick("MODEL_RESEARCH_PAID", "perplexity/sonar-pro"),
  // नीचे वाले नाम पुराने पड़ सकते हैं - OpenRouter पर जाँचकर env से बदल दें
  FAST: pick("MODEL_FAST", "meta-llama/llama-3.3-70b-instruct"),
  FLASH: pick("MODEL_FLASH", "google/gemini-2.0-flash-001"),
  PREMIUM: pick("MODEL_PREMIUM", "anthropic/claude-sonnet-4"),
  BACKUP_MODEL: pick("MODEL_BACKUP", "openai/gpt-4o-mini"),
};

export const getModelForTask = (task: TaskType, plan: PlanType) => {
  const registry = {
    RESEARCH: {
      FREE: { primary: MODELS.PERPLEXITY_SEARCH, backup: MODELS.BACKUP_MODEL, allowWebLinks: true },
      PAID: { primary: MODELS.PERPLEXITY_AGENT, backup: MODELS.BACKUP_MODEL, allowWebLinks: true },
    },
    SCRIPT: {
      FREE: { primary: MODELS.FAST, backup: MODELS.FLASH, allowWebLinks: false },
      PAID: { primary: MODELS.PREMIUM, backup: MODELS.BACKUP_MODEL, allowWebLinks: false },
    },
    // Visual prompts सिर्फ text से बनते हैं, इसलिए vision model की ज़रूरत नहीं
    VPROMPT: {
      FREE: { primary: MODELS.FLASH, backup: MODELS.FAST, allowWebLinks: false },
      PAID: { primary: MODELS.FLASH, backup: MODELS.PREMIUM, allowWebLinks: false },
    },
    QUALITY_CHECK: {
      FREE: { primary: MODELS.FAST, backup: MODELS.FLASH, allowWebLinks: false },
      PAID: { primary: MODELS.PREMIUM, backup: MODELS.BACKUP_MODEL, allowWebLinks: false },
    },
    CHAT: {
      FREE: { primary: MODELS.FAST, backup: MODELS.FLASH, allowWebLinks: false },
      PAID: { primary: MODELS.PREMIUM, backup: MODELS.BACKUP_MODEL, allowWebLinks: false },
    },
  };
  return registry[task][plan];
};

// generate/route.ts इसे इस्तेमाल करता है: जो ज़रूरी environment variable गायब हो उसका नाम लौटाता है
export const missingAIVars = (_tier?: unknown): string[] => {
  const missing: string[] = [];
  if (!process.env.OPENROUTER_API_KEY) missing.push("OPENROUTER_API_KEY");
  return missing;
};

export const missingApiVers = () => {
  return "";
};

// chat/route.ts और pipeline.ts इसे इस्तेमाल करते हैं
export const getModel = getModelForTask;

export const estimateTaskCost = (task: TaskType, plan: PlanType, inputLength: number): number => {
  const baseCost = plan === "PAID" ? 5 : 1;
  return baseCost + inputLength * 0.001;
};
