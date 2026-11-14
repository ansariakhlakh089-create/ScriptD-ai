// FILE: lib/token-calculator.ts
// Token accounting: how much the AI used -> how many tokens are deducted from the user.
import type { Product, ScriptLength } from "@/lib/constants";

// Output tokens cost more than input tokens, so input is counted as 0.25.
// Adjust these numbers here once you have seen the real costs.
export const TOKEN_WEIGHTS = { input: 0.25, output: 1 } as const;

// Upper limit on the output of each step (controls cost and keeps a script from being cut off midway)
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

// Estimate made before a run starts (so a user with a low balance can be stopped up front)
export function estimateRunTokens(length: ScriptLength): number {
  const l = STEP_LIMITS[length];
  const output = (l.research + l.script + l.vprompt) * 0.6;
  const input = 800 + l.research * 0.6 + 800 + l.script * 0.6 + 600;
  return Math.ceil(output * TOKEN_WEIGHTS.output + input * TOKEN_WEIGHTS.input);
}

// When a pack is bought, this many tokens come with each script
export const PACK_TOKENS_PER_SCRIPT = { LONG: 12000, SHORT: 4000 } as const;

export function tokensForProduct(p: Product): number {
  if (p.tokens > 0) return p.tokens;
  return p.longScripts * PACK_TOKENS_PER_SCRIPT.LONG + p.shortScripts * PACK_TOKENS_PER_SCRIPT.SHORT;
}
