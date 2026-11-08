// lib/ai-models.ts
import { getModelForTask, PlanType } from './model-registry';
import { buildScriptPrompt, buildVPromptInstruction } from './prompts';

// OpenRouter API URL aur Key (Environment variable se aayegi)
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Ye core function hai jo OpenRouter ko call karta hai.
 */
async function fetchFromOpenRouter(model: string, messages: any[], expectJson: boolean = false) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://aapka-app-domain.com", // OpenRouter ke liye zaroori
      "X-Title": "My AI App",
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      response_format: expectJson ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenRouter Error (${model}): ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Fallback Logic: Ek model latke toh dusre par jaye
 */
async function executeWithFallback(task: any, plan: PlanType, messages: any[], expectJson: boolean = false) {
  const models = getModelForTask(task, plan);
  
  try {
    // Pehle Primary Model try karo
    console.log(`Trying Primary Model: ${models.primary}`);
    return await fetchFromOpenRouter(models.primary, messages, expectJson);
  } catch (primaryError) {
    console.warn(`Primary Model Failed: ${models.primary}. Switching to Backup: ${models.backup}`);
    
    try {
      // Agar Primary fail hua toh Backup Model try karo
      return await fetchFromOpenRouter(models.backup, messages, expectJson);
    } catch (backupError) {
      console.error(`Backup Model also failed: ${models.backup}`);
      // Agar dono fail ho gaye toh error throw karo, taaki credits NA katein
      throw new Error("API_UNAVAILABLE_CREDITS_SAFE");
    }
  }
}

// --------------------------------------------------------
// SPECIFIC TASK FUNCTIONS
// --------------------------------------------------------

// 1. Research (Perplexity)
export const performResearch = async (topic: string, plan: PlanType) => {
  const messages = [
    { role: "system", content: "You are a highly capable research assistant. Only return factual data and real sources/links. Do not invent links." },
    { role: "user", content: `Research thoroughly about: ${topic}. Give me detailed facts and source links.` }
  ];
  return await executeWithFallback("RESEARCH", plan, messages);
};

// 2. Script Writing (Claude / Groq)
export const generateScript = async (
  topic: string, 
  type: string, 
  tone: string, 
  researchFacts: string, 
  plan: PlanType
) => {
  // Part 2 wale dynamic prompt ka use
  const prompt = buildScriptPrompt(topic, type, tone, researchFacts, plan);
  
  const messages = [
    { role: "user", content: prompt }
  ];
  return await executeWithFallback("SCRIPT", plan, messages);
};

// 3. Visual Prompts (Grok / Gemini) - Strict JSON Validation
export const generateVPrompts = async (scriptContent: string, plan: PlanType) => {
  const prompt = buildVPromptInstruction(scriptContent, plan);
  
  const messages = [
    { role: "user", content: prompt }
  ];
  
  // expectJson = true bheja hai taaki output hamesha JSON object/array aaye
  const rawOutput = await executeWithFallback("VPROMPT", plan, messages, true);
  
  // JSON ki strict jaanch (Validation)
  try {
    const parsedData = JSON.parse(rawOutput);
    // Yahan aap check kar sakte ho ki 'sceneNumber' aur 'visualPrompt' field hai ya nahi
    return parsedData; 
  } catch (error) {
    console.error("JSON Parsing Error in V-Prompt:", error);
    throw new Error("VPROMPT_FORMAT_ERROR");
  }
};
