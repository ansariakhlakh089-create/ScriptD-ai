// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sirf API routes par rate limiting aur IP tracking lagayenge
  if (request.nextUrl.pathname.startsWith('/api/generate') || request.nextUrl.pathname.startsWith('/api/chat')) {
    
    // Cloudflare, Vercel ya standard headers se IP nikalna
    const ip = request.headers.get('x-forwarded-for') ?? 
               request.headers.get('x-real-ip') ?? 
               '127.0.0.1';

    // Headers me IP set kar rahe hain taaki API route usko access kar sake
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-ip', ip);

    // Basic Auth Check: Agar authorization header (Token) nahi hai toh reject
    // Note: Agar NextAuth use kar rahe hain toh logic thoda alag hoga, par concept yahi rahega
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized Request. Login required." },
        { status: 401 }
      );
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Middleware kahan chalega uski setting
export const config = {
  matcher: '/api/:path*',
};
