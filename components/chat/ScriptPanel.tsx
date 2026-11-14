// FILE: components/chat/ScriptPanel.tsx
"use client";

import { LoaderCircle, Download } from "lucide-react";
import CopyButton from "@/components/shared/CopyButton";
import { DescriptionText, ScriptText } from "@/components/shared/ColorText";
import { WORKING_STATUSES } from "@/lib/constants";
import { stripMarks } from "@/lib/script-format";
import type { ProjectDTO } from "@/types";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Each section gets its own accent colour so the screen is easy to scan
const TONES = {
  gold: { title: "text-gold", bar: "border-l-gold/70" },
  teal: { title: "text-ember-soft", bar: "border-l-ember/70" },
  mist: { title: "text-mist", bar: "border-l-mist/70" },
  blush: { title: "text-blush", bar: "border-l-blush/70" },
} as const;

type Tone = keyof typeof TONES;

function Section({
  title,
  tone,
  copyText,
  children,
}: {
  title: string;
  tone: Tone;
  copyText: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`glass animate-fade-up border-l-4 p-4 ${TONES[tone].bar}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={`text-sm font-semibold ${TONES[tone].title}`}>{title}</h2>
        <CopyButton text={copyText} label="Copy" ariaLabel={`Copy ${title}`} />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Everything the creator can copy or download, without the highlight marks
export function scriptEverything(project: ProjectDTO): string {
  return [
    project.title ?? "",
    stripMarks(project.script ?? ""),
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
        {working ? <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-ember-soft" aria-hidden /> : null}
        <p className="mt-5 text-base leading-relaxed text-cream-dim">
          {project?.status === "ERROR"
            ? "The script could not be created. Please start again from the Chat tab."
            : working
              ? "Your script will appear here as soon as the research is done."
              : "Write your idea in the Chat tab first. Your script will appear here."}
        </p>
      </div>
    );
  }

  const cleanScript = stripMarks(project.script);
  const words = wordCount(cleanScript);
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
        <p className="text-sm text-cream-dim">
          <strong className="text-gold">{words.toLocaleString("en-IN")}</strong> words · about{" "}
          <strong className="text-ember-soft">{minutes}</strong> min
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm text-cream transition hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <CopyButton text={everything} label="Copy all" />
        </div>
      </div>

      {project.title && (
        <Section title="Title" tone="gold" copyText={project.title}>
          <p className="gradient-text pb-1 text-2xl font-semibold leading-snug">{project.title}</p>
        </Section>
      )}

      <Section title="Script" tone="teal" copyText={cleanScript}>
        <ScriptText text={project.script} />
      </Section>

      {project.description && (
        <Section title="Description" tone="mist" copyText={project.description}>
          <DescriptionText text={project.description} />
        </Section>
      )}

      {project.tags.length > 0 && (
        <Section title="Tags" tone="blush" copyText={project.tags.join(", ")}>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ember/40 bg-ember/10 px-3 py-1.5 text-sm text-ember-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
