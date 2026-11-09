// FILE: lib/razorpay.ts
// Payment: order banana, signature check, aur paise aane par plan/tokens dena.
import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getProduct } from "@/lib/constants";
import { tokensForProduct } from "@/lib/token-calculator";

export function paymentsReady(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function createRazorpayOrder(args: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: args.amountPaise,
      currency: "INR",
      receipt: args.receipt.slice(0, 40),
      notes: args.notes,
    }),
  });

  if (!res.ok) {
    console.error("[razorpay] order failed", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new Error("Could not create payment order");
  }

  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return { id: data.id, amount: data.amount, currency: data.currency };
}

// Payment ke baad browser se aaya signature check (key secret se)
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

// Razorpay webhook ka signature check (webhook secret se, RAW body par)
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

// Paise aa gaye -> plan/tokens/scripts do. Do baar chale (webhook + browser) to bhi sirf ek baar dega.
export async function fulfillOrder(args: {
  orderId: string;
  paymentId: string;
  paidAmountPaise?: number;
}): Promise<{ ok: boolean; already?: boolean; reason?: string }> {
  const payment = await db.payment.findUnique({ where: { orderId: args.orderId } });
  if (!payment) return { ok: false, reason: "UNKNOWN_ORDER" };
  if (payment.status === "PAID") return { ok: true, already: true };

  if (args.paidAmountPaise !== undefined && args.paidAmountPaise !== payment.amountPaise) {
    return { ok: false, reason: "AMOUNT_MISMATCH" };
  }

  const product = getProduct(payment.productKey);
  if (!product) return { ok: false, reason: "UNKNOWN_PRODUCT" };

  let already = false;

  await db.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { not: "PAID" } },
      data: { status: "PAID", paymentId: args.paymentId, paidAt: new Date() },
    });
    if (claimed.count !== 1) {
      already = true;
      return;
    }

    const user = await tx.user.findUnique({ where: { id: payment.userId } });
    if (!user) throw new Error("User not found for payment");

    const tokens = tokensForProduct(product);
    const data: Prisma.UserUpdateInput = {
      tokenBalance: { increment: tokens },
      longScriptsLeft: { increment: product.longScripts },
      shortScriptsLeft: { increment: product.shortScripts },
    };

    if (product.kind === "PLAN") {
      const now = Date.now();
      const stillActive = user.plan !== "FREE" && user.planExpiresAt !== null && user.planExpiresAt.getTime() > now;
      const base = stillActive && user.planExpiresAt ? user.planExpiresAt.getTime() : now;
      data.plan = product.key;
      data.planExpiresAt = new Date(base + product.days * 86_400_000);
    }

    await tx.user.update({ where: { id: user.id }, data });
    await tx.tokenLedger.create({
      data: {
        userId: user.id,
        delta: tokens,
        reason: "PURCHASE",
        meta: { productKey: product.key, orderId: args.orderId, paymentId: args.paymentId },
      },
    });
  });

  return { ok: true, already };
}
