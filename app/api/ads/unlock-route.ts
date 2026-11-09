// FILE: app/api/ads/unlock/route.ts
// Free user ads dekhne ke baad ek extra message unlock karta hai.
// NOTE: browser ka "ads dekhe" claim server verify nahi kar sakta, isliye damage ek window mein sirf 3 unlock tak seemit hai.
import { z } from "zod";
import { db } from "@/lib/db";
import { FREE_LIMITS } from "@/lib/constants";
import { getCurrentUser, jsonError, unauthorized } from "@/lib/session";
import { handleRouteError, isPlanActive, refreshWindow, windowEnd } from "@/lib/limits";

export const runtime = "nodejs";

const bodySchema = z.object({
  projectId: z.string().min(1).max(64),
  adsWatched: z.number().int().refine((n) => n === FREE_LIMITS.adsForShortQuestion || n === FREE_LIMITS.adsForBigQuestion),
});

export async function POST(req: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return unauthorized();

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", "Invalid request.");
    const { projectId, adsWatched } = parsed.data;

    const user = await refreshWindow(current);

    const project = await db.project.findFirst({ where: { id: projectId, userId: user.id }, select: { id: true } });
    if (!project) return jsonError(404, "NOT_FOUND", "Project not found.");

    // Paid users ko ads ki zaroorat nahi
    if (user.tokenBalance > 0 || isPlanActive(user)) {
      return Response.json({ ok: true, skipped: true });
    }

    const unlocksLeft = FREE_LIMITS.adUnlocksPerWindow - user.adUnlocksUsed;
    if (unlocksLeft <= 0) {
      return jsonError(402, "FREE_LIMIT_REACHED", "You have used all free unlocks for now.", {
        resetsAt: windowEnd(user).toISOString(),
      });
    }

    // Do ad-unlock ke beech kam se kam 30 second (ads itni jaldi nahi dekhe ja sakte)
    const last = await db.tokenLedger.findFirst({
      where: { userId: user.id, reason: "AD_UNLOCK" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (last && Date.now() - last.createdAt.getTime() < 30_000) {
      return jsonError(429, "TOO_FAST", "Please finish watching the ads first.");
    }

    const claimed = await db.user.updateMany({
      where: { id: user.id, adUnlocksUsed: { lt: FREE_LIMITS.adUnlocksPerWindow } },
      data: { adUnlocksUsed: { increment: 1 } },
    });
    if (claimed.count !== 1) return jsonError(409, "BUSY", "Please try again.");

    await db.tokenLedger.create({
      data: { userId: user.id, projectId, delta: 0, reason: "AD_UNLOCK", meta: { adsWatched } },
    });

    return Response.json({ ok: true, unlocksLeft: unlocksLeft - 1 });
  } catch (e) {
    return handleRouteError(e);
  }
}
