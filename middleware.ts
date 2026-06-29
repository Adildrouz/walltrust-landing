import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight, Edge-safe middleware. It does NOT initialize NextAuth/Auth.js
 * (that pulls @auth/core + jose into the Edge bundle, which crashed the
 * middleware on Vercel — MIDDLEWARE_INVOCATION_FAILED). Here we only do a fast
 * UX redirect based on the presence of the session cookie. The authoritative
 * auth check still runs server-side in the dashboard layout via `auth()`.
 */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function middleware(req: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname.startsWith("/auth");

  if (isDashboard && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
  }
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|c/|wall/|favicon.ico|favicon.svg|index.html|robots.txt|sitemap.xml|llms.txt|og-image.png|og-image.svg|google).*)",
  ],
};
