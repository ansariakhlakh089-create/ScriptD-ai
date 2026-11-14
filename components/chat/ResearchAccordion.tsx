// FILE: components/chat/ResearchAccordion.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Globe, LoaderCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { NotesText } from "@/components/shared/ColorText";
import type { SourceItem } from "@/types";

interface Props {
  isWorking: boolean;
  status: string;
  notes: string | null;
  sources: SourceItem[];
}

export default function ResearchAccordion({ isWorking, status, notes, sources }: Props) {
  const [isOpen, setIsOpen] = useState(isWorking);
  const wasWorking = useRef(isWorking);

  // Collapse automatically once the work is finished
  useEffect(() => {
    if (wasWorking.current && !isWorking) setIsOpen(false);
    wasWorking.current = isWorking;
  }, [isWorking]);

  const cleanNotes = notes ? notes.trim() : null;

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
            {isWorking ? (
              workingText
            ) : (
              <>
                Researched <span className="font-semibold text-gold">{sources.length}</span> sources
              </>
            )}
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-cream-dim" /> : <ChevronDown className="h-4 w-4 text-cream-dim" />}
      </button>

      {isOpen && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 text-sm animate-fade-up">
          {isWorking && !cleanNotes ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cream-dim">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span>Analyzing your idea...</span>
              </div>
              <div className="flex items-center gap-2 text-cream-dim">
                <LoaderCircle className="h-4 w-4 animate-spin text-ember-soft" />
                <span>Reading articles and verifying facts...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cleanNotes && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gold">Research notes</p>
                  <div className="max-h-72 overflow-y-auto pr-1">
                    <NotesText text={cleanNotes} />
                  </div>
                </div>
              )}
              
              {sources.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-mist">Sources</p>
                  <ul className="space-y-3">
                    {sources.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ember/20 text-xs font-semibold text-ember-soft">
                          {i + 1}
                        </span>
                        <a 
                          href={s.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex min-w-0 items-center gap-1 break-words py-0.5 text-sm text-mist-soft hover:underline"
                        >
                          {s.title || s.url}
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
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
