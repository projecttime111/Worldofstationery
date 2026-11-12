import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every /admin request (Next.js 16 "proxy", formerly middleware).
 * A quick first check only: visitors without a session cookie go to the sign-in page.
 * The real check (is the session valid, is the person still an admin) happens in
 * lib/admin/auth.ts on every admin page and action.
 */
const OPEN = ["/admin/login/", "/admin/setup/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("wos_admin");
  const isOpen = OPEN.some((p) => pathname.startsWith(p) || `${pathname}/` === p);

  const response =
    !hasSession && !isOpen ? NextResponse.redirect(new URL("/admin/login/", request.url)) : NextResponse.next();
  // Keep the admin out of search engines, and out of shared caches.
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
