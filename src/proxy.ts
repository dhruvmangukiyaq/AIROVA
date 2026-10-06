import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Runs before every route. Two jobs:
 *  1. attach baseline security headers to HTML responses
 *  2. keep `/admin/*` out of reach of anyone without a valid admin session
 * (`src/app/(admin)/layout.tsx` calls `requireAdmin()` as well — this is the
 * cheap first gate so bad requests never reach the render pass.)
 */

const PUBLIC_ADMIN = ["/admin/login"];

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 16) return new TextEncoder().encode(value);
  return new TextEncoder().encode("dev-only-insecure-secret-please-change");
}

async function isAdmin(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute && !PUBLIC_ADMIN.includes(pathname)) {
    const token = request.cookies.get("airova_session")?.value;
    if (!(await isAdmin(token))) {
      const url = new URL("/admin/login", request.url);
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  const headers = response.headers;

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  headers.set("X-DNS-Prefetch-Control", "on");

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt)$).*)"],
};
