// FILE: components/chat/TopBar.tsx
"use client";

import { useState } from "react";
import { EllipsisVertical, FolderInput, Trash2 } from "lucide-react";
import type { FolderDTO } from "@/types";

interface Props {
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
  const { hasProject, folders, currentFolderId } = props;
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
    <header className="relative flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
      {/* यहाँ से 'ScriptD AI' हटा दिया गया है, और खाली जगह (flex-1) दे दी है ताकि मेनू दाईं तरफ चला जाए */}
      <div className="flex-1"></div>

      <div className="flex items-center gap-1">
        {hasProject && (
          <button
            type="button"
            onClick={() => (open ? close() : setOpen(true))}
            aria-label="More options"
            aria-expanded={open}
            className="flex h-8 w-8 items-center justify-center rounded-full text-cream hover:bg-white/10"
          >
            <EllipsisVertical className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {open && (
        <>
          <button type="button" aria-label="Close menu" onClick={close} className="fixed inset-0 z-30 cursor-default" />
          <div className="absolute right-3 top-11 z-40 w-64 rounded-2xl border border-white/10 bg-taupe p-2 shadow-2xl animate-fade-up">
            {view === "main" ? (
              <>
                <MenuItem
                  icon={<FolderInput className="h-4 w-4" aria-hidden />}
                  label="Move to project"
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
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-cream-dim">Move to</p>
                {folders.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-cream-dim">No projects yet.</p>
                ) : (
                  folders.map((f) => (
                    <MenuItem
                      key={f.id}
                      label={f.name}
                      trailing={currentFolderId === f.id ? "✓" : undefined}
                      disabled={busy}
                      onClick={() => void run(() => props.onMove(f.id))}
                    />
                  ))
                )}
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
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/5 ${
        props.danger ? "text-red-400" : "text-cream"
      }`}
    >
      {props.icon}
      <span className="min-w-0 flex-1 truncate">{props.label}</span>
      {props.trailing}
    </button>
  );
}
