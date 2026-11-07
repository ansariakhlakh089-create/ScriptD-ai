// lib/ai-models.ts

// 1. Perplexity (Research)
export async function callPerplexity(query: string) {
  // Kal yahan asli API call aayegi
  return `Research data for: ${query} (API Key missing)`;
}

// 2. Groq (Script - Free Plan)
export async function callGroqScript(research: string, tone: string) {
  const apiKey = process.env.GROQ_API_KEY;
  
  // Agar key nahi hai, toh dummy response dega taaki app crash na ho
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 1500)); // Fake delay
    return `[Dummy Script - API Key Missing] Here is a ${tone} script based on your research.`;
  }

  // Jab key hogi, toh ye asli call chalegi
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: `Write a ${tone} script under 123 words.` },
        { role: "user", content: research }
      ]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

// 3. Gemini (Visuals - Free Plan)
export async function callGeminiVisuals(script: string) {
  // Kal yahan asli API call aayegi
  await new Promise(r => setTimeout(r, 1000));
  return `Scene 1 (0-10s): Wide shot based on script.\nScene 2 (10-20s): Close up shot.`;
}
