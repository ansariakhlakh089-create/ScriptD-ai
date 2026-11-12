// FILE: app/api/debug-env/route.ts
// TEMPORARY: sirf jaanchne ke liye. Kaam hone ke baad isko DELETE kar dena.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NAMES = [
  "DATABASE_URL",
  "DIRECT_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
];

export async function GET() {
  const result: Record<string, string> = {};
  for (const name of NAMES) {
    const value = process.env[name];
    if (!value) {
      result[name] = "MISSING";
    } else {
      const spaceNote = value !== value.trim() ? " | SPACE AAGE-PICHHE HAI" : "";
      result[name] = `set (${value.length} chars)${spaceNote}`;
    }
  }
  return NextResponse.json(result);
}
