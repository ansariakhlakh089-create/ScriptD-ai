// FILE: lib/cache-logic.ts
// Research cache: same/milte-julte topic par dobara AI search nahi (paisa bachta hai).
// Sirf research + links share hote hain. Kisi ka chat, script ya email kabhi share nahi hota.
import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { SourceItem } from "@/types";

export const CACHE_TTL_HOURS = 72; // 3 din baad research purani maani jayegi
const SIMILARITY_MIN = 0.75; // 75% milte-julte words = same topic

export interface CachedResearch {
  notes: string;
  keyPoints: string[];
  sources: SourceItem[];
}

export function normalizeTopic(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.,!?;:"'()\[\]{}<>\/\\|@#$%^&*_+=~`\-–—…।॥“”‘’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicKey(normalized: string): string {
  return createHash("sha256").update(normalized).digest("hex");
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let common = 0;
  for (const w of a) if (b.has(w)) common++;
  return common / (a.size + b.size - common);
}

export async function findCachedResearch(topic: string): Promise<CachedResearch | null> {
  const normalized = normalizeTopic(topic);
  if (normalized.length < 3) return null;

  const now = new Date();
  const exact = await db.researchCache.findUnique({ where: { key: topicKey(normalized) } });
  let hit = exact && exact.expiresAt > now ? exact : null;

  if (!hit) {
    const words = new Set(normalized.split(" "));
    if (words.size >= 2) {
      const recent = await db.researchCache.findMany({
        where: { expiresAt: { gt: now } },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, topic: true },
      });
      let bestId: string | null = null;
      let best = 0;
      for (const row of recent) {
        const score = jaccard(words, new Set(normalizeTopic(row.topic).split(" ")));
        if (score > best) {
          best = score;
          bestId = row.id;
        }
      }
      if (bestId && best >= SIMILARITY_MIN) {
        hit = await db.researchCache.findUnique({ where: { id: bestId } });
      }
    }
  }

  if (!hit) return null;

  await db.researchCache
    .update({ where: { id: hit.id }, data: { hits: { increment: 1 } } })
    .catch(() => undefined);

  try {
    const parsed = JSON.parse(hit.data) as { notes?: string; keyPoints?: string[] };
    if (!parsed.notes) return null;
    return {
      notes: parsed.notes,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      sources: Array.isArray(hit.sources) ? (hit.sources as unknown as SourceItem[]) : [],
    };
  } catch {
    return null;
  }
}

export async function saveResearch(
  topic: string,
  notes: string,
  keyPoints: string[],
  sources: SourceItem[]
): Promise<void> {
  const normalized = normalizeTopic(topic);
  if (normalized.length < 3) return;

  const key = topicKey(normalized);
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 3600_000);
  const data = JSON.stringify({ notes, keyPoints });
  const sourcesJson = sources as unknown as Prisma.InputJsonValue;

  await db.researchCache.upsert({
    where: { key },
    create: { key, topic: topic.slice(0, 300), data, sources: sourcesJson, expiresAt },
    update: { topic: topic.slice(0, 300), data, sources: sourcesJson, expiresAt },
  });
}
