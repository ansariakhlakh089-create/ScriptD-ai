// FILE: lib/models.ts
// Kaunsa kaam kaun sa model karega - sab .env.local / Vercel env se aata hai.
// Model badalna ho to sirf env mein slug badlo, code nahi.
import { AIError } from "@/lib/openrouter";

export type Tier = "FREE" | "PAID";
export type Step = "RESEARCH" | "SCRIPT" | "VPROMPT" | "CHAT";

export function getModel(step: Step, tier: Tier): string {
  const envName = step === "CHAT" ? "MODEL_CHAT" : `MODEL_${tier}_${step}`;
  const value = process.env[envName]?.trim();
  if (!value) throw new AIError("MODEL_NOT_SET", `${envName} is empty in env`);
  return value;
}

// Generate dabane se pehle check: kaun si env values khaali hain
export function missingAIVars(tier: Tier): string[] {
  const missing: string[] = [];
  if (!process.env.OPENROUTER_API_KEY?.trim()) missing.push("OPENROUTER_API_KEY");
  for (const step of ["RESEARCH", "SCRIPT", "VPROMPT"] as const) {
    const name = `MODEL_${tier}_${step}`;
    if (!process.env[name]?.trim()) missing.push(name);
  }
  return missing;
}

