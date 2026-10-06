import { readdir } from "node:fs/promises";
import path from "node:path";
import { getClientIp, getSession } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED = new Set([".webp", ".jpg", ".jpeg", ".png"]);

/**
 * Lists the artwork shipped in public/images/products so the admin gallery
 * picker can offer it. Guarded by the admin session (401 rather than a
 * redirect, since this is consumed by fetch()).
 */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "admin-images"), 30, 60_000);
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const dir = path.join(process.cwd(), "public", "images", "products");
    const entries = await readdir(dir);
    const images = entries
      .filter((file) => ALLOWED.has(path.extname(file).toLowerCase()))
      .sort()
      .map((file) => `/images/products/${file}`);
    return Response.json({ ok: true, images });
  } catch {
    return Response.json({ ok: false, error: "Image folder not found" }, { status: 500 });
  }
}
