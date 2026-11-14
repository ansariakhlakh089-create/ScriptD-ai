// FILE: lib/session.ts
// Helpers that work out who is logged in on the server.
// IMPORTANT: never take the userId from the browser - always take it from here.
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

// For pages (server components): if the user is not logged in, send them to /login
export async function requireUserOrRedirect(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Standard error reply for API routes
export function jsonError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>
) {
  // `code` is sent as well as `error`, so clients can read either name
  return Response.json({ error: code, code, message, ...extra }, { status });
}

export const unauthorized = () => jsonError(401, "UNAUTHORIZED", "Please log in first.");

export function clientIp(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}
