// FILE: components/chat/ScriptPanel.tsx
"use client";

import { LoaderCircle, Download } from "lucide-react";
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

  const handleDownload = () => {
    const blob = new Blob([everything], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title || "script"}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-cream-dim">
          <strong className="text-cream">{words.toLocaleString("en-IN")}</strong> words · about {minutes} min
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-cream hover:bg-white/20 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
          <CopyButton text={everything} label="Copy all" />
        </div>
      </div>

      {project.title && (
        <Section title="Title" copyText={project.title}>
          <p className="text-xl font-semibold leading-snug text-white">{project.title}</p>
        </Section>
      )}

      <Section title="Script" copyText={project.script}>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-cream">{project.script}</p>
      </Section>

      {project.description && (
        <Section title="Description" copyText={project.description}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream">{project.description}</p>
        </Section>
      )}

      {project.tags.length > 0 && (
        <Section title="Tags" copyText={project.tags.join(", ")}>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cream">
                {tag}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
