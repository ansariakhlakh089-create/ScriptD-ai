// FILE: components/chat/Timeline.tsx  (NAYI FILE)
"use client";

import { useEffect, useState, type RefObject } from "react";
import type { ChatDot } from "@/components/chat/ChatPanel";

interface Props {
  dots: ChatDot[];
  containerRef: RefObject<HTMLDivElement | null>; // wahi scroll hone wala dabba
}

// Right side ki khadi dot-line: har message ek dot, dot dabao to us message par jump
export default function Timeline({ dots, containerRef }: Props) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || dots.length === 0) return;

    const update = () => {
      const limit = el.getBoundingClientRect().top + 28;
      let current = dots[0].id;
      for (const d of dots) {
        const node = document.getElementById(d.id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= limit) current = d.id;
        else break;
      }
      // Sabse neeche pahunch gaye to aakhri dot active
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) current = dots[dots.length - 1].id;
      setActive(current);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [containerRef, dots]);

  if (dots.length < 2) return null;

  function jump(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Chat timeline"
      className="no-scrollbar absolute right-0.5 top-1/2 z-10 flex max-h-[70%] -translate-y-1/2 flex-col items-center overflow-y-auto"
    >
      {dots.map((d) => {
        const isActive = active === d.id;
        return (
          <button
            key={d.id}
            type="button"
            title={d.label}
            aria-label={`Go to: ${d.label}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => jump(d.id)}
            className="flex h-5 w-6 shrink-0 items-center justify-center"
          >
            <span
              className={`block rounded-full transition-all duration-200 ${
                isActive
                  ? "h-2.5 w-2.5 bg-ember shadow-glow"
                  : d.role === "user"
                    ? "h-1.5 w-1.5 bg-ember/60"
                    : "h-1.5 w-1.5 bg-white/35"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
