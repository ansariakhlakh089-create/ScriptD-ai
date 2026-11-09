// FILE: middleware.ts  (project ke root mein, app/ folder ke bahar)
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Ye sirf "cookie hai ya nahi" check karta hai (tez, par pakka nahi).
// Asli suraksha har page/API ke andar getCurrentUser() se hoti hai.
export function middleware(request: NextRequest) {
  const hasSession = Boolean(getSessionCookie(request));
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!hasSession && !isAuthPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/login", "/signup"],
};
