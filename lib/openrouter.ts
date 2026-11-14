// FILE: lib/openrouter.ts
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

export function friendlyAIMessage(code: AIErrorCode | string): string {
  switch (code as AIErrorCode) {
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
  title: string;
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
  json?: boolean;
  webSearch?: boolean;
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
        found.push({ url: c.url, title: c.title || c.url });
      }
    }
  }

  const toplevel = data.citations;
  if (Array.isArray(toplevel)) {
    for (const c of toplevel) {
      if (typeof c === "string") found.push({ url: c, title: c });
      else if (c && typeof c === "object" && typeof (c as { url: unknown }).url === "string") {
        found.push({ url: (c as { url: string }).url, title: (c as { title?: string }).title || (c as { url: string }).url });
      }
    }
  }

  const searchResults = data.search_results;
  if (Array.isArray(searchResults)) {
    for (const r of searchResults) {
      const url = (r as { url?: unknown })?.url;
      if (typeof url === "string") found.push({ url, title: (r as { title?: string }).title || url });
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

  // Perplexity Sonar models already search the web, so no ":online" suffix is added
  const model = opts.model;

  let useJson = Boolean(opts.json);
  let lastError: AIError | null = null;
  let skipSleep = false;

  for (let attempt = 0; attempt < 2; attempt++) {
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
        // Errors that cannot be retried are thrown immediately; the rest go around the loop again
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

export async function callModelStream(opts: CallOptions, onChunk: (text: string) => void): Promise<ModelResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new AIError("NO_API_KEY", "OPENROUTER_API_KEY is empty");

  // Perplexity Sonar models already search the web, so no ":online" suffix is added
  const model = opts.model;

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
        stream: true,
        stream_options: { include_usage: true },
        usage: { include: true },
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      console.error(`[openrouter] ${res.status} model=${model} ${bodyText.slice(0, 300)}`);
      if (res.status === 401 || res.status === 402 || res.status === 403) throw new AIError("AI_AUTH", `Auth error (${res.status})`);
      if (res.status === 429) throw new AIError("RATE_LIMIT", "Rate limit");
      throw new AIError("AI_FAILED", `OpenRouter error (${res.status})`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new AIError("AI_FAILED", "No body in stream");

    const decoder = new TextDecoder();
    let fullText = "";
    let usage = { prompt_tokens: 0, completion_tokens: 0, cost: 0 };
    let finishReason: string | null = null;
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content || "";
            const fr = json.choices?.[0]?.finish_reason;
            if (typeof fr === "string") finishReason = fr;
            if (delta) {
              fullText += delta;
              onChunk(delta);
            }
            if (json.usage) {
              usage = json.usage;
            }
          } catch {
            // Ignore JSON parse errors from partial chunks
          }
        }
      }
    }

    if (!fullText.trim()) throw new AIError("EMPTY", "Empty reply from stream");

    return {
      text: fullText,
      promptTokens: Number(usage.prompt_tokens ?? 0),
      completionTokens: Number(usage.completion_tokens ?? 0),
      costUsd: Number(usage.cost ?? 0),
      citations: [],
      finishReason: finishReason ?? "stop",
      model,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new AIError("TIMEOUT", "Model timed out");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function extractJson(text: string): unknown {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end < start) throw new AIError("BAD_JSON", "No JSON object in reply");
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    throw new AIError("BAD_JSON", "Reply was not valid JSON");
  }
          }
    
