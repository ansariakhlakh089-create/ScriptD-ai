// FILE: components/chat/ScriptPanel.tsx
"use client";

import { LoaderCircle } from "lucide-react";
import CopyButton from "@/components/shared/CopyButton";
import { WORKING_STATUSES } from "@/lib/constants";
import type { ProjectDTO } from "@/types";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function Section({ title, copyText, children }: { title: string; copyText: string; children: React.ReactNode }) {
  return (
    <section className="glass animate-fade-up p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ember-soft">{title}</h2>
        <CopyButton text={copyText} label="Copy" ariaLabel={`Copy ${title}`} />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Poori script ek saath copy karne ke liye (title + script + description + tags)
export function scriptEverything(project: ProjectDTO): string {
  return [
    project.title ?? "",
    project.script ?? "",
    project.description ?? "",
    project.tags.length ? `Tags: ${project.tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function ScriptPanel({ project }: { project: ProjectDTO | null }) {
  if (!project || !project.script) {
    const working = project ? (WORKING_STATUSES as string[]).includes(project.status) : false;
    return (
      <div className="px-6 py-16 text-center">
        {working ? (
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-ember-soft" aria-hidden />
        ) : null}
        <p className="mt-5 text-base leading-relaxed text-cream-dim">
          {project?.status === "ERROR"
            ? "The script could not be created. Please start again from the Chat tab."
            : working
              ? "Your script will appear here as soon as the research is done."
              : "Pehle Chat tab mein apna idea likho. Script yahan dikhegi."}
        </p>
      </div>
    );
  }

  const words = wordCount(project.script);
  const minutes = Math.max(1, Math.round(words / 150));
  const everything = scriptEverything(project);

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-cream-dim">
          {words.toLocaleString("en-IN")} words · about {minutes} min
        </p>
        <CopyButton text={everything} label="Copy everything" />
      </div>

      {project.title && (
        <Section title="Title" copyText={project.title}>
          <p className="text-xl font-semibold leading-snug text-white">{project.title}</p>
        </Section>
      )}

      <Section title="Script" copyText={project.script}>
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-cream">{project.script}</p>
      </Section>

      {project.description && (
        <Section title="Description" copyText={project.description}>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-cream">{project.description}</p>
        </Section>
      )}

      {project.tags.length > 0 && (
        <Section title="Tags" copyText={project.tags.join(", ")}>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm text-cream">
                {tag}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
