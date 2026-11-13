// FILE: lib/pipeline.ts
import { Prisma, type Project } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import type { ProjectStatus, ScriptLength } from "@/lib/constants";
import { AIError, callModel, extractJson, friendlyAIMessage, type Citation, type ModelResult } from "@/lib/openrouter";
import { getModel } from "@/lib/models";
import { researchMessages, scriptMessages, vpromptMessages, type Brief } from "@/lib/prompts";
import { STEP_LIMITS, chargeFor } from "@/lib/token-calculator";
import { findCachedResearch, saveResearch } from "@/lib/cache-logic";
import { releaseRun, settleRun, type Funding } from "@/lib/limits";
import type { ProjectDTO, SourceItem, VPromptItem } from "@/types";

const STALE_AFTER_MS = 8 * 60 * 1000;

const researchSchema = z.object({
  notes: z.string().min(20),
  key_points: z.array(z.string()).nullish(),
  sources: z.array(
    z.object({ title: z.string().nullish(), url: z.string(), note: z.string().nullish() })
  ).nullish(),
});

const listLike = z.union([z.array(z.string()), z.string()]);

const scriptSchema = z.object({
  roadmap: listLike.nullish(),
  title: z.string().min(1),
  script: z.string().min(20),
  description: z.string().nullish(),
  tags: listLike.nullish(),
});

const vpromptSchema = z.object({
  scenes: z.array(
    z.object({
      scene_line: z.string().nullish(),
      kind: z.string(),
      prompt: z.string().nullish(),
      instruction: z.string().nullish(),
      source_url: z.string().nullish(),
    })
  ),
});

interface Usage {
  prompt: number;
  completion: number;
  cost: number;
}

function addUsage(u: Usage, r: ModelResult) {
  u.prompt += r.promptTokens;
  u.completion += r.completionTokens;
  u.cost += r.costUsd;
}

function toList(value: string | string[] | null | undefined, splitter: RegExp): string[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.split(splitter);
  return items.map((s) => s.trim()).filter(Boolean);
}

function cleanUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function urlKey(url: string): string {
  return url.replace(/#.*$/, "").replace(/\/$/, "").toLowerCase();
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function assertComplete(result: ModelResult) {
  if (result.finishReason === "length") {
    throw new AIError("TRUNCATED", "Model reply was cut off (max tokens reached)");
  }
}

function mergeSources(
  fromSearch: Citation[],
  fromModel: { title?: string | null; url: string; note?: string | null }[]
): SourceItem[] {
  const out: SourceItem[] = [];
  const seen = new Set<string>();

  const modelInfo = new Map<string, { title?: string; note?: string }>();
  for (const m of fromModel) {
    const url = cleanUrl(m.url);
    if (url) modelInfo.set(urlKey(url), { title: m.title ?? undefined, note: m.note ?? undefined });
  }

  for (const c of fromSearch) {
    const url = cleanUrl(c.url);
    if (!url) continue;
    const key = urlKey(url);
    if (seen.has(key)) continue;
    seen.add(key);
    const info = modelInfo.get(key);
    out.push({
      title: (c.title || info?.title || hostOf(url)).slice(0, 160),
      url,
      note: info?.note?.slice(0, 300),
      verified: true,
    });
  }

  if (out.length === 0) {
    for (const [key, info] of modelInfo) {
      if (seen.has(key)) continue;
      seen.add(key);
      const original = fromModel.map((m) => cleanUrl(m.url)).find((u) => u && urlKey(u) === key);
      if (!original) continue;
      out.push({
        title: (info.title || hostOf(original)).slice(0, 160),
        url: original,
        note: info.note?.slice(0, 300),
        verified: false,
      });
    }
  }

  return out.slice(0, 12);
}

function formatResearch(notes: string, keyPoints: string[]): string {
  const points = keyPoints.length ? `\n\n## Key points\n${keyPoints.map((p) => `- ${p}`).join("\n")}` : "";
  return `## Research\n\n${notes.trim()}${points}`;
}

async function stepResearch(
  brief: Brief,
  tier: Funding,
  usage: Usage
): Promise<{ notes: string; keyPoints: string[]; sources: SourceItem[]; fromCache: boolean }> {
  const cached = await findCachedResearch(brief.topic);
  if (cached) return { ...cached, fromCache: true };

  const result = await callModel({
    model: getModel("RESEARCH", tier).primary,
    messages: researchMessages(brief),
    maxTokens: STEP_LIMITS[brief.length].research,
    temperature: 0.2,
    json: true,
    webSearch: true,
  });
  addUsage(usage, result);
  assertComplete(result);

  const parsed = researchSchema.safeParse(extractJson(result.text));
  if (!parsed.success) throw new AIError("BAD_JSON", "Research reply had the wrong shape");

  const sources = mergeSources(result.citations, parsed.data.sources ?? []);
  const keyPoints = (parsed.data.key_points ?? []).map((s) => s.trim()).filter(Boolean);

  if (sources.some((s) => s.verified)) {
    await saveResearch(brief.topic, parsed.data.notes, keyPoints, sources).catch((e) =>
      console.error("[cache] save failed", e)
    );
  }

  return { notes: parsed.data.notes, keyPoints, sources, fromCache: false };
}

async function stepScript(brief: Brief, researchText: string, tier: Funding, usage: Usage) {
  const result = await callModel({
    model: getModel("SCRIPT", tier).primary,
    messages: scriptMessages(brief, researchText),
    maxTokens: STEP_LIMITS[brief.length].script,
    temperature: 0.8,
    json: true,
  });
  addUsage(usage, result);
  assertComplete(result);

  const parsed = scriptSchema.safeParse(extractJson(result.text));
  if (!parsed.success) throw new AIError("BAD_JSON", "Script reply had the wrong shape");

  return {
    roadmap: toList(parsed.data.roadmap, /\r?\n/),
    title: parsed.data.title.trim().slice(0, 120),
    script: parsed.data.script.trim(),
    description: (parsed.data.description ?? "").trim(),
    tags: toList(parsed.data.tags, /[,\n]/).slice(0, 20),
  };
}

async function stepVPrompts(
  script: string,
  sources: SourceItem[],
  length: ScriptLength,
  tier: Funding,
  usage: Usage
): Promise<VPromptItem[]> {
  const verified = sources.filter((s) => s.verified);
  const result = await callModel({
    model: getModel("VPROMPT", tier).primary,
    messages: vpromptMessages({ script, sources: verified, length }),
    maxTokens: STEP_LIMITS[length].vprompt,
    temperature: 0.6,
    json: true,
  });
  addUsage(usage, result);
  assertComplete(result);

  const parsed = vpromptSchema.safeParse(extractJson(result.text));
  if (!parsed.success) throw new AIError("BAD_JSON", "Visual prompt reply had the wrong shape");

  const allowed = new Map(verified.map((s) => [urlKey(s.url), s.url]));
  const items: VPromptItem[] = [];

  for (const scene of parsed.data.scenes.slice(0, STEP_LIMITS[length].maxScenes)) {
    const kind = scene.kind.trim().toUpperCase();
    const sceneLine = (scene.scene_line ?? "").trim().slice(0, 200);
    const id = items.length + 1;

    if (kind === "IMAGE" && scene.prompt?.trim()) {
      items.push({ id, sceneLine, kind: "IMAGE", prompt: scene.prompt.trim(), done: false });
    } else if (kind === "SCREENSHOT" && scene.instruction?.trim()) {
      const cleaned = scene.source_url ? cleanUrl(scene.source_url) : null;
      const sourceUrl = cleaned ? allowed.get(urlKey(cleaned)) ?? null : null;
      items.push({ id, sceneLine, kind: "SCREENSHOT", instruction: scene.instruction.trim(), sourceUrl, done: false });
    }
  }

  return items;
}

export async function runPipeline(args: { projectId: string; userId: string; funding: Funding }): Promise<void> {
  const { projectId, userId, funding } = args;
  const usage: Usage = { prompt: 0, completion: 0, cost: 0 };

  try {
    const project = await db.project.findFirst({ where: { id: projectId, userId } });
    if (!project) return;

    const length: ScriptLength = project.length === "LONG" ? "LONG" : "SHORT";
    const brief: Brief = { topic: project.topic ?? "", genre: project.genre, tone: project.tone, length };

    await db.project.update({
      where: { id: projectId },
      data: { status: "RESEARCHING", progressNote: "Searching and reading sources..." },
    });

    const research = await stepResearch(brief, funding, usage);
    const researchText = formatResearch(research.notes, research.keyPoints);

    await db.project.update({
      where: { id: projectId },
      data: {
        roadmap: researchText,
        sources: research.sources as unknown as Prisma.InputJsonValue,
        status: "SCRIPTING",
        progressNote: "Writing your script...",
      },
    });

    const script = await stepScript(brief, researchText, funding, usage);
    const roadmapText = script.roadmap.length
      ? `\n\n## Script roadmap\n${script.roadmap.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : "";

    await db.project.update({
      where: { id: projectId },
      data: {
        title: script.title,
        script: script.script,
        description: script.description,
        tags: script.tags.join(",").slice(0, 600),
        roadmap: researchText + roadmapText,
        status: "VPROMPTING",
        progressNote: "Creating visual prompts...",
      },
    });

    let vPrompts: VPromptItem[] = [];
    let softError: string | null = null;
    try {
      vPrompts = await stepVPrompts(script.script, research.sources, length, funding, usage);
    } catch (e) {
      console.error("[pipeline] vprompt step failed", e);
      softError = "Your script is ready, but visual prompts could not be created this time.";
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        status: "DONE",
        progressNote: null,
        vPrompts: vPrompts as unknown as Prisma.InputJsonValue,
        errorMessage: softError,
      },
    });

    try {
      await settleRun({
        userId,
        projectId,
        funding,
        charge: chargeFor(usage.prompt, usage.completion),
        costUsd: usage.cost,
      });
    } catch (e) {
      console.error("[pipeline] settle failed", e);
    }
  } catch (e) {
    await failRun(projectId, userId, e);
  }
}

async function failRun(projectId: string, userId: string, error: unknown): Promise<void> {
  console.error("[pipeline] failed", error);
  const base = error instanceof AIError ? friendlyAIMessage(error.code) : "Something went wrong while creating your script.";
  try {
    await db.project.update({
      where: { id: projectId },
      data: { status: "ERROR", progressNote: null, errorMessage: `${base} Your credit was returned.` },
    });
  } catch (e) {
    console.error("[pipeline] could not mark project as ERROR", e);
  }
  try {
    await releaseRun(userId, projectId);
  } catch (e) {
    console.error("[pipeline] refund failed", e);
  }
}

export async function settleIfStale(project: Project): Promise<Project> {
  const working = project.status === "RESEARCHING" || project.status === "SCRIPTING" || project.status === "VPROMPTING";
  if (!working || Date.now() - project.updatedAt.getTime() < STALE_AFTER_MS) return project;

  const updated = await db.project.update({
    where: { id: project.id },
    data: {
      status: "ERROR",
      progressNote: null,
      errorMessage: "This took too long and was stopped. Your credit was returned.",
    },
  });
  await releaseRun(project.userId, project.id).catch((e) => console.error("[pipeline] refund failed", e));
  return updated;
}

const STATUSES: ProjectStatus[] = ["IDLE", "RESEARCHING", "SCRIPTING", "VPROMPTING", "DONE", "ERROR"];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function toProjectDTO(p: Project): ProjectDTO {
  const status = (STATUSES as string[]).includes(p.status) ? (p.status as ProjectStatus) : "ERROR";
  return {
    id: p.id,
    title: p.title,
    topic: p.topic,
    genre: p.genre,
    tone: p.tone,
    length: p.length === "LONG" ? "LONG" : "SHORT",
    status,
    progressNote: p.progressNote,
    roadmap: p.roadmap,
    sources: asArray<SourceItem>(p.sources),
    script: p.script,
    description: p.description,
    tags: p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    vPrompts: asArray<VPromptItem>(p.vPrompts),
    errorMessage: p.errorMessage,
    isSaved: p.isSaved,
    folderId: p.folderId,
    tokensCharged: p.tokensCharged,
    apiCostUsd: p.apiCostUsd,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
  }
