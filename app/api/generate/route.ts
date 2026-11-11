// FILE: app/api/generate/route.ts
// Naya project shuru: idea + type + tone + length. Research -> Script -> Visual prompts background mein chalta hai.
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
// app/api/generate/route.ts
import { missingAIVars } from "@/lib/models";
import { getCurrentUser, jsonError, unauthorized } from "@/lib/session";
import {
  PAID_MAX_WORDS,
  LimitError,
  countWords,
  handleRouteError,
  previewFunding,
  refreshWindow,
  reserveRun,
  type Funding,
} from "@/lib/limits";
import { FREE_LIMITS } from "@/lib/constants";
import { runPipeline } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300; // Vercel par Fluid Compute on rakho, warna lamba kaam beech mein kat sakta hai

const bodySchema = z.object({
  idea: z.string().trim().min(3).max(4000),
  genre: z.string().trim().max(40).optional(),
  tone: z.string().trim().max(40).optional(),
  length: z.enum(["SHORT", "LONG"]).default("SHORT"),
  folderId: z.string().min(1).max(64).optional(), // kisi "Your Projects" folder ke andar banana ho to
});

export async function POST(req: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return unauthorized();
    if (!current.emailVerified) {
      return jsonError(403, "EMAIL_NOT_VERIFIED", "Please verify your email first. Log in once with the email code.");
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", "Please type your idea (at least 3 characters).");
    const { idea, genre, tone, length, folderId } = parsed.data;

    const user = await refreshWindow(current);

    if (folderId) {
      const folder = await db.folder.findFirst({ where: { id: folderId, userId: user.id }, select: { id: true } });
      if (!folder) return jsonError(404, "NOT_FOUND", "That project was not found.");
    }

    // 1) Pehle check: AI set-up poora hai? (taaki credit kate hi nahi)
    const previewTier: Funding = previewFunding(user, length);
    const missing = missingAIVars(previewTier);
    if (missing.length > 0) {
      console.error("[generate] missing env:", missing.join(", "));
      return jsonError(
        503,
        "AI_NOT_CONFIGURED",
        "AI is not set up yet. Please try again later.",
        process.env.NODE_ENV === "production" ? {} : { missing }
      );
    }

    // 2) Word limit
    const words = countWords(idea);
    const maxWords = previewTier === "FREE" ? FREE_LIMITS.maxWordsPerQuestion : PAID_MAX_WORDS;
    if (words > maxWords) {
      throw new LimitError("TOO_LONG", 400, `Please keep your idea under ${maxWords} words.`, { maxWords });
    }

    // 3) Project banao, phir credit roko (credit na mila to project hata do)
    const project = await db.project.create({
      data: {
        userId: user.id,
        topic: idea,
        title: idea.slice(0, 80),
        genre: genre || null,
        tone: tone || null,
        length,
        folderId: folderId ?? null,
        status: "IDLE",
      },
    });

    let funding: Funding;
    try {
      funding = await reserveRun(user, length);
      await db.tokenLedger.create({
        data: { userId: user.id, projectId: project.id, delta: 0, reason: "RESERVE", meta: { source: funding, length } },
      });
      await db.message.create({ data: { projectId: project.id, role: "USER", content: idea } });
    } catch (e) {
      await db.project.delete({ where: { id: project.id } }).catch(() => undefined);
      throw e;
    }

    // 4) Kaam background mein, user ko turant jawab
    await db.project.update({
      where: { id: project.id },
      data: { status: "RESEARCHING", progressNote: "Starting..." },
    });
    after(() => runPipeline({ projectId: project.id, userId: user.id, funding }));

    return Response.json({ projectId: project.id }, { status: 202 });
  } catch (e) {
    return handleRouteError(e);
  }
        }
