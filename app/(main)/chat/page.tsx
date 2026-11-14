// FILE: app/(main)/chat/page.tsx
import type { Metadata } from "next";
import ChatStudio from "@/components/chat/ChatStudio";

export const metadata: Metadata = { title: "Create" };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[]; idea?: string | string[]; folder?: string | string[] }>;
}) {
  const params = await searchParams;
  const id = first(params.id)?.slice(0, 64) ?? null;
  const idea = (first(params.idea) ?? "").slice(0, 500);
  const folder = first(params.folder)?.slice(0, 64) ?? null;

  // When the key changes the whole screen starts fresh (for example when a different chat is opened)
  return <ChatStudio key={id ?? `new-${folder ?? ""}`} initialId={id} initialIdea={idea} initialFolderId={folder} />;
}
