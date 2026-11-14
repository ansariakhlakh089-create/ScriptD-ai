// FILE: components/dashboard/ProjectList.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, CircleAlert, FolderInput, LoaderCircle, Trash2 } from "lucide-react";
import { WORKING_STATUSES } from "@/lib/constants";
import type { FolderDTO, ProjectListItem } from "@/types";

interface Props {
  items: ProjectListItem[];
  folders: FolderDTO[];
  onMove: (projectId: string, folderId: string | null) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
}

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function StatusBadge({ status }: { status: string }) {
  if ((WORKING_STATUSES as string[]).includes(status)) {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-ember-soft">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden /> Working
      </span>
    );
  }
  if (status === "DONE") {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-emerald-200">
        <Check className="h-3.5 w-3.5" aria-hidden /> Ready
      </span>
    );
  }
  if (status === "ERROR") {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-red-200">
        <CircleAlert className="h-3.5 w-3.5" aria-hidden /> Failed
      </span>
    );
  }
  return <span className="font-medium">Draft</span>;
}

function Row({ item, folders, onMove, onDelete }: { item: ProjectListItem } & Omit<Props, "items">) {
  const [moveOpen, setMoveOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
      setMoveOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="glass animate-fade-up overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        <Link href={`/chat?id=${item.id}`} className="min-w-0 flex-1 rounded-xl p-1">
          <p className="truncate text-base font-semibold text-cream">{item.title || item.topic || "Untitled"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-cream-dim">
            <StatusBadge status={item.status} />
            {item.genre && <span>{item.genre}</span>}
            <span>{item.length === "LONG" ? "Long" : "Short"}</span>
            <span>{timeAgo(item.updatedAt)}</span>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Move to a project"
          aria-expanded={moveOpen}
          onClick={() => setMoveOpen((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cream-dim transition hover:bg-white/15 hover:text-cream"
        >
          <FolderInput className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Delete"
          disabled={busy}
          onClick={() => void run(() => onDelete(item.id))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cream-dim transition hover:bg-red-500/25 hover:text-red-100 disabled:opacity-50"
        >
          <Trash2 className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {moveOpen && (
        <div className="border-t border-white/15 bg-black/10 p-3">
          <p className="mb-2 text-sm font-semibold text-cream-dim">Move to project</p>
          {folders.length === 0 ? (
            <p className="text-sm text-cream-dim">
              You have no projects yet. Open the &quot;Projects&quot; tab and create one first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  disabled={busy || item.folderId === f.id}
                  onClick={() => void run(() => onMove(item.id, f.id))}
                  className={`chip ${item.folderId === f.id ? "border-ember bg-ember/25" : ""}`}
                >
                  {f.name}
                </button>
              ))}
              {item.folderId && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void run(() => onMove(item.id, null))}
                  className="chip"
                >
                  Remove from project
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function ProjectList({ items, folders, onMove, onDelete }: Props) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <Row key={item.id} item={item} folders={folders} onMove={onMove} onDelete={onDelete} />
      ))}
    </ul>
  );
}
