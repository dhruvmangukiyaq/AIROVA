import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(20),
  subtotal: z.number().int().min(0).max(1_000_000),
});

const MESSAGES = {
  not_found: "That coupon code doesn't exist.",
  inactive: "This coupon is no longer active.",
  expired: "This coupon has expired.",
  min_order: (n: number) => `This coupon needs a minimum order of ₹${n}.`,
  usage: "This coupon has reached its usage limit.",
} as const;

export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "coupon"), 15, 60_000);
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "Too many attempts — try again in a minute." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid coupon request." }, { status: 400 });
  }

  const { code, subtotal } = parsed.data;

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return Response.json({ ok: false, error: MESSAGES.not_found }, { status: 404 });
  if (!coupon.active) return Response.json({ ok: false, error: MESSAGES.inactive }, { status: 410 });
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return Response.json({ ok: false, error: MESSAGES.expired }, { status: 410 });
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return Response.json({ ok: false, error: MESSAGES.usage }, { status: 410 });
  }
  if (subtotal < coupon.minOrder) {
    return Response.json(
      { ok: false, error: MESSAGES.min_order(coupon.minOrder) },
      { status: 422 },
    );
  }

  let discount = 0;
  let freeShipping = false;

  switch (coupon.type) {
    case "PERCENT": {
      const raw = Math.round((subtotal * coupon.value) / 100);
      discount = coupon.maxDiscount != null ? Math.min(raw, coupon.maxDiscount) : raw;
      break;
    }
    case "FIXED":
      discount = Math.min(coupon.value, subtotal);
      break;
    case "FREE_SHIPPING":
      freeShipping = true;
      break;
  }

  return Response.json({
    ok: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discount,
      freeShipping,
    },
  });
}
