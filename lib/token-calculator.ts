// lib/token-calculator.ts

/**
 * Text length ke hisaab se approximate tokens calculate karna
 */
export const estimateTokenCount = (text: string): number => {
  if (!text) return 0;
  // Standard rule: 1 token ≈ 4 characters in English/Hinglish
  return Math.ceil(text.length / 4);
};

/**
 * Model ke hisaab se credit cost nikalna
 * (1 Credit = $0.001 ya jo bhi aapki currency value ho)
 */
export const calculateExactCost = (
  taskType: "SHORT" | "DETAILED", 
  inputTokens: number, 
  plan: "FREE" | "PAID"
): number => {
  let expectedOutputTokens = taskType === "SHORT" ? 500 : 2000;
  let totalEstimatedTokens = inputTokens + expectedOutputTokens;

  // Free plan mein internal cost track karne ke liye (User ko nahi dikhega)
  if (plan === "FREE") {
    return 0; 
  }

  // PAID plan ke liye Claude 3.5 Sonnet + Perplexity Agent + Grok Vision ka combined estimated cost
  // Example pricing multipliers (Aap isko apne OpenRouter dashboard ke hisaab se adjust kar sakte hain)
  const baseCostMultiplier = 0.005; // Per 1k tokens cost in credits
  
  let calculatedCost = (totalEstimatedTokens / 1000) * baseCostMultiplier;
  
  // Minimum 1 credit toh kategi hi
  return Math.max(1, parseFloat(calculatedCost.toFixed(2)));
};
