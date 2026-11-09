// FILE: app/(main)/layout.tsx
import { requireUserOrRedirect } from "@/lib/session";

// Dashboard aur chat jaise saare andar ke pages par login zaroori hai
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  await requireUserOrRedirect();
  return <div className="min-h-dvh bg-taupe text-cream">{children}</div>;
}
