// FILE: app/api/user/route.ts
// Top bar ke liye: plan, tokens, free quota kitna bacha
import { getCurrentUser, unauthorized } from "@/lib/session";
import { buildUserSummary, handleRouteError, refreshWindow } from "@/lib/limits";

export const runtime = "nodejs";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return unauthorized();
    const user = await refreshWindow(current);
    return Response.json({ user: buildUserSummary(user) });
  } catch (e) {
    return handleRouteError(e);
  }
}
