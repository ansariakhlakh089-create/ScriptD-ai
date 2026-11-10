// FILE: app/api/chat/route.ts
// Follow-up sawal: script ban jaane ke baad creator aage poochh sake (jaise "intro aur emotional karo")
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, jsonError, unauthorized } from "@/lib/session";
import { checkFollowUp, handleRouteError, refreshWindow, spendFollowUp } from "@/lib/limits";
import { callModel } from "@/lib/openrouter";
import { getModel } from "@/lib/models";
import { followUpMessages } from "@/lib/prompts";
import { chargeFor } from "@/lib/token-calculator";
import { settleIfStale } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  projectId: z.string().min(1).max(64),
  message: z.string().trim().min(1).max(4000),
});

// Purani baatein (chat history) laane ke liye:  GET /api/chat?projectId=...
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const projectId = new URL(req.url).searchParams.get("projectId");
    if (!projectId) return jsonError(400, "BAD_REQUEST", "projectId is required.");

    const project = await db.project.findFirst({ where: { id: projectId, userId: user.id }, select: { id: true } });
    if (!project) return jsonError(404, "NOT_FOUND", "Project not found.");

    const rows = await db.message.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return Response.json({
      messages: rows.map((m) => ({
        id: m.id,
        role: m.role === "ASSISTANT" ? "ASSISTANT" : "USER",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return unauthorized();
    if (!current.emailVerified) {
      return jsonError(403, "EMAIL_NOT_VERIFIED", "Please verify your email first. Log in once with the email code.");
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", "Please write a message.");
    const { projectId, message } = parsed.data;

    const user = await refreshWindow(current);

    const found = await db.project.findFirst({ where: { id: projectId, userId: user.id } });
    if (!found) return jsonError(404, "NOT_FOUND", "Project not found.");
    const project = await settleIfStale(found);
    if (project.status !== "DONE") {
      return jsonError(409, "NOT_READY", "Please wait until your script is ready, then ask follow-up questions.");
    }

    const funding = await checkFollowUp(user, project.id, message);

    const recent = await db.message.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { role: true, content: true },
    });
    const history = recent
      .reverse()
      .map((m) => ({ role: m.role === "ASSISTANT" ? ("ASSISTANT" as const) : ("USER" as const), content: m.content }));

    const result = await callModel({
      model: getModel("CHAT", funding),
      messages: followUpMessages({ roadmap: project.roadmap, script: project.script, history, userText: message }),
      maxTokens: 900,
      temperature: 0.7,
    });

    const charge = chargeFor(result.promptTokens, result.completionTokens);

    // AI se jawab mil gaya tabhi message gino aur token kaato
    await db.message.create({ data: { projectId: project.id, role: "USER", content: message } });
    await db.message.create({
      data: { projectId: project.id, role: "ASSISTANT", content: result.text.trim(), tokens: charge },
    });
    await spendFollowUp({ userId: user.id, funding, charge, projectId: project.id });

    return Response.json({ reply: result.text.trim(), tokensCharged: charge });
  } catch (e) {
    return handleRouteError(e);
  }
}
