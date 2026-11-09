// FILE: app/api/project/[id]/route.ts
// Ek project: dekhna (status polling), checkbox tick, save/rename, delete
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, jsonError, unauthorized } from "@/lib/session";
import { handleRouteError } from "@/lib/limits";
import { settleIfStale, toProjectDTO } from "@/lib/pipeline";
import type { VPromptItem } from "@/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  vPromptId: z.number().int().optional(),
  done: z.boolean().optional(),
  isSaved: z.boolean().optional(),
  folderId: z.string().min(1).max(64).nullable().optional(), // null = folder se bahar nikalo
  title: z.string().trim().min(1).max(120).optional(),
});

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const found = await db.project.findFirst({ where: { id, userId: user.id } });
    if (!found) return jsonError(404, "NOT_FOUND", "Project not found.");

    const project = await settleIfStale(found);
    return Response.json({ project: toProjectDTO(project) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", "Invalid update.");
    const { vPromptId, done, isSaved, title, folderId } = parsed.data;

    const project = await db.project.findFirst({ where: { id, userId: user.id } });
    if (!project) return jsonError(404, "NOT_FOUND", "Project not found.");

    const data: Prisma.ProjectUpdateInput = {};
    if (typeof isSaved === "boolean") data.isSaved = isSaved;
    if (title) data.title = title;

    if (vPromptId !== undefined && typeof done === "boolean") {
      const items = Array.isArray(project.vPrompts) ? (project.vPrompts as unknown as VPromptItem[]) : [];
      if (!items.some((item) => item.id === vPromptId)) {
        return jsonError(404, "NOT_FOUND", "That scene was not found.");
      }
      const next = items.map((item) => (item.id === vPromptId ? { ...item, done } : item));
      data.vPrompts = next as unknown as Prisma.InputJsonValue;
    }

    if (folderId !== undefined) {
      if (folderId === null) {
        data.folder = { disconnect: true };
      } else {
        const folder = await db.folder.findFirst({ where: { id: folderId, userId: user.id }, select: { id: true } });
        if (!folder) return jsonError(404, "NOT_FOUND", "That project was not found.");
        data.folder = { connect: { id: folderId } };
      }
    }

    if (Object.keys(data).length === 0) return jsonError(400, "BAD_REQUEST", "Nothing to update.");

    const updated = await db.project.update({ where: { id }, data });
    return Response.json({ project: toProjectDTO(updated) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const { id } = await ctx.params;

    const result = await db.project.deleteMany({ where: { id, userId: user.id } });
    if (result.count !== 1) return jsonError(404, "NOT_FOUND", "Project not found.");
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
