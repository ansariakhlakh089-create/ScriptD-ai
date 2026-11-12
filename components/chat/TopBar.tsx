// FILE: components/chat/TopBar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Copy, EllipsisVertical, FolderInput, Trash2, Zap } from "lucide-react";
import type { FolderDTO } from "@/types";

interface Props {
  credits: number | null;
  onCreditsClick: () => void;
  hasProject: boolean;
  canCopyScript: boolean;
  canCopyPrompts: boolean;
  onCopyScript: () => void;
  onCopyPrompts: () => void;
  folders: FolderDTO[];
  currentFolderId: string | null;
  onMove: (folderId: string | null) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function TopBar(props: Props) {
  const { credits, hasProject, folders, currentFolderId } = props;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"main" | "move">("main");
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setView("main");
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="relative flex items-center justify-between gap-2 border-b border-black/30 bg-black/10 px-3 py-1.5">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-xs font-medium text-cream transition hover:bg-white/20 active:scale-[0.98]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back home
      </Link>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={props.onCreditsClick}
          className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-xs font-medium text-cream transition hover:bg-white/20"
          aria-label="Credits and plans"
        >
          <Zap className="h-3.5 w-3.5 text-ember" aria-hidden />
          Credits {credits === null ? "-" : credits.toLocaleString("en-IN")}
        </button>

        {hasProject && (
          <button
            type="button"
            onClick={() => (open ? close() : setOpen(true))}
            aria-label="More options"
            aria-expanded={open}
            className="flex h-7 w-7 items-center justify-center rounded-full text-cream hover:bg-white/15"
          >
            <EllipsisVertical className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {open && (
        <>
          <button type="button" aria-label="Close menu" onClick={close} className="fixed inset-0 z-30 cursor-default" />
          <div className="absolute right-3 top-10 z-40 w-64 rounded-2xl border border-white/25 bg-plum-deep p-2 shadow-glass animate-fade-up">
            {view === "main" ? (
              <>
                <MenuItem
                  icon={<Copy className="h-4 w-4" aria-hidden />}
                  label="Copy script"
                  disabled={!props.canCopyScript}
                  onClick={() => {
                    props.onCopyScript();
                    close();
                  }}
                />
                <MenuItem
                  icon={<Copy className="h-4 w-4" aria-hidden />}
                  label="Copy visual prompts"
                  disabled={!props.canCopyPrompts}
                  onClick={() => {
                    props.onCopyPrompts();
                    close();
                  }}
                />
                <MenuItem
                  icon={<FolderInput className="h-4 w-4" aria-hidden />}
                  label="Add to a project"
                  onClick={() => setView("move")}
                />
                <MenuItem
                  icon={<Trash2 className="h-4 w-4" aria-hidden />}
                  label="Delete"
                  danger
                  disabled={busy}
                  onClick={() => void run(props.onDelete)}
                />
              </>
            ) : (
              <>
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-cream-dim">Add to project</p>
                {folders.length === 0 && (
                  <p className="px-3 py-2 text-sm text-cream-dim">No projects yet. Create one from the dashboard.</p>
                )}
                {folders.map((f) => (
                  <MenuItem
                    key={f.id}
                    label={f.name}
                    disabled={busy}
                    trailing={currentFolderId === f.id ? <Check className="h-4 w-4 text-ember-soft" aria-hidden /> : null}
                    onClick={() => void run(() => props.onMove(f.id))}
                  />
                ))}
                {currentFolderId && (
                  <MenuItem label="Remove from project" disabled={busy} onClick={() => void run(() => props.onMove(null))} />
                )}
                <MenuItem label="Back" onClick={() => setView("main")} />
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
}

function MenuItem(props: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/10 disabled:opacity-40 ${
        props.danger ? "text-red-200" : "text-cream"
      }`}
    >
      {props.icon}
      <span className="min-w-0 flex-1 truncate">{props.label}</span>
      {props.trailing}
    </button>
  );
}
