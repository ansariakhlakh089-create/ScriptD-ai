// FILE: components/chat/ChatStudio.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Menu, Plus } from "lucide-react";
import TopBar from "@/components/chat/TopBar";
import ChatsDrawer from "@/components/chat/ChatsDrawer";
import ChatPanel, { buildDots } from "@/components/chat/ChatPanel";
import Timeline from "@/components/chat/Timeline";
import ScriptPanel, { scriptEverything } from "@/components/chat/ScriptPanel";
import VPromptPanel, { allPromptsText } from "@/components/chat/VPromptPanel";
import InputBar, { type Selection } from "@/components/chat/InputBar";
import PlansModal from "@/components/monetization/PlansModal";
import { copyText } from "@/components/shared/CopyButton";
import { useProject } from "@/hooks/useProject";
import { useUser } from "@/hooks/useUser";
import { api, ApiError, errorMessage } from "@/lib/api-client";
import { WORKING_STATUSES } from "@/lib/constants";
import type { FolderDTO, MessageDTO } from "@/types";

type Tab = "chat" | "script" | "vprompt";
type Badge = "none" | "loading" | "ready";

const TABS: { key: Tab; label: string }[] = [
  { key: "chat", label: "Chat" },
  { key: "script", label: "Script" },
  { key: "vprompt", label: "V-prompt" },
];

interface Props {
  initialId: string | null;
  initialIdea: string;
  initialFolderId: string | null;
}

function composeType(topic: string | null, genre: string | null): string | undefined {
  if (genre && topic) return `${genre} (topic: ${topic})`;
  if (genre) return genre;
  if (topic) return `Topic: ${topic}`;
  return undefined;
}

function limitMessage(e: ApiError): string {
  const resetsAt = typeof e.data.resetsAt === "string" ? new Date(e.data.resetsAt) : null;
  if (resetsAt && !Number.isNaN(resetsAt.getTime())) {
    const when = resetsAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    return `${e.message} Free quota resets at ${when}.`;
  }
  return e.message;
}

export default function ChatStudio({ initialId, initialIdea, initialFolderId }: Props) {
  const router = useRouter();
  const { user, refresh: refreshUser } = useUser();

  const [projectId, setProjectId] = useState<string | null>(initialId);
  const { project, setProject, error: projectError } = useProject(projectId);

  const [tab, setTab] = useState<Tab>("chat");
  const [text, setText] = useState(initialIdea);
  const [selection, setSelection] = useState<Selection>({
    topic: null,
    genre: null,
    tone: null,
    length: "SHORT",
    folderId: initialFolderId,
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [folders, setFolders] = useState<FolderDTO[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [plans, setPlans] = useState<{ open: boolean; message?: string }>({ open: false });

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const prevStatus = useRef<string | null>(null);
  const messagesLoadedFor = useRef<string | null>(null);

  const working = project ? (WORKING_STATUSES as string[]).includes(project.status) : false;

  const dots = useMemo(() => buildDots(project, messages), [project, messages]);

  // Credits (top bar mein)
  const hasPaid = !user || (user.tokenBalance > 0 || user.longScriptsLeft > 0 || user.shortScriptsLeft > 0);
  const credits = user ? (hasPaid ? user.tokenBalance : user.free.tokensLeft) : null;
  const maxWords = user ? (hasPaid ? 400 : user.free.maxWords) : null;

  // Folders (project mein daalne ke liye)
  useEffect(() => {
    api<{ folders: FolderDTO[] }>("/api/folders")
      .then((d) => setFolders(d.folders))
      .catch(() => undefined);
  }, []);

  // Script poori ho jaaye to purane follow-up messages laao
  useEffect(() => {
    if (!projectId || project?.status !== "DONE" || messagesLoadedFor.current === projectId) return;
    messagesLoadedFor.current = projectId;
    api<{ messages: MessageDTO[] }>(`/api/chat?projectId=${encodeURIComponent(projectId)}`)
      .then((d) => setMessages(d.messages))
      .catch(() => undefined);
  }, [projectId, project?.status]);

  // Kaam khatam hote hi credits dobara laao
  useEffect(() => {
    const status = project?.status ?? null;
    const before = prevStatus.current;
    prevStatus.current = status;
    if (before && (WORKING_STATUSES as string[]).includes(before) && (status === "DONE" || status === "ERROR")) {
      void refreshUser();
    }
  }, [project?.status, refreshUser]);

  // Chat tab mein hamesha neeche tak scroll
  useEffect(() => {
    if (tab === "chat") endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [tab, project?.status, project?.roadmap?.length, messages.length]);

  const handleApiError = useCallback((e: unknown, pending?: string) => {
    if (e instanceof ApiError) {
      switch (e.code) {
        case "UPGRADE_REQUIRED":
        case "NO_SCRIPTS_LEFT":
        case "NOT_ENOUGH_TOKENS":
        case "FREE_LIMIT_REACHED":
          setPlans({ open: true, message: limitMessage(e) });
          return;
        default:
          setError(e.message);
          return;
      }
    }
    setError(errorMessage(e));
  }, []);

  // Naya project shuru
  async function startProject() {
    const idea = text.trim();
    if (idea.length < 3) {
      setError("Please type your idea first.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await api<{ projectId: string }>("/api/generate", {
        method: "POST",
        json: {
          idea,
          genre: composeType(selection.topic, selection.genre),
          tone: selection.tone ?? undefined,
          length: selection.length,
          folderId: selection.folderId ?? undefined,
        },
      });
      messagesLoadedFor.current = null;
      setMessages([]);
      setProjectId(res.projectId);
      window.history.replaceState(null, "", `/chat?id=${res.projectId}`);
      setText("");
      setTab("chat");
      void refreshUser();
    } catch (e) {
      handleApiError(e);
    } finally {
      setSending(false);
    }
  }

  // Follow-up sawal
  async function sendFollowUp(override?: string) {
    const message = (override ?? text).trim();
    if (!projectId || !message) return;
    setSending(true);
    setError(null);
    try {
      const res = await api<{ reply: string }>("/api/chat", {
        method: "POST",
        json: { projectId, message },
      });
      const now = new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "USER", content: message, createdAt: now },
        { id: `a-${Date.now()}`, role: "ASSISTANT", content: res.reply, createdAt: now },
      ]);
      setText("");
      void refreshUser();
    } catch (e) {
      handleApiError(e, message);
    } finally {
      setSending(false);
    }
  }

  function send() {
    if (project) void sendFollowUp();
    else void startProject();
  }

  // Naya chat (+)
  function startNew() {
    setProjectId(null);
    setProject(null);
    setMessages([]);
    messagesLoadedFor.current = null;
    setText("");
    setError(null);
    setTab("chat");
    setSelection({ topic: null, genre: null, tone: null, length: "SHORT", folderId: null });
    window.history.replaceState(null, "", `/chat`);
  }

  // Fail hua project dobara try (idea wapas box mein)
  function retry() {
    if (!project) return;
    const length = project.length;
    const tone = project.tone;
    const folderId = project.folderId;
    const idea = project.topic ?? "";
    startNew();
    setText(idea);
    setSelection((s) => ({ ...s, length, tone, folderId }));
  }

  // Top bar ke kaam
  async function moveToFolder(folderId: string | null) {
    if (!projectId) return;
    try {
      await api(`/api/project/${projectId}`, { method: "PATCH", json: { folderId } });
      setProject((p) => (p ? { ...p, folderId } : p));
    } catch (e) {
      setError(errorMessage(e));
      throw e;
    }
  }

  async function deleteProject() {
    if (!projectId) return;
    if (!window.confirm("Delete this script? This cannot be undone.")) return;
    try {
      await api(`/api/project/${projectId}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  async function toggleVPrompt(id: number, done: boolean) {
    if (!project || !projectId) return;
    const before = project;
    setProject((p) => (p ? { ...p, vPrompts: p.vPrompts.map((v) => (v.id === id ? { ...v, done } : v)) } : p));
    try {
      await api(`/api/project/${projectId}`, { method: "PATCH", json: { vPromptId: id, done } });
    } catch (e) {
      setProject(before);
      setError(errorMessage(e));
    }
  }

  // Tabs ke chhote nishaan
  const badges: Record<Tab, Badge> = {
    chat: "none",
    script: project?.script ? "ready" : project && (project.status === "RESEARCHING" || project.status === "SCRIPTING") ? "loading" : "none",
    vprompt: project?.status === "DONE" ? "ready" : project?.status === "VPROMPTING" ? "loading" : "none",
  };

  const showTimeline = tab === "chat" && !projectError;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <TopBar
        hasProject={Boolean(project)}
        canCopyScript={Boolean(project?.script)}
        canCopyPrompts={Boolean(project && project.vPrompts.length > 0)}
        onCopyScript={() => project && void copyText(scriptEverything(project))}
        onCopyPrompts={() => project && void copyText(allPromptsText(project.vPrompts))}
        folders={folders}
        currentFolderId={project?.folderId ?? null}
        onMove={moveToFolder}
        onDelete={deleteProject}
      />

      {/* [Chat] [Script] [V-prompt] (+) -- sab ek hi chhoti line mein */}
      <div className="flex items-center gap-1.5 border-b border-black/20 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Your chats"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cream hover:bg-white/15"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>

        <div role="tablist" aria-label="Sections" className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            const badge = badges[key];
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  active ? "border-ember/20 text-ember-soft bg-ember/10" : "border-white/25 bg-white/5 text-cream hover:bg-white/10"
                }`}
              >
                {label}
                {badge === "loading" && <LoaderCircle className="h-3 w-3 animate-spin" aria-label="Working" />}
                {badge === "ready" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-label="Ready" />}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={startNew}
          aria-label="New chat"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-cream hover:bg-white/20"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Beech ka hissa (+ right side ki dot timeline) */}
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} className={`h-full overflow-y-auto py-4 pl-4 ${showTimeline ? "pr-8" : "pr-4"}`}>
          {projectError ? (
            <div role="alert" className="rounded-2xl bg-red-950/40 px-4 py-4 text-sm text-red-100">
              {projectError}
              <button type="button" onClick={startNew} className="btn-glass mt-3 block">
                Start a new script
              </button>
            </div>
          ) : tab === "chat" ? (
            <ChatPanel
              project={project}
              messages={messages}
              starting={sending && !project}
              onGoTab={(t) => setTab(t)}
              onRetry={retry}
            />
          ) : tab === "script" ? (
            <ScriptPanel project={project} />
          ) : (
            <VPromptPanel project={project} onToggle={(id, done) => void toggleVPrompt(id, done)} />
          )}
          <div ref={endRef} />
        </div>
        {showTimeline && <Timeline dots={dots} containerRef={scrollRef} />}
      </div>

      {error && (
        <div role="alert" className="mx-3 mb-1.5 flex items-start gap-3 rounded-2xl bg-red-950/50 px-4 py-2.5 text-sm text-red-100">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-semibold underline-offset-2 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {tab === "chat" && !projectError && (
        <InputBar
          mode={project ? "followup" : "new"}
          value={text}
          onChange={setText}
          selection={selection}
          onSelection={(patch) => setSelection((s) => ({ ...s, ...patch }))}
          folders={folders}
          onSend={send}
          busy={sending}
          locked={working || project?.status === "ERROR"}
          maxWords={maxWords}
        />
      )}

      <ChatsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} currentId={projectId} onNew={startNew} />

      <PlansModal
        open={plans.open}
        message={plans.message}
        onClose={() => setPlans({ open: false })}
        onPurchased={() => void refreshUser()}
      />
    </div>
  );
    }
