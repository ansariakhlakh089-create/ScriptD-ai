// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { userId, planPriceId } = await req.json();

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Yahan Stripe/Razorpay ka session create hoga
    /*
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // Ya 'subscription'
      customer_email: user.email,
      client_reference_id: user.id, // Ye ID webhook mein wapas aayegi
      line_items: [{ price: planPriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    });
    
    return NextResponse.json({ url: session.url });
    */

    // Demo response:
    return NextResponse.json({ url: "https://payment-gateway-link.com/checkout/123" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
