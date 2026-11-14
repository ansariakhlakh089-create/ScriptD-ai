// FILE: app/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// On the home page: logged in -> dashboard, not logged in -> login
export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
