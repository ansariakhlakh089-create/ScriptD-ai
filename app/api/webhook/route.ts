// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
// import Stripe from 'stripe';

// Stripe CLI webhook secret
// const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event;

  try {
    // 1. Signature Verify karna taaki koi fake request na bhej sake
    // event = stripe.webhooks.constructEvent(body, signature, endpointSecret!);
    
    // Demo ke liye hum JSON parse kar rahe hain
    event = JSON.parse(body);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Successful Payment Event Handle karna
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Checkout banate waqt humne client_reference_id mein userId bheja tha
    const userId = session.client_reference_id; 

    if (userId) {
      // 3. User ko Upgrade karna aur Credits dena
      await db.user.update({
        where: { id: userId },
        data: {
          plan: "PAID",
          credits: { increment: 100 } // 100 Credits add kar diye
        }
      });
      console.log(`User ${userId} upgraded to PAID plan with 100 credits.`);
    }
  }

  // Gateway ko 200 OK bhejna zaroori hai, warna wo baar-baar ping karega
  return new NextResponse('Webhook processed successfully', { status: 200 });
}
