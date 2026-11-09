// FILE: app/api/projects/route.ts
// Dashboard ki list:  GET /api/projects?tab=all|done|saved&cursor=...
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, unauthorized } from "@/lib/session";
import { handleRouteError } from "@/lib/limits";
import type { ProjectListItem } from "@/types";
import type { ProjectStatus } from "@/lib/constants";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const params = new URL(req.url).searchParams;
    const tab = params.get("tab") ?? "all";
    const cursor = params.get("cursor");

    const where: Prisma.ProjectWhereInput = { userId: user.id };
    if (tab === "done") where.status = "DONE";
    if (tab === "saved") where.isSaved = true;

    const rows = await db.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        topic: true,
        genre: true,
        length: true,
        status: true,
        isSaved: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const hasMore = rows.length > PAGE_SIZE;
    const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;

    const items: ProjectListItem[] = page.map((p) => ({
      id: p.id,
      title: p.title,
      topic: p.topic,
      genre: p.genre,
      length: p.length === "LONG" ? "LONG" : "SHORT",
      status: p.status as ProjectStatus,
      isSaved: p.isSaved,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return Response.json({ items, nextCursor: hasMore ? page[page.length - 1].id : null });
  } catch (e) {
    return handleRouteError(e);
  }
}
