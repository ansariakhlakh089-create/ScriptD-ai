// middleware.ts (Project ke root folder mein banayein, app/ ke andar nahi)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Memory mein IP aur unke request count ka record rakhne ke liye
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 5; // Ek IP 1 minute mein sirf 5 baar API call kar sakta hai
const WINDOW_MS = 60 * 1000; // 1 minute ka timer

export function middleware(req: NextRequest) {
  // Sirf API generate route par limit lagani hai
  if (req.nextUrl.pathname.startsWith('/api/generate')) {
    
    // User ka IP address nikaalo
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown-ip';
    const now = Date.now();

    const rateData = rateLimitMap.get(ip);

    if (!rateData) {
      // Agar naya user hai
      rateLimitMap.set(ip, { count: 1, lastReset: now });
    } else {
      // Agar time window (1 minute) khatam ho gaya hai, toh reset karo
      if (now - rateData.lastReset > WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
      } else {
        // Agar limit cross ho gayi hai
        if (rateData.count >= LIMIT) {
          return NextResponse.json(
            { error: "Bhai, thoda aaram karo! 1 minute baad try karna." },
            { status: 429 }
          );
        }
        // Count badhao
        rateData.count++;
      }
    }
  }

  // Agar limit ke andar hai, toh aage jaane do
  return NextResponse.next();
}

// Ye batata hai ki middleware sirf API routes par chalega
export const config = {
  matcher: '/api/:path*',
};
