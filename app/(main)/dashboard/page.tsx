// FILE: app/(main)/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CircleAlert, Folder, LoaderCircle, MessageSquare, Sparkles, type LucideIcon } from "lucide-react";
import AppHeader from "@/components/chat/AppHeader";
import ProjectList from "@/components/dashboard/ProjectList";
import FolderList from "@/components/dashboard/FolderList";
import PlansModal from "@/components/monetization/PlansModal";
import { useUser } from "@/hooks/useUser";
import { api, errorMessage } from "@/lib/api-client";
import { WORKING_STATUSES } from "@/lib/constants";
import type { FolderDTO, ProjectListItem } from "@/types";

type Tab = "chats" | "creation" | "projects";

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "chats", label: "Your Chats", icon: MessageSquare },
  { key: "creation", label: "Your Creation", icon: Sparkles },
  { key: "projects", label: "Your Projects", icon: Folder },
];

const EMPTY_TEXT: Record<Tab, { icon: LucideIcon; lines: [string, string] }> = {
  chats: { icon: MessageSquare, lines: ["Abhi koi chat nahi hai.", "Neeche \"Go Create\" dabakar naya script shuru karein."] },
  creation: { icon: Sparkles, lines: ["Abhi koi creation tayyar nahi hai.", "Jo script poori ban jayegi wo yahan dikhegi."] },
  projects: { icon: Folder, lines: ["Iss project mein abhi koi script nahi hai.", "Neeche \"Go Create\" dabakar yahan naya script banayein."] },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, refresh: refreshUser } = useUser();

  const [tab, setTab] = useState<Tab>("chats");
  const [openFolder, setOpenFolder] = useState<FolderDTO | null>(null);
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderDTO[]>([]);
  const [foldersLoaded, setFoldersLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idea, setIdea] = useState("");
  const [plansOpen, setPlansOpen] = useState(false);
  const requestId = useRef(0);

  const showList = tab !== "projects" || openFolder !== null;

  const listUrl = useMemo(() => {
    if (tab === "creation") return "/api/projects?tab=done";
    if (tab === "projects" && openFolder) return `/api/projects?tab=all&folderId=${encodeURIComponent(openFolder.id)}`;
    return "/api/projects?tab=all";
  }, [tab, openFolder]);

  const loadList = useCallback(
    async (cursor: string | null) => {
      const id = ++requestId.current;
      try {
        const url = cursor ? `${listUrl}&cursor=${encodeURIComponent(cursor)}` : listUrl;
        const data = await api<{ items: ProjectListItem[]; nextCursor: string | null }>(url);
        if (id !== requestId.current) return;
        setItems((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor);
        setError(null);
      } catch (e) {
        if (id === requestId.current) setError(errorMessage(e));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [listUrl]
  );

  const loadFolders = useCallback(async () => {
    try {
      const data = await api<{ folders: FolderDTO[] }>("/api/folders");
      setFolders(data.folders);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setFoldersLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    if (!showList) return;
    setLoading(true);
    setItems([]);
    setNextCursor(null);
    void loadList(null);
  }, [showList, loadList]);

  const hasWorking = items.some((i) => (WORKING_STATUSES as string[]).includes(i.status));
  useEffect(() => {
    if (!hasWorking || !showList) return;
    const timer = setInterval(() => void loadList(null), 5000);
    return () => clearInterval(timer);
  }, [hasWorking, showList, loadList]);

  async function handleMove(projectId: string, folderId: string | null) {
    try {
      await api(`/api/project/${projectId}`, { method: "PATCH", json: { folderId } });
      await Promise.all([loadList(null), loadFolders()]);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function handleDelete(projectId: string) {
    if (!window.confirm("Delete this script? This cannot be undone.")) return;
    try {
      await api(`/api/project/${projectId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== projectId));
      void loadFolders();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function handleCreateFolder(name: string) {
    try {
      await api("/api/folders", { method: "POST", json: { name } });
      setError(null);
      await loadFolders();
    } catch (e) {
      setError(errorMessage(e));
      throw e;
    }
  }

  async function handleDeleteFolder(folder: FolderDTO) {
    if (!window.confirm(`Delete project "${folder.name}"? Its scripts will not be deleted.`)) return;
    try {
      await api(`/api/folders?id=${encodeURIComponent(folder.id)}`, { method: "DELETE" });
      await loadFolders();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  function goCreate() {
    const params = new URLSearchParams();
    const text = idea.trim().slice(0, 500);
    if (text) params.set("idea", text);
    if (openFolder) params.set("folder", openFolder.id);
    const query = params.toString();
    router.push(query ? `/chat?${query}` : "/chat");
  }

  const empty = EMPTY_TEXT[tab];
  const EmptyIcon = empty.icon;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <AppHeader user={user} onUpgrade={() => setPlansOpen(true)} />

      <main className="flex-1 px-5 pb-44 pt-5">
        {/* Teen tabs - Chhota Size */}
        <div className="grid grid-cols-3 gap-1.5" role="tablist" aria-label="Dashboard sections">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(key);
                  setOpenFolder(null);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-ember/30 bg-ember/15 text-ember-soft"
                    : "border-white/10 bg-white/5 text-cream hover:bg-white/10"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-ember" : "text-cream-dim"}`} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        {error && (
          <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl bg-red-950/40 px-4 py-3 text-sm text-red-100">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => setError(null)} className="font-semibold underline-offset-2 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        <section className="mt-4">
          {tab === "projects" && openFolder && (
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpenFolder(null)}
                aria-label="Back to projects"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <h2 className="truncate text-sm font-semibold text-cream">{openFolder.name}</h2>
            </div>
          )}

          {tab === "projects" && !openFolder ? (
            <FolderList
              folders={folders}
              loaded={foldersLoaded}
              onOpen={(f) => setOpenFolder(f)}
              onCreate={handleCreateFolder}
              onDelete={handleDeleteFolder}
            />
          ) : loading ? (
            <div className="flex justify-center py-16">
              <LoaderCircle className="h-7 w-7 animate-spin text-ember" aria-label="Loading" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <EmptyIcon className="mx-auto h-14 w-14 text-cream-dim/50" strokeWidth={1.2} aria-hidden />
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">
                {empty.lines[0]}
                <br />
                {empty.lines[1]}
              </p>
            </div>
          ) : (
            <>
              <ProjectList items={items} folders={folders} onMove={handleMove} onDelete={handleDelete} />
              {nextCursor && (
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => {
                    setLoadingMore(true);
                    void loadList(nextCursor);
                  }}
                  className="btn-glass mt-4 w-full"
                >
                  {loadingMore ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : "Load more"}
                </button>
              )}
            </>
          )}
        </section>
      </main>

      {/* Neeche: naya script shuru karne ka bar */}
      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-xl -translate-x-1/2 bg-gradient-to-t from-plum via-plum/95 to-transparent px-4 pb-4 pt-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goCreate();
          }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-taupe p-1.5 shadow-lg"
        >
          <label htmlFor="new-idea" className="sr-only">
            Start a new script
          </label>
          <input
            id="new-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            maxLength={500}
            placeholder={openFolder ? `Naya script (${openFolder.name})...` : "Naya script shuru karein..."}
            className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-cream outline-none placeholder:text-cream-dim/70"
          />
          <button
            type="submit"
            className="flex h-9 shrink-0 items-center justify-center rounded-full bg-ember px-5 text-sm font-semibold text-white shadow-glow transition hover:bg-ember-hover"
          >
            Create
          </button>
        </form>
      </div>

      <PlansModal
        open={plansOpen}
        onClose={() => setPlansOpen(false)}
        onPurchased={() => void refreshUser()}
      />
    </div>
  );
    }
