import { NextRequest } from "next/server";
import { reviewSchema, sanitizeText } from "@/lib/validators";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp, getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "review"), 5, 300_000);
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "Too many reviews — try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Check the review fields." },
      { status: 400 },
    );
  }

  const { productId, rating, title, body, name } = parsed.data;
  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return Response.json({ ok: false, error: "Product not found." }, { status: 404 });

  const session = await getSession();

  // A review is "verified" only when the reviewer has a delivered order with this pair.
  let verified = false;
  if (session) {
    const delivered = await db.order.findFirst({
      where: {
        userId: session.id,
        status: "DELIVERED",
        items: { some: { productId } },
      },
      select: { id: true },
    });
    verified = Boolean(delivered);
  }

  await db.review.create({
    data: {
      productId,
      userId: session?.id ?? null,
      name: sanitizeText(name),
      rating,
      title: sanitizeText(title),
      body: sanitizeText(body),
      verified,
      status: "pending",
    },
  });

  return Response.json({ ok: true, verified });
}
