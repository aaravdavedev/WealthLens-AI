/**
 * WealthLens Middleware
 * Handles route protection and authentication redirects
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/api/auth/login",
  "/api/auth/signup",
];

// Auth-only routes that require authentication
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/analytics",
  "/insights",
  "/upload",
  "/settings",
];

// API routes that require authentication
const PROTECTED_API_PREFIXES = [
  "/api/analyze",
  "/api/categorise",
  "/api/forecast",
  "/api/alert",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if token exists in cookies or headers
  const token =
    request.cookies.get("wl_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const isAuthenticated = !!token;

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Redirect unauthenticated users from protected routes to login
  if ((isProtectedRoute || isProtectedApi) && !isAuthenticated) {
    if (isProtectedApi) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthenticated && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
