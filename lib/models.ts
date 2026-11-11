// lib/models.ts

export type PlanType = "FREE" | "PAID";
export type TaskType = "RESEARCH" | "SCRIPT" | "VPROMPT" | "QUALITY_CHECK";

// OpenRouter Model IDs
export const MODELS = {
  PERPLEXITY_SEARCH: "perplexity/llama-3.1-sonar-small-128k-online",
  PERPLEXITY_AGENT: "perplexity/llama-3.1-sonar-large-128k-online",
  GROQ_FAST: "groq/llama-3.1-70b-versatile",
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
  GEMINI_FLASH: "google/gemini-1.5-flash", // Used for 3.8 equivalent speed
  GROK_VISION: "x-ai/grok-2-vision",
  BACKUP_MODEL: "openai/gpt-4o-mini" // Agar koi model fail ho jaye
};

// Har task aur plan ke hisaab se model assign karna
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
    }
  };

  return registry[task][plan];
};

// =========================================================================
// 🔥 यहाँ से नया कोड जोड़ा गया है (Vercel Build Error Fix)
// =========================================================================

// 1. 'getModel' नाम से export किया ताकि route.ts और pipeline.ts का इम्पोर्ट मैच हो जाए
export const getModel = getModelForTask; 

// 2. 'missingApiVers' को export किया (क्योंकि generate/route.ts इसे मांग रहा है)
// ध्यान दें: इसमें आपको अपना असली लॉजिक डालना होगा, अभी मैंने बिल्ड पास करने के लिए इसे खाली रखा है।
export const missingApiVers = () => {
  return ""; // आप यहाँ अपना API version चेक करने वाला कोड लिख सकते हैं
};

// =========================================================================

// API Fail hone par token deduction rokne ka aur Cost Estimate ka logic
export const estimateTaskCost = (task: TaskType, plan: PlanType, inputLength: number): number => {
  // Yeh ek rough formula hai credits check karne ke liye. (e.g., 1000 tokens = X credits)
  const baseCost = plan === "PAID" ? 5 : 1; 
  return baseCost + (inputLength * 0.001); 
};
