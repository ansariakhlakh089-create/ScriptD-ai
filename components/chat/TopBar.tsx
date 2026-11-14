// FILE: components/chat/TopBar.tsx
"use client";

import { useState } from "react";
import { ClipboardCopy, Copy, EllipsisVertical, FolderInput, Trash2 } from "lucide-react";
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

// A compact "more options" button with its menu. It lives inside the tab row in ChatStudio,
// so the screen no longer needs a second bar at the top.
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

  if (!hasProject) return null;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="More options"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-cream hover:bg-white/10"
      >
        <EllipsisVertical className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close menu" onClick={close} className="fixed inset-0 z-30 cursor-default" />
          <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-white/10 bg-taupe p-2 shadow-2xl animate-fade-up">
            {view === "main" ? (
              <>
                <MenuItem
                  icon={<Copy className="h-5 w-5" aria-hidden />}
                  label="Copy script"
                  disabled={!props.canCopyScript}
                  onClick={() => {
                    props.onCopyScript();
                    close();
                  }}
                />
                <MenuItem
                  icon={<ClipboardCopy className="h-5 w-5" aria-hidden />}
                  label="Copy visual prompts"
                  disabled={!props.canCopyPrompts}
                  onClick={() => {
                    props.onCopyPrompts();
                    close();
                  }}
                />
                <MenuItem
                  icon={<FolderInput className="h-5 w-5" aria-hidden />}
                  label="Move to project"
                  onClick={() => setView("move")}
                />
                <MenuItem
                  icon={<Trash2 className="h-5 w-5" aria-hidden />}
                  label="Delete"
                  danger
                  disabled={busy}
                  onClick={() => void run(props.onDelete)}
                />
              </>
            ) : (
              <>
                <p className="px-3 pb-1 pt-2 text-sm font-semibold text-cream-dim">Move to</p>
                {folders.length === 0 ? (
                  <p className="px-3 py-2 text-base text-cream-dim">No projects yet.</p>
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
    </div>
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
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-base transition hover:bg-white/5 disabled:pointer-events-none disabled:opacity-40 ${
        props.danger ? "text-red-300" : "text-cream"
      }`}
    >
      {props.icon}
      <span className="min-w-0 flex-1 truncate">{props.label}</span>
      {props.trailing}
    </button>
  );
}
