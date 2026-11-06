import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Payment gateway (Razorpay/Stripe) ka webhook yahan aayega
  return NextResponse.json({ received: true });
}
