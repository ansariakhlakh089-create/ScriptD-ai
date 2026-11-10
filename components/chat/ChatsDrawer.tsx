// FILE: components/chat/ChatsDrawer.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, X } from "lucide-react";
import { api } from "@/lib/api-client";
import type { ProjectListItem } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  currentId: string | null;
  onNew: () => void;
}

// Side menu (≡): purani chats ki jhalak + naya chat
export default function ChatsDrawer({ open, onClose, currentId, onNew }: Props) {
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    api<{ items: ProjectListItem[] }>("/api/projects?tab=all")
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Your chats">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-black/55" />
      <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col border-r border-white/20 bg-plum-deep shadow-glass animate-fade-up">
        <div className="flex items-center justify-between px-4 py-4">
          <h2 className="text-lg font-bold text-white">Your chats</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              onNew();
              onClose();
            }}
            className="btn-ember w-full"
          >
            <Plus className="h-4 w-4" aria-hidden /> New chat
          </button>
        </div>

        <ul className="mt-4 flex-1 space-y-1 overflow-y-auto px-2 pb-6">
          {loading && (
            <li className="flex justify-center py-8">
              <LoaderCircle className="h-5 w-5 animate-spin text-cream-dim" aria-label="Loading" />
            </li>
          )}
          {!loading && items.length === 0 && <li className="px-3 py-6 text-sm text-cream-dim">No chats yet.</li>}
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/chat?id=${item.id}`}
                onClick={onClose}
                className={`block truncate rounded-xl px-3 py-3 text-sm transition hover:bg-white/10 ${
                  item.id === currentId ? "bg-white/15 font-semibold text-white" : "text-cream"
                }`}
              >
                {item.title || item.topic || "Untitled"}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
