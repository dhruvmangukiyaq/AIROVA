import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "newsletter"), 5, 60_000);
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "Too many attempts — try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  await db.newsletter.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  return Response.json({ ok: true });
}
