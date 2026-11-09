// FILE: app/api/checkout/route.ts
// POST = Razorpay order banao (price server tay karta hai) | PUT = payment ke baad turant verify
import { z } from "zod";
import { db } from "@/lib/db";
import { APP_NAME, getProduct } from "@/lib/constants";
import { getCurrentUser, jsonError, unauthorized } from "@/lib/session";
import { handleRouteError } from "@/lib/limits";
import { createRazorpayOrder, fulfillOrder, paymentsReady, verifyPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

const createSchema = z.object({ productKey: z.string().min(1).max(40) });
const verifySchema = z.object({
  orderId: z.string().min(1).max(100),
  paymentId: z.string().min(1).max(100),
  signature: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!paymentsReady()) return jsonError(503, "PAYMENTS_NOT_READY", "Payments are not available yet.");

    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", "Invalid request.");

    // Price kabhi browser se nahi lete - sirf key lete hain, price constants.ts se
    const product = getProduct(parsed.data.productKey);
    if (!product) return jsonError(400, "UNKNOWN_PRODUCT", "That plan does not exist.");

    const recentUnpaid = await db.payment.count({
      where: { userId: user.id, status: "CREATED", createdAt: { gt: new Date(Date.now() - 3600_000) } },
    });
    if (recentUnpaid >= 10) return jsonError(429, "TOO_MANY_ORDERS", "Too many attempts. Please try again later.");

    const order = await createRazorpayOrder({
      amountPaise: product.pricePaise,
      receipt: `sd_${Date.now().toString(36)}_${user.id.slice(0, 8)}`,
      notes: { userId: user.id, productKey: product.key },
    });

    await db.payment.create({
      data: {
        userId: user.id,
        orderId: order.id,
        productKey: product.key,
        amountPaise: product.pricePaise,
        currency: "INR",
      },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      productKey: product.key,
      label: product.label,
      appName: APP_NAME,
      prefill: { name: user.name, email: user.email },
    });
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const parsed = verifySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError(400, "BAD_REQUEST", "Invalid request.");
    const { orderId, paymentId, signature } = parsed.data;

    if (!verifyPaymentSignature(orderId, paymentId, signature)) {
      return jsonError(400, "BAD_SIGNATURE", "Payment could not be verified.");
    }

    const order = await db.payment.findFirst({ where: { orderId, userId: user.id }, select: { id: true } });
    if (!order) return jsonError(404, "NOT_FOUND", "Order not found.");

    const result = await fulfillOrder({ orderId, paymentId });
    if (!result.ok) return jsonError(400, "FULFILL_FAILED", "Payment could not be completed. Please contact support.");

    return Response.json({ ok: true, already: Boolean(result.already) });
  } catch (e) {
    return handleRouteError(e);
  }
}
