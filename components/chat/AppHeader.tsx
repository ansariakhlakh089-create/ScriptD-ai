// FILE: components/layout/AppHeader.tsx
"use client";

import { useState } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { getProduct } from "@/lib/constants";
import type { UserSummary } from "@/types";

interface Props {
  user: UserSummary | null;
  onUpgrade: () => void;
}

function usageLine(user: UserSummary): string {
  const hasPaid = user.tokenBalance > 0 || user.longScriptsLeft > 0 || user.shortScriptsLeft > 0;
  if (hasPaid) {
    return `${user.tokenBalance.toLocaleString("en-IN")} tokens · ${user.longScriptsLeft} long · ${user.shortScriptsLeft} short scripts`;
  }
  return `${user.free.shortScriptsLeft} free script · ${user.free.tokensLeft.toLocaleString("en-IN")} tokens left today`;
}

export default function AppHeader({ user, onUpgrade }: Props) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const initial = (user?.name || user?.email || "C").trim().charAt(0).toUpperCase();
  const planLabel = user && user.plan !== "FREE" ? getProduct(user.plan)?.label ?? user.plan : "Free plan";

  async function handleLogout() {
    setLeaving(true);
    await signOut();
    window.location.href = "/login";
  }

  return (
    <header className="relative border-b border-white/5 bg-white/[0.03] px-5 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-cream">ScriptD AI</h1>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Account menu"
          aria-expanded={open}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ember text-xl font-semibold text-white shadow-glow transition active:scale-95"
        >
          {initial}
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-5 top-[4.5rem] z-40 w-72 rounded-2xl border border-white/25 bg-plum-deep p-4 shadow-glass animate-fade-up">
            <p className="truncate text-base font-semibold text-white">{user?.name ?? "Creator"}</p>
            <p className="truncate text-sm text-cream-dim">{user?.email}</p>

            <div className="mt-4 rounded-xl bg-white/10 p-3">
              <p className="text-sm font-semibold text-ember-soft">{planLabel}</p>
              {user && <p className="mt-1 text-sm leading-relaxed text-cream-dim">{usageLine(user)}</p>}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onUpgrade();
              }}
              className="btn-ember mt-4 w-full"
            >
              <Sparkles className="h-4 w-4" aria-hidden /> Plans &amp; top-up
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={leaving}
              className="btn-glass mt-2 w-full"
            >
              <LogOut className="h-4 w-4" aria-hidden /> {leaving ? "Logging out..." : "Log out"}
            </button>
          </div>
        </>
      )}
    </header>
  );
}
