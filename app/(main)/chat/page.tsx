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

  // key badalne par poora screen naye sire se shuru hota hai (alag chat kholne par)
  return <ChatStudio key={id ?? `new-${folder ?? ""}`} initialId={id} initialIdea={idea} initialFolderId={folder} />;
}
