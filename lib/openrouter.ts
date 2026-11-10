// FILE: lib/openrouter.ts
// OpenRouter se baat karne ka ek hi darwaza. Saare AI calls yahin se jaate hain.
import { APP_NAME } from "@/lib/constants";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export type AIErrorCode =
  | "MODEL_NOT_SET"
  | "NO_API_KEY"
  | "AI_AUTH"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "AI_FAILED"
  | "BAD_JSON"
  | "TRUNCATED"
  | "EMPTY";

export class AIError extends Error {
  code: AIErrorCode;
  retryable: boolean;
  constructor(code: AIErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.retryable = retryable;
  }
}

// User ko dikhane layak (secret/technical baat nahi)
export function friendlyAIMessage(code: AIErrorCode | string): string {
  switch (code) {
    case "MODEL_NOT_SET":
    case "NO_API_KEY":
      return "AI is not set up yet. Please try again later.";
    case "AI_AUTH":
      return "AI service is temporarily unavailable. Please try again later.";
    case "RATE_LIMIT":
      return "AI is busy right now. Please try again in a minute.";
    case "TIMEOUT":
      return "The AI took too long to answer. Please try again.";
    case "TRUNCATED":
    case "BAD_JSON":
    case "EMPTY":
      return "The AI reply was incomplete. Please try again.";
    default:
      return "Something went wrong with the AI. Please try again.";
  }
}

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Citation {
  url: string;
  title?: string;
}

export interface ModelResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  citations: Citation[];
  finishReason: string | null;
  model: string;
}

interface CallOptions {
  model: string;
  messages: ChatMsg[];
  maxTokens: number;
  temperature?: number;
  json?: boolean; // JSON mein jawab maango
  webSearch?: boolean; // internet search chalu karo (research ke liye)
  timeoutMs?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part === "object" && "text" in part ? String((part as { text: unknown }).text ?? "") : ""))
      .join("");
  }
  return "";
}

function collectCitations(data: Record<string, unknown>, message: Record<string, unknown> | undefined): Citation[] {
  const found: Citation[] = [];

  const annotations = message?.annotations;
  if (Array.isArray(annotations)) {
    for (const a of annotations) {
      const c = (a as { type?: string; url_citation?: { url?: string; title?: string } })?.url_citation;
      if ((a as { type?: string })?.type === "url_citation" && c?.url) {
        found.push({ url: c.url, title: c.title });
      }
    }
  }

  const topLevel = data.citations;
  if (Array.isArray(topLevel)) {
    for (const c of topLevel) {
      if (typeof c === "string") found.push({ url: c });
      else if (c && typeof c === "object" && typeof (c as { url?: unknown }).url === "string") {
        found.push({ url: (c as { url: string }).url, title: (c as { title?: string }).title });
      }
    }
  }

  const searchResults = data.search_results;
  if (Array.isArray(searchResults)) {
    for (const r of searchResults) {
      const url = (r as { url?: unknown })?.url;
      if (typeof url === "string") found.push({ url, title: (r as { title?: string }).title });
    }
  }

  const seen = new Set<string>();
  return found.filter((c) => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
}

export async function callModel(opts: CallOptions): Promise<ModelResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new AIError("NO_API_KEY", "OPENROUTER_API_KEY is empty");

  let model = opts.model;
  // Perplexity models mein search pehle se hota hai; baaki models par ":online" lagakar search chalu hota hai
  if (opts.webSearch && !model.startsWith("perplexity/") && !model.endsWith(":online")) {
    model = `${model}:online`;
  }

  let useJson = Boolean(opts.json);
  let lastError: AIError | null = null;
  let skipSleep = false;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0 && !skipSleep) await sleep(1500 * attempt);
    skipSleep = false;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 110_000);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": APP_NAME,
        },
        body: JSON.stringify({
          model,
          messages: opts.messages,
          max_tokens: opts.maxTokens,
          temperature: opts.temperature ?? 0.7,
          usage: { include: true },
          ...(useJson ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => "");
        console.error(`[openrouter] ${res.status} model=${model} ${bodyText.slice(0, 300)}`);

        if (res.status === 400 && useJson) {
          // Is model par JSON mode nahi chalta - bina uske dobara try karo
          useJson = false;
          skipSleep = true;
          lastError = new AIError("AI_FAILED", "JSON mode not supported", true);
          continue;
        }
        if (res.status === 401 || res.status === 402 || res.status === 403) {
          throw new AIError("AI_AUTH", `OpenRouter auth/credits problem (${res.status})`);
        }
        if (res.status === 429) throw new AIError("RATE_LIMIT", "OpenRouter rate limit", true);
        if (res.status >= 500) throw new AIError("AI_FAILED", `OpenRouter server error (${res.status})`, true);
        throw new AIError("AI_FAILED", `OpenRouter error (${res.status})`);
      }

      const data = (await res.json()) as Record<string, unknown>;
      const choice = (data.choices as Array<Record<string, unknown>> | undefined)?.[0];
      const message = choice?.message as Record<string, unknown> | undefined;
      const text = readText(message?.content);

      if (!text.trim()) throw new AIError("EMPTY", "Empty reply from model", true);

      const usage = (data.usage ?? {}) as { prompt_tokens?: number; completion_tokens?: number; cost?: number };

      return {
        text,
        promptTokens: Number(usage.prompt_tokens ?? 0),
        completionTokens: Number(usage.completion_tokens ?? 0),
        costUsd: Number(usage.cost ?? 0),
        citations: collectCitations(data, message),
        finishReason: typeof choice?.finish_reason === "string" ? (choice.finish_reason as string) : null,
        model,
      };
    } catch (err) {
      if (err instanceof AIError) {
        if (!err.retryable) throw err;
        lastError = err;
      } else if (err instanceof Error && err.name === "AbortError") {
        lastError = new AIError("TIMEOUT", "Model timed out", true);
      } else {
        lastError = new AIError("AI_FAILED", "Network error while calling model", true);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new AIError("AI_FAILED", "AI call failed");
}

// Model ke jawab se JSON nikalta hai (``` fences hata deta hai)
export function extractJson(text: string): unknown {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end <= start) throw new AIError("BAD_JSON", "No JSON object in reply");
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    throw new AIError("BAD_JSON", "Reply was not valid JSON");
  }
}
