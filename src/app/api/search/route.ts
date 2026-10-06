import { NextRequest } from "next/server";
import { searchProducts } from "@/lib/catalog";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";

export const runtime = "nodejs";

/** Type-ahead product search used by the header search overlay. */
export async function GET(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "search"), 40, 30_000);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many searches — please pause a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 60);
  const items = await searchProducts(q, 6);
  return Response.json(items);
}
