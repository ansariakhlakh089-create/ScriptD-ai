// FILE: app/api/webhook/route.ts
// Razorpay yahan batata hai ki payment ho gaya (browser band ho jaye tab bhi kaam karta hai)
// Razorpay Dashboard > Webhooks mein URL daalo:  https://TUMHARA-DOMAIN/api/webhook
// Events: payment.captured (aur order.paid), secret = RAZORPAY_WEBHOOK_SECRET
import { fulfillOrder, verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

interface WebhookPayload {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; amount?: number } };
  };
}

export async function POST(req: Request) {
  const raw = await req.text(); // signature RAW body par bani hoti hai
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return new Response("invalid signature", { status: 400 });
  }

  let event: WebhookPayload;
  try {
    event = JSON.parse(raw) as WebhookPayload;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  try {
    const entity = event.payload?.payment?.entity;
    const isPaidEvent = event.event === "payment.captured" || event.event === "order.paid";

    if (isPaidEvent && entity?.id && entity.order_id) {
      const result = await fulfillOrder({
        orderId: entity.order_id,
        paymentId: entity.id,
        paidAmountPaise: typeof entity.amount === "number" ? entity.amount : undefined,
      });
      if (!result.ok) console.error("[webhook] fulfill failed:", result.reason, entity.order_id);
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[webhook] error", e);
    return new Response("server error", { status: 500 }); // 500 dene par Razorpay dobara bhejta hai
  }
}
