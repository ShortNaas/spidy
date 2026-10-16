import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "spidy_session";

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https:; font-src 'self' data:;"
  );
  return response;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. CSRF Protection: reject non-GET auth/site requests whose Origin does not match the host
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/sites")) {
      const origin = request.headers.get("origin");
      if (origin) {
        try {
          const originHost = new URL(origin).host;
          const hostHeader = request.headers.get("host") || request.nextUrl.host;
          if (originHost !== hostHeader) {
            return NextResponse.json(
              { error: "Forbidden: CSRF check failed" },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Forbidden: Invalid origin header" },
            { status: 403 }
          );
        }
      }
    }
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSession = Boolean(sessionCookie && sessionCookie.length === 64);

  // 2. Logged-in users hitting /login or /register redirect to /dashboard
  if (pathname === "/login" || pathname === "/register") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // 3. Protect /dashboard and /api/stats
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/stats")) {
    if (!hasSession) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/stats/:path*",
    "/api/auth/:path*",
    "/api/sites/:path*",
    "/login",
    "/register",
  ],
};
