// FILE: components/shared/CopyButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Purane browsers ke liye dusra tareeka
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
}

interface Props {
  text: string;
  label?: string; // likha ho to icon ke saath text dikhega
  ariaLabel?: string;
  className?: string;
}

export default function CopyButton({ text, label, ariaLabel, className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      aria-label={ariaLabel ?? label ?? "Copy"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${
        copied ? "bg-emerald-500/30 text-emerald-100" : "bg-white/10 text-cream hover:bg-white/20"
      } ${className}`}
    >
      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {label && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
