// FILE: lib/limits.ts
import { db } from "@/lib/db";
import { FREE_LIMITS, type ScriptLength } from "@/lib/constants";
import { estimateRunTokens } from "@/lib/token-calculator";
import { AIError, friendlyAIMessage } from "@/lib/openrouter";
import { jsonError, type AppUser } from "@/lib/session";
import type { UserSummary } from "@/types";

export type Funding = "PAID" | "FREE";
export const PAID_MAX_WORDS = 400;

export class LimitError extends Error {
  code: string;
  status: number;
  extra: Record<string, unknown>;
  constructor(code: string, status: number, message: string, extra: Record<string, unknown> = {}) {
    super(message);
    this.name = "LimitError";
    this.code = code;
    this.status = status;
    this.extra = extra;
  }
}

export function handleRouteError(e: unknown): Response {
  if (e instanceof LimitError) return jsonError(e.status, e.code, e.message, e.extra);
  if (e instanceof AIError) {
    console.error("[api]", e.code, e.message);
    return jsonError(502, "AI_ERROR", friendlyAIMessage(e.code));
  }
  console.error("[api]", e);
  return jsonError(500, "SERVER_ERROR", "Something went wrong. Please try again.");
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isPlanActive(user: AppUser): boolean {
  return user.plan !== "FREE" && user.planExpiresAt !== null && user.planExpiresAt.getTime() > Date.now();
}

export function windowEnd(user: AppUser): Date {
  return new Date(user.freeWindowStart.getTime() + FREE_LIMITS.resetHours * 3600_000);
}

export async function refreshWindow(user: AppUser): Promise<AppUser> {
  if (Date.now() < windowEnd(user).getTime()) return user;
  return db.user.update({
    where: { id: user.id },
    data: {
      freeWindowStart: new Date(),
      freeChatsUsed: 0,
      freeTokensUsed: 0,
      freeScriptsUsed: 0,
      adUnlocksUsed: 0,
      lockedUntil: null,
    },
  });
}

export function previewFunding(user: AppUser, length: ScriptLength): Funding {
  const credit = length === "LONG" ? user.longScriptsLeft : user.shortScriptsLeft;
  return credit > 0 ? "PAID" : "FREE";
}

export async function reserveRun(user: AppUser, length: ScriptLength): Promise<Funding> {
  const needed = estimateRunTokens(length);
  const label = length === "LONG" ? "long" : "short";

  if (previewFunding(user, length) === "PAID") {
    if (user.tokenBalance < needed) {
      throw new LimitError(
        "NOT_ENOUGH_TOKENS",
        402,
        `This ${label} script needs about ${needed} tokens and you have ${user.tokenBalance}. Please top up.`,
        { needed, have: user.tokenBalance }
      );
    }

    // PAID USER: पूरा टोकन पहले ही काट लो (Reserve कर लो)
    const result =
      length === "LONG"
        ? await db.user.updateMany({
            where: { id: user.id, longScriptsLeft: { gt: 0 }, tokenBalance: { gte: needed } },
            data: { longScriptsLeft: { decrement: 1 }, tokenBalance: { decrement: needed } },
          })
        : await db.user.updateMany({
            where: { id: user.id, shortScriptsLeft: { gt: 0 }, tokenBalance: { gte: needed } },
            data: { shortScriptsLeft: { decrement: 1 }, tokenBalance: { decrement: needed } },
          });

    if (result.count !== 1) throw new LimitError("BUSY", 409, "Please try again in a moment.");

    await db.tokenLedger.create({
      data: { userId: user.id, delta: -needed, reason: "RESERVE", meta: { source: "PAID", length } }
    });

    return "PAID";
  }

  if (isPlanActive(user)) {
    throw new LimitError(
      "NO_SCRIPTS_LEFT",
      402,
      `Your plan has no ${label} scripts available. Buy a top-up or a bigger plan to continue.`,
      { length }
    );
  }

  if (length === "LONG") {
    throw new LimitError(
      "UPGRADE_REQUIRED",
      402,
      "Long scripts come with the Long Pack, the Creator plan or a long-script top-up.",
      { feature: "LONG_SCRIPT" }
    );
  }

  // FREE USER
  const tokensLeft = FREE_LIMITS.tokensPerWindow - user.freeTokensUsed;
  if (
    user.freeChatsUsed >= FREE_LIMITS.chatsPerWindow ||
    user.freeScriptsUsed >= FREE_LIMITS.shortScriptsPerWindow ||
    tokensLeft < needed
  ) {
    throw new LimitError(
      "FREE_LIMIT_REACHED",
      402,
      "Your free quota is finished for now. It resets automatically, or you can upgrade.",
      { resetsAt: windowEnd(user).toISOString() }
    );
  }

  // FREE USER: पूरा टोकन और काउंट पहले ही काट लो (Reserve कर लो)
  const result = await db.user.updateMany({
    where: {
      id: user.id,
      freeChatsUsed: { lt: FREE_LIMITS.chatsPerWindow },
      freeScriptsUsed: { lt: FREE_LIMITS.shortScriptsPerWindow },
      freeTokensUsed: { lte: FREE_LIMITS.tokensPerWindow - needed },
    },
    data: { 
      freeChatsUsed: { increment: 1 }, 
      freeScriptsUsed: { increment: 1 },
      freeTokensUsed: { increment: needed }
    },
  });
  if (result.count !== 1) throw new LimitError("BUSY", 409, "Please try again in a moment.");

  await db.tokenLedger.create({
    data: { userId: user.id, delta: -needed, reason: "RESERVE", meta: { source: "FREE", length } }
  });

  return "FREE";
}

export async function releaseRun(userId: string, projectId: string): Promise<void> {
  const entries = await db.tokenLedger.findMany({
    where: { userId, projectId, reason: { in: ["RESERVE", "USAGE", "REFUND"] } },
  });
  const reserve = entries.find((e) => e.reason === "RESERVE");
  const alreadySettled = entries.some((e) => e.reason !== "RESERVE");
  if (!reserve || alreadySettled) return;

  const meta = reserve.meta as unknown as { source?: Funding; length?: ScriptLength } | null;
  const reservedAmount = Math.abs(reserve.delta);

  await db.$transaction(async (tx) => {
    if (meta?.source === "PAID") {
      // पैसे वाले यूजर को टोकन और स्क्रिप्ट काउंट दोनों वापस करो
      if (meta.length === "LONG") {
        await tx.user.update({ 
          where: { id: userId }, 
          data: { longScriptsLeft: { increment: 1 }, tokenBalance: { increment: reservedAmount } } 
        });
      } else {
        await tx.user.update({ 
          where: { id: userId }, 
          data: { shortScriptsLeft: { increment: 1 }, tokenBalance: { increment: reservedAmount } } 
        });
      }
    } else {
      // फ्री यूजर के टोकन और काउंट वापस करो
      await tx.user.updateMany({
        where: { id: userId, freeScriptsUsed: { gt: 0 } },
        data: { freeScriptsUsed: { decrement: 1 }, freeTokensUsed: { decrement: reservedAmount } },
      });
      await tx.user.updateMany({
        where: { id: userId, freeChatsUsed: { gt: 0 } },
        data: { freeChatsUsed: { decrement: 1 } },
      });
    }
    await tx.tokenLedger.create({
      data: { userId, projectId, delta: 0, reason: "REFUND", meta: { source: meta?.source ?? "FREE" } },
    });
  });
}

export async function settleRun(args: {
  userId: string;
  projectId: string;
  funding: Funding;
  charge: number;
  costUsd: number;
}): Promise<void> {
  const { userId, projectId, funding, charge, costUsd } = args;

  const existing = await db.tokenLedger.findFirst({
    where: { userId, projectId, reason: { in: ["USAGE", "REFUND"] } },
  });
  if (existing) return;

  await db.$transaction(async (tx) => {
    const reserveEntry = await tx.tokenLedger.findFirst({
      where: { userId, projectId, reason: "RESERVE" }
    });
    const reserved = reserveEntry ? Math.abs(reserveEntry.delta) : 0;
    const difference = charge - reserved; // असली खर्च और रिजर्व किए गए टोकन का अंतर

    if (funding === "PAID") {
      if (difference !== 0) {
        const row = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
        const newBalance = Math.max(0, (row?.tokenBalance ?? 0) - difference);
        await tx.user.update({ where: { id: userId }, data: { tokenBalance: newBalance } });
      }
    } else {
      if (difference !== 0) {
        await tx.user.update({
          where: { id: userId },
          data: { freeTokensUsed: { increment: difference } }
        });
      }
    }
    
    await tx.tokenLedger.create({
      data: { userId, projectId, delta: 0, reason: "USAGE", meta: { source: funding, charge, costUsd } },
    });
    await tx.project.update({
      where: { id: projectId },
      data: { tokensCharged: charge, apiCostUsd: costUsd },
    });
  });
}

export async function checkFollowUp(user: AppUser, projectId: string, text: string): Promise<Funding> {
  const words = countWords(text);

  if (user.tokenBalance > 0) {
    if (words > PAID_MAX_WORDS) {
      throw new LimitError("TOO_LONG", 400, `Please keep your message under ${PAID_MAX_WORDS} words.`, {
        maxWords: PAID_MAX_WORDS,
      });
    }
    return "PAID";
  }

  if (isPlanActive(user)) {
    throw new LimitError("NOT_ENOUGH_TOKENS", 402, "Your plan tokens are finished. Please top up.");
  }

  if (words > FREE_LIMITS.maxWordsPerQuestion) {
    throw new LimitError(
      "TOO_LONG",
      400,
      `Free plan allows up to ${FREE_LIMITS.maxWordsPerQuestion} words per message.`,
      { maxWords: FREE_LIMITS.maxWordsPerQuestion }
    );
  }

  if (FREE_LIMITS.tokensPerWindow - user.freeTokensUsed <= 0) {
    throw new LimitError("FREE_LIMIT_REACHED", 402, "Your free tokens are finished for now.", {
      resetsAt: windowEnd(user).toISOString(),
    });
  }

  const [sent, unlocks] = await Promise.all([
    db.message.count({ where: { projectId, role: "USER" } }),
    db.tokenLedger.count({ where: { userId: user.id, projectId, reason: "AD_UNLOCK" } }),
  ]);

  if (sent >= FREE_LIMITS.messagesPerChat + unlocks) {
    throw new LimitError("FREE_LIMIT_REACHED", 402, "You have used all free messages for now.");
  }

  return "FREE";
}

export async function spendFollowUp(args: {
  userId: string;
  funding: Funding;
  charge: number;
  projectId: string;
}): Promise<void> {
  const { userId, funding, charge, projectId } = args;
  if (charge <= 0) return;

  await db.$transaction(async (tx) => {
    if (funding === "PAID") {
      const row = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
      await tx.user.update({
        where: { id: userId },
        data: { tokenBalance: Math.max(0, (row?.tokenBalance ?? 0) - charge) },
      });
    } else {
      await tx.user.update({ where: { id: userId }, data: { freeTokensUsed: { increment: charge } } });
    }
    await tx.tokenLedger.create({
      data: { userId, projectId, delta: -charge, reason: "USAGE", meta: { source: funding, kind: "FOLLOW_UP" } },
    });
  });
}

export function buildUserSummary(user: AppUser): UserSummary {
  const planActive = isPlanActive(user);
  return {
    name: user.name,
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified,
    plan: planActive ? user.plan : "FREE",
    planExpiresAt: planActive && user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
    tokenBalance: user.tokenBalance,
    longScriptsLeft: user.longScriptsLeft,
    shortScriptsLeft: user.shortScriptsLeft,
    free: {
      chatsLeft: Math.max(0, FREE_LIMITS.chatsPerWindow - user.freeChatsUsed),
      tokensLeft: Math.max(0, FREE_LIMITS.tokensPerWindow - user.freeTokensUsed),
      shortScriptsLeft: Math.max(0, FREE_LIMITS.shortScriptsPerWindow - user.freeScriptsUsed),
      adUnlocksLeft: Math.max(0, FREE_LIMITS.adUnlocksPerWindow - user.adUnlocksUsed),
      messagesPerChat: FREE_LIMITS.messagesPerChat,
      maxWords: FREE_LIMITS.maxWordsPerQuestion,
      resetsAt: windowEnd(user).toISOString(),
    },
  };
          }
