// FILE: app/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// Home par aaye to: login hai -> dashboard, nahi hai -> login
export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
