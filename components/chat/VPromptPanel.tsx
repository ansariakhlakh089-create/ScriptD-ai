// FILE: components/chat/VPromptPanel.tsx
"use client";

import { Check, ExternalLink, LoaderCircle } from "lucide-react";
import CopyButton from "@/components/shared/CopyButton";
import { PromptLegend, PromptText } from "@/components/shared/ColorText";
import { stripMarks } from "@/lib/script-format";
import type { ProjectDTO, VPromptItem } from "@/types";

interface Props {
  project: ProjectDTO | null;
  onToggle: (id: number, done: boolean) => void;
}

function copyTextFor(item: VPromptItem): string {
  if (item.kind === "IMAGE") return item.prompt ?? "";
  return [item.instruction ?? "", item.sourceUrl ? `Link: ${item.sourceUrl}` : ""].filter(Boolean).join("\n");
}

// Copies every scene at once
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
            ? "Creating your visual prompts..."
            : waiting
              ? "Visual prompts for each scene will appear here once your script is ready."
              : project?.status === "ERROR"
                ? "Visual prompts could not be created. Please start again from the Chat tab."
                : "Write your idea in the Chat tab first. Your visual prompts will appear here."}
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
          {project.errorMessage ?? "No visual prompts were created for this script."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-cream-dim">
          <span className="font-semibold text-ember-soft">{doneCount}</span> of{" "}
          <span className="font-semibold text-gold">{items.length}</span> done
        </p>
        <CopyButton text={allPromptsText(items)} label="Copy all" />
      </div>
      {items.some((i) => i.kind === "IMAGE") && <PromptLegend />}

      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className={`glass animate-fade-up border-l-4 p-4 ${item.done ? "border-l-ember" : item.kind === "IMAGE" ? "border-l-ember/40" : "border-l-mist/50"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="text-gold">Scene {item.id}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[13px] ${
                      item.kind === "IMAGE" ? "bg-ember/20 text-ember-soft" : "bg-mist/15 text-mist-soft"
                    }`}
                  >
                    {item.kind === "IMAGE" ? "Image prompt" : "Screenshot"}
                  </span>
                </p>
                {item.sceneLine && (
                  <p className="mt-2 border-l-2 border-l-gold/60 pl-3 text-sm leading-relaxed text-cream-dim">
                    <span className="text-gold">“</span>
                    {stripMarks(item.sceneLine)}
                    <span className="text-gold">”</span>
                  </p>
                )}
              </div>
              <CopyButton text={copyTextFor(item)} ariaLabel={`Copy scene ${item.id}`} />
            </div>

            <div
              className={`mt-3 whitespace-pre-wrap rounded-xl border bg-black/15 p-3 text-base leading-relaxed text-cream ${
                item.kind === "IMAGE" ? "border-ember/30" : "border-mist/30"
              }`}
            >
              {item.kind === "IMAGE" ? <PromptText text={item.prompt ?? ""} /> : item.instruction}
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
                <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                  No verified link for this one. Search for it yourself before using it.
                </p>
              ))}

            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              onClick={() => onToggle(item.id, !item.done)}
              className="mt-4 flex min-h-11 items-center gap-3 text-base font-medium text-cream"
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
