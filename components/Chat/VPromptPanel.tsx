// FILE: components/chat/VPromptPanel.tsx
"use client";

import { Check, ExternalLink, LoaderCircle } from "lucide-react";
import CopyButton from "@/components/shared/CopyButton";
import type { ProjectDTO, VPromptItem } from "@/types";

interface Props {
  project: ProjectDTO | null;
  onToggle: (id: number, done: boolean) => void;
}

function copyTextFor(item: VPromptItem): string {
  if (item.kind === "IMAGE") return item.prompt ?? "";
  return [item.instruction ?? "", item.sourceUrl ? `Link: ${item.sourceUrl}` : ""].filter(Boolean).join("\n");
}

// Saare scenes ek saath copy karne ke liye
export function allPromptsText(items: VPromptItem[]): string {
  return items
    .map((i) => `Scene ${i.id} (${i.kind === "IMAGE" ? "Image prompt" : "Screenshot"})\n${copyTextFor(i)}`)
    .join("\n\n");
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function VPromptPanel({ project, onToggle }: Props) {
  if (!project || project.status !== "DONE") {
    const loading = project?.status === "VPROMPTING";
    const waiting = project && ["RESEARCHING", "SCRIPTING"].includes(project.status);
    return (
      <div className="px-6 py-16 text-center">
        {(loading || waiting) && <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-ember-soft" aria-hidden />}
        <p className="mt-5 text-base leading-relaxed text-cream-dim">
          {loading
            ? "Visual prompts ban rahe hain..."
            : waiting
              ? "Script poori hone ke baad yahan har scene ke visual prompts aayenge."
              : project?.status === "ERROR"
                ? "Visual prompts nahi ban paaye. Chat tab se dobara shuru karo."
                : "Pehle Chat tab mein apna idea likho. Visual prompts yahan dikhenge."}
        </p>
      </div>
    );
  }

  const items = project.vPrompts;
  const doneCount = items.filter((i) => i.done).length;

  if (items.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-base leading-relaxed text-cream-dim">
          {project.errorMessage ?? "Is script ke liye koi visual prompt nahi bana."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-cream-dim">
          {doneCount} of {items.length} done
        </p>
        <CopyButton text={allPromptsText(items)} label="Copy all" />
      </div>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="glass animate-fade-up p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-ember-soft">
                  Scene {item.id} · {item.kind === "IMAGE" ? "Image prompt" : "Screenshot"}
                </p>
                {item.sceneLine && <p className="mt-1.5 text-sm leading-relaxed text-cream-dim">“{item.sceneLine}”</p>}
              </div>
              <CopyButton text={copyTextFor(item)} ariaLabel={`Copy scene ${item.id}`} />
            </div>

            <div className="mt-3 whitespace-pre-wrap rounded-xl border border-white/20 bg-black/15 p-3 text-sm leading-relaxed text-cream">
              {item.kind === "IMAGE" ? item.prompt : item.instruction}
            </div>

            {item.kind === "SCREENSHOT" &&
              (item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-ember/20 px-4 py-2 text-sm font-semibold text-ember-soft transition hover:bg-ember/30"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">Open source · {hostOf(item.sourceUrl)}</span>
                </a>
              ) : (
                <p className="mt-3 text-xs leading-relaxed text-cream-dim">
                  No verified link for this one. Search for it yourself before using it.
                </p>
              ))}

            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              onClick={() => onToggle(item.id, !item.done)}
              className="mt-4 flex items-center gap-3 text-sm font-medium text-cream"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
                  item.done ? "border-ember bg-ember text-white" : "border-white/50 bg-transparent"
                }`}
              >
                {item.done && <Check className="h-4 w-4" aria-hidden />}
              </span>
              {item.done ? "Done" : "Mark as done"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
