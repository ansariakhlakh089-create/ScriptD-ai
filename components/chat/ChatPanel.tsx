// FILE: components/chat/ChatPanel.tsx
"use client";

import { useMemo } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import CopyButton from "@/components/shared/CopyButton";
import ResearchAccordion from "@/components/chat/ResearchAccordion";
import { renderRich as renderInline } from "@/components/shared/ColorText";
import type { ProjectDTO, MessageDTO } from "@/types";

export interface ChatDot {
  id: string;
  label: string;
  role: string;
}

function RichText({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const list: React.ReactNode[] = [];
    let cur: { ordered: boolean; items: string[] } | null = null;

    const flush = () => {
      if (!cur) return;
      const Tag = cur.ordered ? "ol" : "ul";
      list.push(
        <Tag key={list.length} className={`my-2 space-y-1 pl-5 ${cur.ordered ? "list-decimal" : "list-disc"}`}>
          {cur.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </Tag>
      );
      cur = null;
    };

    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) {
        flush();
        continue;
      }

      const heading = line.match(/^#{1,4}\s+(.*)$/);
      if (heading) {
        flush();
        list.push(
          <h3 key={list.length} className="mb-1 mt-4 text-base font-semibold text-ember-soft">
            {renderInline(heading[1])}
          </h3>
        );
        continue;
      }

      const numbered = line.match(/^\d+[.)]\s+(.*)$/);
      const bullet = line.match(/^[-*•]\s+(.*)$/);
      const itemText = numbered?.[1] ?? bullet?.[1];
      if (itemText !== undefined) {
        const ordered = Boolean(numbered);
        if (!cur || cur.ordered !== ordered) flush();
        if (!cur) cur = { ordered, items: [] };
        cur.items.push(itemText);
        continue;
      }

      flush();
      list.push(
        <p key={list.length} className="my-2 text-base leading-relaxed text-cream">
          {renderInline(line)}
        </p>
      );
    }
    flush();

    return <div>{list}</div>;
  }, [text]);

  return <div>{blocks}</div>;
}

export function buildDots(project: ProjectDTO | null, messages: MessageDTO[]): ChatDot[] {
  const dots: ChatDot[] = [];
  if (project?.topic) {
    dots.push({ id: "msg-idea", label: "Your idea", role: "user" });
  }
  if (project?.status === "DONE") {
    dots.push({ id: "msg-ready", label: "Script ready", role: "assistant" });
  }
  for (const m of messages) {
    dots.push({
      id: `msg-${m.id}`,
      label: m.content.slice(0, 40) + (m.content.length > 40 ? "..." : ""),
      role: m.role.toLowerCase(),
    });
  }
  return dots;
}

export default function ChatPanel({
  project,
  messages,
  starting,
  onGoTab,
  onRetry,
}: {
  project: ProjectDTO | null;
  messages: MessageDTO[];
  starting: boolean;
  onGoTab: (t: "script" | "vprompt") => void;
  onRetry: () => void;
}) {
  if (!project) {
    return (
      <div className="px-6 py-16 text-center">
        {starting ? (
          <>
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-ember-soft" aria-hidden />
            <p className="mt-5 text-base text-cream-dim">Starting...</p>
          </>
        ) : (
          <>
            <p className="text-xl font-semibold text-white">What do you want to create?</p>
            <p className="mt-2 text-base leading-relaxed text-cream-dim">
              Write your idea below. Pick a topic, type and tone for a better script.
              <br />
              You will get research and sources first, then your script and visual prompts.
            </p>
          </>
        )}
      </div>
    );
  }

  const working = ["RESEARCHING", "SCRIPTING", "VPROMPTING"].includes(project.status);
  const showResearch =
    project.status !== "ERROR" && (working || project.sources.length > 0 || Boolean(project.roadmap));

  return (
    <div className="space-y-4 pb-4">
      <div id="msg-idea" className="flex scroll-mt-2 justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-ember/25 px-4 py-3">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white">{project.topic}</p>
          <div className="mt-2 text-sm text-ember-soft">
            {project.genre && <span>{project.genre}</span>}
            {project.tone && <span className="ml-2">• {project.tone}</span>}
            <span className="ml-2">• {project.length === "LONG" ? "Long (10 min)" : "Short (1 min)"}</span>
          </div>
        </div>
      </div>

      {showResearch && (
        <ResearchAccordion 
          isWorking={working} 
          status={project.status} 
          notes={project.roadmap} 
          sources={project.sources} 
        />
      )}

      {project.status === "ERROR" && (
        <section role="alert" className="animate-fade-up rounded-2xl border border-red-300/40 bg-red-950/40 p-4">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-red-100">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {project.errorMessage ?? "Something went wrong."}
          </p>
          <button type="button" onClick={onRetry} className="btn-ember mt-3 text-sm py-2.5">
            Try again
          </button>
        </section>
      )}

      {project.status === "DONE" && (
        <section id="msg-ready" className="animate-fade-up scroll-mt-2 rounded-2xl border border-ember/60 bg-ember/10 p-4">
          <p className="text-base font-semibold text-white">Your script is ready!</p>
          {project.errorMessage && <p className="mt-1 text-sm text-gold">{project.errorMessage}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => onGoTab("script")} className="btn-ember text-sm py-2.5">
              View script
            </button>
            <button type="button" onClick={() => onGoTab("vprompt")} className="btn-glass text-sm py-2.5">
              Visual prompts
            </button>
          </div>
        </section>
      )}

      {messages.map((m) =>
        m.role === "USER" ? (
          <div key={m.id} id={`msg-${m.id}`} className="flex scroll-mt-2 justify-end">
            <div className="max-w-[88%] rounded-2xl rounded-br-md bg-ember/25 px-4 py-3">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-white">{m.content}</p>
            </div>
          </div>
        ) : (
          <div key={m.id} id={`msg-${m.id}`} className="flex scroll-mt-2 justify-start">
            <div className="glass max-w-[92%] rounded-2xl rounded-bl-md px-4 py-3">
              {m.content ? (
                <>
                  <RichText text={m.content} />
                  <div className="mt-2">
                    <CopyButton text={m.content} label="Copy" ariaLabel="Copy reply" />
                  </div>
                </>
              ) : (
                <LoaderCircle className="h-4 w-4 animate-spin text-ember-soft" aria-label="Thinking" />
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
