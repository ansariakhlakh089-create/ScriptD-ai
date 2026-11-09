// FILE: app/api/folders/route.ts
// "Your Projects" tab: naam wale folder banana, dekhna, naam badalna, hatana
// (folder hatane par uski scripts delete nahi hoti, sirf folder se bahar aa jaati hain)
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, jsonError, unauthorized } from "@/lib/session";
import { handleRouteError } from "@/lib/limits";
import type { FolderDTO } from "@/types";

export const runtime = "nodejs";

const MAX_FOLDERS = 50;

const nameSchema = z.string().trim().min(1, "Please enter a name.").max(60, "Name is too long (max 60).");
const createSchema = z.object({ name: nameSchema });
const renameSchema = z.object({ id: z.string().min(1).max(64), name: nameSchema });

function toDTO(f: { id: string; name: string; createdAt: Date; _count: { projects: number } }): FolderDTO {
  return { id: f.id, name: f.name, count: f._count.projects, createdAt: f.createdAt.toISOString() };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const rows = await db.folder.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: MAX_FOLDERS,
      select: { id: true, name: true, createdAt: true, _count: { select: { projects: true } } },
    });

    return Response.json({ folders: rows.map(toDTO) });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid name.");
    const { name } = parsed.data;

    const total = await db.folder.count({ where: { userId: user.id } });
    if (total >= MAX_FOLDERS) return jsonError(409, "LIMIT_REACHED", `You can have up to ${MAX_FOLDERS} projects.`);

    const same = await db.folder.findFirst({
      where: { userId: user.id, name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (same) return jsonError(409, "ALREADY_EXISTS", "You already have a project with this name.");

    const created = await db.folder.create({
      data: { userId: user.id, name },
      select: { id: true, name: true, createdAt: true, _count: { select: { projects: true } } },
    });

    return Response.json({ folder: toDTO(created) }, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const parsed = renameSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid request.");
    const { id, name } = parsed.data;

    const result = await db.folder.updateMany({ where: { id, userId: user.id }, data: { name } });
    if (result.count !== 1) return jsonError(404, "NOT_FOUND", "Project not found.");

    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return jsonError(400, "BAD_REQUEST", "id is required.");

    const result = await db.folder.deleteMany({ where: { id, userId: user.id } });
    if (result.count !== 1) return jsonError(404, "NOT_FOUND", "Project not found.");

    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
