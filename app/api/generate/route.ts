// FILE: app/api/generate/route.ts
// Start a new project: idea + type + tone + length. Research -> Script -> Visual prompts run in the background.
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { missingAIVars } from "@/lib/models";
import { getCurrentUser, jsonError, unauthorized } from "@/lib/session";
import {
  PAID_MAX_WORDS,
  LimitError,
  countWords,
  handleRouteError,
  previewFunding,
  refreshWindow,
  releaseRun,
  reserveRun,
  type Funding,
} from "@/lib/limits";
import { FREE_LIMITS } from "@/lib/constants";
import { runPipeline } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300; // keep Fluid Compute on in Vercel, otherwise long jobs can be cut off midway

const bodySchema = z.object({
  idea: z.string().trim().min(3).max(4000),
  genre: z.string().trim().max(100).optional(),
  tone: z.string().trim().max(60).optional(),
  length: z.enum(["SHORT", "LONG"]).default("SHORT"),
  folderId: z.string().min(1).max(64).optional(), // set when the project should be created inside a "Projects" folder
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

    // 1) First check: is the AI set up? (so no credit is deducted if it is not)
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

    // 3) Create the project, then reserve credit (if credit cannot be reserved, remove the project)
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
      // reserveRun records the reservation (with the amount) against this project in the ledger
      funding = await reserveRun(user, length, project.id);
      await db.message.create({ data: { projectId: project.id, role: "USER", content: idea } });
    } catch (e) {
      await db.project.delete({ where: { id: project.id } }).catch(() => undefined);
      throw e;
    }

    // 4) Do the work in the background and reply to the user immediately (credit is returned on failure)
    await db.project.update({
      where: { id: project.id },
      data: { status: "RESEARCHING", progressNote: "Starting..." },
    });
    after(async () => {
      try {
        await runPipeline({ projectId: project.id, userId: user.id, funding });
      } catch (err) {
        console.error("[generate:after]", err);
        await releaseRun(user.id, project.id).catch(() => undefined);
      }
    });

    return Response.json({ projectId: project.id }, { status: 202 });
  } catch (e) {
    return handleRouteError(e);
  }
          }
