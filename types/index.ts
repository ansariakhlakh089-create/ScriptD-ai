// FILE: types/index.ts
import type { ProjectStatus, ScriptLength } from "@/lib/constants";

export interface SourceItem {
  title: string;
  url: string;
  note?: string;
  verified: boolean;
}

export type VPromptKind = "IMAGE" | "SCREENSHOT";

export interface VPromptItem {
  id: number;
  sceneLine: string;
  kind: VPromptKind;
  prompt?: string;
  instruction?: string;
  sourceUrl?: string | null;
  done: boolean;
}

export interface ProjectDTO {
  id: string;
  title: string | null;
  topic: string | null;
  genre: string | null;
  tone: string | null;
  length: ScriptLength;
  status: ProjectStatus;
  progressNote: string | null;
  roadmap: string | null;
  sources: SourceItem[];
  script: string | null;
  description: string | null;
  tags: string[];
  vPrompts: VPromptItem[];
  errorMessage: string | null;
  isSaved: boolean;
  folderId: string | null;
  tokensCharged: number;
  apiCostUsd?: number; // नया फील्ड
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem {
  id: string;
  title: string | null;
  topic: string | null;
  genre: string | null;
  length: ScriptLength;
  status: ProjectStatus;
  isSaved: boolean;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderDTO {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

export interface MessageDTO {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface UserSummary {
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  plan: string;
  planExpiresAt: string | null;
  tokenBalance: number;
  longScriptsLeft: number;
  shortScriptsLeft: number;
  free: {
    chatsLeft: number;
    tokensLeft: number;
    shortScriptsLeft: number;
    adUnlocksLeft: number;
    messagesPerChat: number;
    maxWords: number;
    resetsAt: string;
  };
}

export interface ApiErrorBody {
  error: string;
  code: string;
  message: string;
  [key: string]: unknown;
}
