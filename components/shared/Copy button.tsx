// FILE: components/shared/CopyButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

// Clipboard mein copy (purane browsers ke liye fallback ke saath)
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // neeche fallback try hoga
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

interface Props {
  text: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

export default function CopyButton({ text, label = "Copy", iconOnly = false, className = "" }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  }

  const text2 = state === "copied" ? "Copied" : state === "failed" ? "Select & copy" : label;

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      aria-label={iconOnly ? label : undefined}
      className={`chip shrink-0 ${state === "copied" ? "border-emerald-300/60 bg-emerald-400/20" : ""} ${className}`}
    >
      {state === "copied" ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {!iconOnly && <span aria-live="polite">{text2}</span>}
    </button>
  );
}
