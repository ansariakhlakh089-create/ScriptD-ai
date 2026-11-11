// lib/models.ts
export type PlanType = "FREE" | "PAID";
export type TaskType = "RESEARCH" | "SCRIPT" | "VPROMPT" | "QUALITY_CHECK" | "CHAT";

export const MODELS = {
  PERPLEXITY_SEARCH: "perplexity/llama-3.1-sonar-small-128k-online",
  PERPLEXITY_AGENT: "perplexity/llama-3.1-sonar-large-128k-online",
  GROQ_FAST: "groq/llama-3.1-70b-versatile",
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
  GEMINI_FLASH: "google/gemini-1.5-flash",
  GROK_VISION: "x-ai/grok-2-vision",
  BACKUP_MODEL: "openai/gpt-4o-mini"
};

export const getModelForTask = (task: TaskType, plan: PlanType) => {
  const registry = {
    RESEARCH: {
      FREE: { primary: MODELS.PERPLEXITY_SEARCH, backup: MODELS.BACKUP_MODEL, allowWebLinks: true },
      PAID: { primary: MODELS.PERPLEXITY_AGENT, backup: MODELS.BACKUP_MODEL, allowWebLinks: true },
    },
    SCRIPT: {
      FREE: { primary: MODELS.GROQ_FAST, backup: MODELS.GEMINI_FLASH, allowWebLinks: false },
      PAID: { primary: MODELS.CLAUDE_SONNET, backup: MODELS.BACKUP_MODEL, allowWebLinks: false },
    },
    VPROMPT: {
      FREE: { primary: MODELS.GEMINI_FLASH, backup: MODELS.GROQ_FAST, allowWebLinks: false },
      PAID: { primary: MODELS.GROK_VISION, backup: MODELS.CLAUDE_SONNET, allowWebLinks: false },
    },
    QUALITY_CHECK: {
      FREE: { primary: MODELS.GROQ_FAST, backup: MODELS.GEMINI_FLASH, allowWebLinks: false },
      PAID: { primary: MODELS.CLAUDE_SONNET, backup: MODELS.BACKUP_MODEL, allowWebLinks: false },
    },
    CHAT: {
      FREE: { primary: MODELS.GROQ_FAST, backup: MODELS.GEMINI_FLASH, allowWebLinks: false },
      PAID: { primary: MODELS.CLAUDE_SONNET, backup: MODELS.BACKUP_MODEL, allowWebLinks: false },
    }
  };
  return registry[task][plan];
};

// ✅ सही तरीका: missingApiVers और getModel को एक्सपोर्ट करें
export const missingApiVers = () => {
  return ""; 
};

export const getModel = getModelForTask; 

export const estimateTaskCost = (task: TaskType, plan: PlanType, inputLength: number): number => {
  const baseCost = plan === "PAID" ? 5 : 1; 
  return baseCost + (inputLength * 0.001); 
};
