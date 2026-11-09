// FILE: lib/token-calculator.ts
// "Token" ka hisaab: AI ne kitna use kiya -> user ke kitne token kate.
import type { Product, ScriptLength } from "@/lib/constants";

// Output token mehnge hote hain, input sasta - isliye input ko 0.25 ginte hain.
// Real cost dekhkar yahin badal sakte ho.
export const TOKEN_WEIGHTS = { input: 0.25, output: 1 } as const;

// Har step ke output ki upper limit (kharch control + script beech mein na kate)
export const STEP_LIMITS: Record<
  ScriptLength,
  { research: number; script: number; vprompt: number; maxScenes: number }
> = {
  SHORT: { research: 1500, script: 2000, vprompt: 1800, maxScenes: 8 },
  LONG: { research: 3000, script: 7500, vprompt: 6000, maxScenes: 40 },
};

export function chargeFor(promptTokens: number, completionTokens: number): number {
  return Math.max(
    0,
    Math.ceil(promptTokens * TOKEN_WEIGHTS.input + completionTokens * TOKEN_WEIGHTS.output)
  );
}

// Run shuru karne se pehle ka andaza (taaki kam balance wale ko pehle hi rok sakein)
export function estimateRunTokens(length: ScriptLength): number {
  const l = STEP_LIMITS[length];
  const output = (l.research + l.script + l.vprompt) * 0.6;
  const input = 800 + l.research * 0.6 + 800 + l.script * 0.6 + 600;
  return Math.ceil(output * TOKEN_WEIGHTS.output + input * TOKEN_WEIGHTS.input);
}

// Pack kharidne par har script ke saath itne token bhi milte hain
export const PACK_TOKENS_PER_SCRIPT = { LONG: 12000, SHORT: 4000 } as const;

export function tokensForProduct(p: Product): number {
  if (p.tokens > 0) return p.tokens;
  return p.longScripts * PACK_TOKENS_PER_SCRIPT.LONG + p.shortScripts * PACK_TOKENS_PER_SCRIPT.SHORT;
}
