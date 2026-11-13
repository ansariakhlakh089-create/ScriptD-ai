// FILE: components/chat/ResearchAccordion.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Globe, LoaderCircle, CheckCircle2, ExternalLink } from "lucide-react";
import type { SourceItem } from "@/types";

interface Props {
  isWorking: boolean;
  status: string;
  notes: string | null;
  sources: SourceItem[];
}

export default function ResearchAccordion({ isWorking, status, notes, sources }: Props) {
  const [isOpen, setIsOpen] = useState(isWorking);

  const workingText = status === "RESEARCHING" 
    ? "Searching the web..." 
    : status === "SCRIPTING" 
      ? "Writing your script..." 
      : "Preparing visual prompts...";

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-white/5"
      >
        <div className="flex items-center gap-2 text-cream-dim">
          {isWorking ? (
            <LoaderCircle className="h-4 w-4 animate-spin text-ember" />
          ) : (
            <Globe className="h-4 w-4 text-ember" />
          )}
          <span className={isWorking ? "animate-pulse text-ember-soft font-medium" : "text-cream"}>
            {isWorking ? workingText : `Researched ${sources.length} sources`}
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-cream-dim" /> : <ChevronDown className="h-4 w-4 text-cream-dim" />}
      </button>

      {isOpen && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 text-sm animate-fade-up">
          {isWorking && !notes ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cream-dim">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Analyzing your idea...</span>
              </div>
              <div className="flex items-center gap-2 text-cream-dim">
                <LoaderCircle className="h-3 w-3 animate-spin text-ember" />
                <span>Reading articles and verifying facts...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-cream-dim mb-1">Research Notes</p>
                  <p className="text-xs text-cream-dim leading-relaxed line-clamp-4 hover:line-clamp-none">
                    {notes}
                  </p>
                </div>
              )}
              
              {sources.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-cream-dim mb-2">Sources</p>
                  <ul className="space-y-2">
                    {sources.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] text-cream-dim">
                          {i + 1}
                        </span>
                        <a 
                          href={s.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-ember-soft hover:underline flex items-center gap-1"
                        >
                          {s.title || s.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
