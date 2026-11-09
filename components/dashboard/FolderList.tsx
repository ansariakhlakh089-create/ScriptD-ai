// FILE: components/dashboard/FolderList.tsx
"use client";

import { useState } from "react";
import { Folder, LoaderCircle, Plus, Trash2 } from "lucide-react";
import type { FolderDTO } from "@/types";

interface Props {
  folders: FolderDTO[];
  loaded: boolean;
  onOpen: (folder: FolderDTO) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (folder: FolderDTO) => Promise<void>;
}

export default function FolderList({ folders, loaded, onOpen, onCreate, onDelete }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await onCreate(trimmed);
      setName("");
      setCreating(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {creating ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="glass flex items-center gap-2 p-2 pl-4"
        >
          <label htmlFor="project-name" className="sr-only">
            Project name
          </label>
          <input
            id="project-name"
            autoFocus
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name (e.g. Space Series)"
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-cream outline-none placeholder:text-cream-dim/80"
          />
          <button type="button" onClick={() => setCreating(false)} className="px-2 text-sm text-cream-dim">
            Cancel
          </button>
          <button type="submit" disabled={busy || !name.trim()} className="btn-ember px-4 py-2">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : "Create"}
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setCreating(true)} className="btn-glass w-full border-dashed">
          <Plus className="h-4 w-4" aria-hidden /> New project
        </button>
      )}

      {!loaded ? (
        <div className="flex justify-center py-12">
          <LoaderCircle className="h-6 w-6 animate-spin text-cream-dim" aria-label="Loading" />
        </div>
      ) : folders.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <Folder className="mx-auto h-16 w-16 text-cream-dim/70" strokeWidth={1.5} aria-hidden />
          <p className="mt-5 text-base leading-relaxed text-cream-dim">
            Abhi koi project nahi hai.
            <br />
            Naya project banakar apni scripts ek jagah rakho.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {folders.map((f) => (
            <li key={f.id} className="glass animate-fade-up flex items-center gap-2 p-3">
              <button
                type="button"
                onClick={() => onOpen(f)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Folder className="h-6 w-6 text-ember-soft" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-cream">{f.name}</span>
                  <span className="block text-xs text-cream-dim">
                    {f.count} script{f.count === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
              <button
                type="button"
                aria-label={`Delete project ${f.name}`}
                onClick={() => void onDelete(f)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cream-dim transition hover:bg-red-500/25 hover:text-red-100"
              >
                <Trash2 className="h-5 w-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
