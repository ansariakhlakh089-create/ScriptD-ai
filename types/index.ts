// FILE: types/index.ts
import type { ProjectStatus, ScriptLength } from "@/lib/constants";

export interface SourceItem {
  title: string;
  url: string;
  note?: string;
  // true = link AI ke web-search se aaya (asli). false = model ne khud likha (check karke use karo)
  verified: boolean;
}

// IMAGE = AI image banane ka prompt | SCREENSHOT = asli news/document ka screenshot lena hai
export type VPromptKind = "IMAGE" | "SCREENSHOT";

export interface VPromptItem {
  id: number;
  sceneLine: string; // script ki wo line jiske liye visual chahiye
  kind: VPromptKind;
  prompt?: string; // sirf IMAGE ke liye
  instruction?: string; // sirf SCREENSHOT ke liye
  sourceUrl?: string | null; // sirf SCREENSHOT ke liye
  done: boolean; // checkbox [ ] / [x]
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
  roadmap: string | null; // Chat tab: research + script roadmap
  sources: SourceItem[];
  script: string | null;
  description: string | null;
  tags: string[];
  vPrompts: VPromptItem[];
  errorMessage: string | null;
  isSaved: boolean;
  folderId: string | null;
  tokensCharged: number;
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

// UI mein "Project" (naam wala folder)
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
  plan: string; // FREE ya active plan ka key
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

// Har API error is shape mein aata hai
export interface ApiErrorBody {
  error: string; // code, jaise FREE_LIMIT_REACHED, AD_REQUIRED, UPGRADE_REQUIRED
  message: string; // user ko dikhane layak line
  [key: string]: unknown;
}
