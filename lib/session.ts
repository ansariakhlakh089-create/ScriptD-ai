// FILE: lib/session.ts
// Server par "kaun logged-in hai" nikalne ke helpers.
// IMPORTANT: userId kabhi browser se mat lo - hamesha yahin se lo.
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
}

export type AppUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

// Pages (server components) ke liye: login nahi hai to /login par bhej do
export async function requireUserOrRedirect(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// API routes ke liye standard error reply
export function jsonError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>
) {
  return Response.json({ error: code, message, ...extra }, { status });
}

export const unauthorized = () => jsonError(401, "UNAUTHORIZED", "Please log in first.");

export function clientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}
