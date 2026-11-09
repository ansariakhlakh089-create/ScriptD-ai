// FILE: app/(auth)/login/page.tsx
import type { Metadata } from "next";
import LoginScreen from "@/components/auth/LoginScreen";

export const metadata: Metadata = { title: "Login" };

// Login ke baad kahan bhejna hai - sirf apni site ka path allow (bahar ki site par nahi)
function safeNext(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/dashboard";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  return <LoginScreen next={safeNext(params.next)} />;
}
