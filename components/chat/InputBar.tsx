// FILE: components/chat/InputBar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, LoaderCircle, Plus, X } from "lucide-react";
import { GENRES, SCRIPT_LENGTHS, TONES, type ScriptLength } from "@/lib/constants";
import type { FolderDTO } from "@/types";

export interface Selection {
  topic: string | null;
  genre: string | null; // "Type" chip
  tone: string | null;
  length: ScriptLength;
  folderId: string | null;
}

// Options for the "Topic" chip (edit freely)
export const TOPICS = [
  "Geopolitics",
  "History",
  "Science",
  "Technology",
  "Business",
  "Crime",
  "Health",
  "Sports",
  "Entertainment",
  "Education",
  "Lifestyle",
] as const;

type SheetKind = "topic" | "genre" | "tone" | "more" | null;

interface Props {
  mode: "new" | "followup";
  value: string;
  onChange: (value: string) => void;
  selection: Selection;
  onSelection: (patch: Partial<Selection>) => void;
  folders: FolderDTO[];
  onSend: () => void;
  busy: boolean; // a request is in progress
  locked: boolean; // the script is being created, typing is disabled
  maxWords: number | null;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/60" />
      <div className="relative z-10 max-h-[80dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/20 bg-plum-deep p-5 pb-8 shadow-glass animate-fade-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function OptionChips({
  options,
  current,
  onPick,
}: {
  options: readonly string[];
  current: string | null;
  onPick: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onPick(null)} className={`chip px-4 py-2 text-sm ${current === null ? "border-ember bg-ember/25" : ""}`}>
        None
      </button>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          className={`chip px-4 py-2 text-sm ${current === o ? "border-ember bg-ember/25" : ""}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function InputBar(props: Props) {
  const { mode, value, onChange, selection, onSelection, folders, onSend, busy, locked, maxWords } = props;
  const [sheet, setSheet] = useState<SheetKind>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const words = countWords(value);
  const overLimit = maxWords !== null && words > maxWords;
  const canSend = !busy && !locked && value.trim().length >= (mode === "new" ? 3 : 1) && !overLimit;

  const placeholder = locked
    ? "Working on your script..."
    : mode === "new"
      ? "Type your idea for creation..."
      : "Ask a follow-up about this script...";

  // The textarea starts at one line and grows as you type (max 8rem)
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [value]);

  function pick(patch: Partial<Selection>) {
    onSelection(patch);
    setSheet(null);
  }

  const chips: { kind: Exclude<SheetKind, "more" | null>; label: string; value: string | null }[] = [
    { kind: "topic", label: "Topic", value: selection.topic },
    { kind: "genre", label: "Type", value: selection.genre },
    { kind: "tone", label: "Tone", value: selection.tone },
  ];

  const sendButton = (
    <button
      type="button"
      onClick={onSend}
      disabled={!canSend}
      aria-label="Send"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember text-white shadow-glow transition hover:bg-ember-hover active:scale-95 disabled:opacity-40 disabled:shadow-none"
    >
      {busy ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden /> : <ArrowUp className="h-5 w-5" aria-hidden />}
    </button>
  );

  return (
    <div className="shrink-0 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
      <div className="rounded-2xl border border-white/30 bg-white/10 px-2.5 py-2 backdrop-blur-sm">
        <label htmlFor="studio-input" className="sr-only">
          {placeholder}
        </label>
        <textarea
          id="studio-input"
          ref={areaRef}
          rows={1}
          maxLength={4000}
          value={value}
          disabled={locked}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSend) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          className="block max-h-32 min-h-[2.5rem] w-full resize-none bg-transparent px-1.5 py-1.5 text-base leading-snug text-cream outline-none placeholder:text-cream-dim/80 disabled:opacity-60"
        />

        <div className="mt-1.5 flex items-center gap-1.5">
          {mode === "new" ? (
            <>
              {/* All three chips, the (+) button and send sit on one line, with no sideways scrolling */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                {chips.map((c) => (
                  <button
                    key={c.kind}
                    type="button"
                    disabled={locked}
                    onClick={() => setSheet(c.kind)}
                    aria-label={`${c.label}: ${c.value ?? "not set"}`}
                    className={`flex min-h-9 min-w-0 flex-1 basis-0 items-center justify-center rounded-full border px-2.5 py-1.5 text-sm transition hover:bg-white/20 disabled:opacity-50 ${
                      c.value ? "border-ember/70 bg-ember/15 font-semibold text-ember-soft" : "border-white/25 bg-white/10 text-cream-dim"
                    }`}
                  >
                    <span className="min-w-0 truncate">{c.value ?? c.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={locked}
                onClick={() => setSheet("more")}
                aria-label="More options"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 hover:bg-white/20 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" aria-hidden />
              </button>
            </>
          ) : (
            <div className="min-w-0 flex-1 px-1.5">
              {maxWords !== null && words > maxWords * 0.7 && (
                <span className={`text-sm font-medium ${overLimit ? "text-red-200" : "text-cream-dim"}`}>
                  {words}/{maxWords} words
                </span>
              )}
            </div>
          )}
          {sendButton}
        </div>

        {mode === "new" && maxWords !== null && words > maxWords * 0.7 && (
          <p className={`mt-1 px-1.5 text-right text-sm font-medium ${overLimit ? "text-red-200" : "text-cream-dim"}`}>
            {words}/{maxWords} words
          </p>
        )}
      </div>

      {sheet === "topic" && (
        <Sheet title="Topic" onClose={() => setSheet(null)}>
          <OptionChips options={TOPICS} current={selection.topic} onPick={(v) => pick({ topic: v })} />
        </Sheet>
      )}
      {sheet === "genre" && (
        <Sheet title="Type of video" onClose={() => setSheet(null)}>
          <OptionChips options={GENRES} current={selection.genre} onPick={(v) => pick({ genre: v })} />
        </Sheet>
      )}
      {sheet === "tone" && (
        <Sheet title="Tone" onClose={() => setSheet(null)}>
          <OptionChips options={TONES} current={selection.tone} onPick={(v) => pick({ tone: v })} />
        </Sheet>
      )}
      {sheet === "more" && (
        <Sheet title="More options" onClose={() => setSheet(null)}>
          <p className="text-sm font-semibold text-cream-dim">Script length</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(Object.keys(SCRIPT_LENGTHS) as ScriptLength[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onSelection({ length: key })}
                className={`min-h-12 rounded-2xl border px-3 py-3 text-base font-semibold transition ${
                  selection.length === key ? "border-ember bg-ember/20 text-ember-soft" : "border-white/30 bg-white/10 text-cream"
                }`}
              >
                {SCRIPT_LENGTHS[key].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-cream-dim">Long scripts come with the Long Pack, the Creator plan or a long-script top-up.</p>

          <p className="mt-6 text-sm font-semibold text-cream-dim">Save in project</p>
          {folders.length === 0 ? (
            <p className="mt-2 text-sm text-cream-dim">You have no projects yet. Create one from the dashboard.</p>
          ) : (
            <div className="mt-2">
              <OptionChips
                options={folders.map((f) => f.name)}
                current={folders.find((f) => f.id === selection.folderId)?.name ?? null}
                onPick={(name) => onSelection({ folderId: folders.find((f) => f.name === name)?.id ?? null })}
              />
            </div>
          )}

          <button type="button" onClick={() => setSheet(null)} className="btn-ember mt-6 w-full">
            Done
          </button>
        </Sheet>
      )}
    </div>
  );
    }
                    
