// lib/prompts.ts

export const buildScriptPrompt = (
  topic: string, 
  type: string, 
  tone: string, 
  researchFacts: string, 
  plan: "FREE" | "PAID"
) => {
  
  // Uniqueness ke liye ek random identifier takii AI pattern repeat na kare
  const uniqueSeed = Math.floor(Math.random() * 10000);

  let basePrompt = `
    You are an expert, unfiltered scriptwriter. 
    Topic: ${topic}
    Format/Type: ${type} (Strictly follow this length and style)
    Tone: ${tone}
    
    Here is the verified research data and facts to use:
    """
    ${researchFacts}
    """
    
    CRITICAL INSTRUCTIONS:
    1. 100% UNIQUE CONTENT: Do not use standard templates. This script must be completely original. (Seed: ${uniqueSeed})
    2. Start with an engaging Hook/Retention element instantly.
    3. Output must have a Title at the top, the full script in the middle, and Description + Tags at the very end.
    4. Do not invent any fake links or facts. Only rely on the provided research.
    5. Write line-by-line as requested.
  `;

  if (plan === "PAID") {
    basePrompt += `
    6. PAID PREMIUM QUALITY: Make the narrative flow exceptionally real, unfiltered, and deeply engaging. 
    Use advanced storytelling techniques and ensure high viewer retention.
    7. Provide exact suggestions for visual assets alongside the script lines (prepare it for the V-Prompt generation stage).
    `;
  } else {
    basePrompt += `
    6. FREE PLAN LIMITATION: Keep the script concise and direct. Focus on delivering the core facts clearly.
    `;
  }

  return basePrompt;
};

export const buildVPromptInstruction = (scriptContent: string, plan: "FREE" | "PAID") => {
  return `
    Analyze the following script and generate scene-by-scene visual prompts.
    
    Script:
    """
    ${scriptContent}
    """
    
    INSTRUCTIONS:
    1. ONLY generate prompts for scenes that strictly require an image, document screenshot, or link visual.
    2. If a specific document or link from the research is mentioned, write "[REQUIRES SCREENSHOT]" and provide the suggestion.
    3. Return the output as a valid JSON array of objects with keys: "sceneNumber", "scriptLine", "visualPrompt", "requiresScreenshot" (boolean).
    4. Do not add any conversational text outside the JSON.
  `;
};
