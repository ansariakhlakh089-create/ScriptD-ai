// FILE: components/chat/ChatPanel.tsx
"use client";

import { useState, type ReactNode } from "react";
import { Check, CircleAlert, ExternalLink, LoaderCircle } from "lucide-react";
import CopyButton from "@/components/shared/CopyButton";
import { SCRIPT_LENGTHS } from "@/lib/constants";
import type { MessageDTO, ProjectDTO, SourceItem } from "@/types";

interface Props {
  project: ProjectDTO | null;
  messages: MessageDTO[];
  starting: boolean; // naya project abhi ban raha hai
  onGoTab: (tab: "script" | "vprompt") => void;
  onRetry: () => void;
}

// ------------------------------------------------------------ chhota text-formatter (## heading, - list, **bold**)
function renderInline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
}

interface ListState {
  ordered: boolean;
  items: string[];
}

function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const cur: { list: ListState | null } = { list: null };

  const flush = () => {
    const list = cur.list;
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`list-${blocks.length}`}
        className={`my-2 space-y-1.5 pl-5 text-base leading-relaxed text-cream ${list.ordered ? "list-decimal" : "list-disc"}`}
      >
        {list.items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </Tag>
    );
    cur.list = null;
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
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="mb-1 mt-4 text-sm font-semibold uppercase tracking-wide text-ember-soft first:mt-0">
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
      if (cur.list && cur.list.ordered !== ordered) flush();
      if (!cur.list) cur.list = { ordered, items: [] };
      cur.list.items.push(itemText);
      continue;
    }

    flush();
    blocks.push(
      <p key={`p-${blocks.length}`} className="my-2 text-base leading-relaxed text-cream">
        {renderInline(line)}
      </p>
    );
  }
  flush();

  return <div>{blocks}</div>;
}

// ------------------------------------------------------------ chhote hisse
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="glass animate-fade-up p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ember-soft">{title}</h2>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Sources({ sources }: { sources: SourceItem[] }) {
  const allLinks = sources.map((s) => `${s.title}\n${s.url}`).join("\n\n");
  return (
    <Card title="Sources & links" action={<CopyButton text={allLinks} label="Copy links" />}>
      <ul className="space-y-3">
        {sources.map((s) => (
          <li key={s.url} className="rounded-xl border border-white/15 bg-black/10 p-3">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-sm font-semibold text-white underline-offset-2 hover:underline"
            >
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-ember-soft" aria-hidden />
              <span className="min-w-0 break-words">{s.title}</span>
            </a>
            <p className="mt-1 text-xs text-cream-dim">{hostOf(s.url)}</p>
            {s.note && <p className="mt-1.5 text-sm leading-relaxed text-cream">{s.note}</p>}
            <p className={`mt-2 text-xs font-medium ${s.verified ? "text-emerald-200" : "text-amber-200"}`}>
              {s.verified ? "Found by web search" : "Not verified, check this link yourself"}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const STEPS = [
  { key: "RESEARCHING", label: "Research & sources" },
  { key: "SCRIPTING", label: "Writing the script" },
  { key: "VPROMPTING", label: "Visual prompts" },
];

function Progress({ status, note }: { status: string; note: string | null }) {
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <section className="glass animate-fade-up p-4" aria-live="polite">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ember-soft">Working on it</h2>
      <ol className="mt-3 space-y-3">
        {STEPS.map((step, i) => (
          <li key={step.key} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                i < current ? "bg-emerald-500/30 text-emerald-100" : i === current ? "bg-ember/30 text-ember-soft" : "bg-white/10 text-cream-dim"
              }`}
            >
              {i < current ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : i === current ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-cream-dim" />
              )}
            </span>
            <span className={i === current ? "font-semibold text-white" : i < current ? "text-cream" : "text-cream-dim"}>
              {step.label}
            </span>
          </li>
        ))}
      </ol>
      {note && <p className="mt-3 text-xs text-cream-dim">{note}</p>}
    </section>
  );
}

export default function ChatPanel({ project, messages, starting, onGoTab, onRetry }: Props) {
  const [activeDot, setActiveDot] = useState(0);

  // Abhi koi project nahi
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
            <p className="mt-3 text-base leading-relaxed text-cream-dim">
              Neeche apna idea likho. Topic, Type aur Tone chunoge to script aur behtar banegi.
              <br />
              Pehle research aur links milenge, phir script aur visual prompts.
            </p>
          </>
        )}
      </div>
    );
  }

  const working = ["RESEARCHING", "SCRIPTING", "VPROMPTING"].includes(project.status);
  const marker = "## Script roadmap";
  const roadmap = project.roadmap ?? "";
  const cut = roadmap.indexOf(marker);
  const researchPart = cut === -1 ? roadmap : roadmap.slice(0, cut);
  const roadmapPart = cut === -1 ? "" : roadmap.slice(cut);

  // Pehla message wahi idea hai jo upar bubble mein dikh raha hai, use dobara mat dikhao
  const followUps = messages.filter((m, i) => !(i === 0 && m.role === "USER" && m.content === project.topic));

  // User ke har sawal ka kram (dot navigation ke liye)
  const userMessageAnchors: { anchorId: string; label: string; msgId?: string }[] = [
    { anchorId: "user-chat-0", label: project.topic },
  ];
  const msgAnchorMap = new Map<string, string>();
  followUps.forEach((m) => {
    if (m.role === "USER") {
      const anchorId = `user-chat-${userMessageAnchors.length}`;
      msgAnchorMap.set(m.id, anchorId);
      userMessageAnchors.push({ anchorId, label: m.content, msgId: m.id });
    }
  });

  function jumpToChat(index: number, anchorId: string) {
    setActiveDot(index);
    const el = document.getElementById(anchorId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const meta = [project.genre, project.tone, SCRIPT_LENGTHS[project.length].label].filter(Boolean).join(" · ");

  return (
    <div className="relative space-y-4 pb-4 pr-5">
      {/* Daayin taraf ke chat navigation dots (o-o-o-o) */}
      <nav
        aria-label="Jump to your questions"
        className="fixed right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center"
      >
        <div className="relative flex flex-col items-center gap-3">
          {userMessageAnchors.length > 1 && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-1.5 top-1.5 left-1/2 w-px -translate-x-1/2 bg-white/35"
            />
          )}
          {userMessageAnchors.map((item, idx) => {
            const isCurrent = activeDot === idx;
            return (
              <button
                key={item.anchorId}
                type="button"
                onClick={() => jumpToChat(idx, item.anchorId)}
                title={`Chat ${idx + 1}: ${item.label.slice(0, 40)}`}
                aria-label={`Jump to question ${idx + 1}`}
                className={`relative z-10 h-3 w-3 rounded-full border transition ${
                  isCurrent
                    ? "scale-110 border-ember bg-ember shadow-glow"
                    : "border-white/70 bg-plum-deep hover:border-ember-soft hover:bg-ember/40"
                }`}
              />
            );
          })}
        </div>
      </nav>

      {/* User ka pehla idea */}
      <div id="user-chat-0" className="scroll-mt-4 flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-br-md bg-ember/25 px-4 py-3">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white">{project.topic}</p>
          {meta && <p className="mt-2 text-xs text-ember-soft">{meta}</p>}
        </div>
      </div>

      {working && <Progress status={project.status} note={project.progressNote} />}

      {project.status === "ERROR" && (
        <section role="alert" className="animate-fade-up rounded-2xl border border-red-300/40 bg-red-950/40 p-4">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-red-100">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {project.errorMessage ?? "Something went wrong."}
          </p>
          <button type="button" onClick={onRetry} className="btn-ember mt-3">
            Try again
          </button>
        </section>
      )}

      {researchPart.trim() && (
        <Card title="Research">
          <RichText text={researchPart} />
        </Card>
      )}

      {project.sources.length > 0 && <Sources sources={project.sources} />}

      {roadmapPart.trim() && (
        <Card title="Script roadmap">
          <RichText text={roadmapPart} />
        </Card>
      )}

      {project.status === "DONE" && (
        <section className="animate-fade-up rounded-2xl border border-ember/60 bg-ember/10 p-4">
          <p className="text-base font-semibold text-white">Your script is ready</p>
          {project.errorMessage && <p className="mt-1 text-sm text-amber-100">{project.errorMessage}</p>}
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={() => onGoTab("script")} className="btn-ember">
              View script
            </button>
            <button type="button" onClick={() => onGoTab("vprompt")} className="btn-glass">
              Visual prompts
            </button>
          </div>
        </section>
      )}

      {followUps.map((m) =>
        m.role === "USER" ? (
          <div key={m.id} id={msgAnchorMap.get(m.id)} className="scroll-mt-4 flex justify-end">
            <div className="max-w-[88%] rounded-2xl rounded-br-md bg-ember/25 px-4 py-3">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-white">{m.content}</p>
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex justify-start">
            <div className="glass max-w-[92%] rounded-bl-md px-4 py-3">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-cream">{m.content}</p>
              <div className="mt-2">
                <CopyButton text={m.content} label="Copy" ariaLabel="Copy reply" />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
