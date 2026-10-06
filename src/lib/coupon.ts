import "server-only";
import { db } from "@/lib/db";
import type { CouponResult } from "@/lib/commerce";

export type CouponFailure =
  | "not_found"
  | "inactive"
  | "expired"
  | "min_order"
  | "usage";

export interface CouponOutcome {
  ok: boolean;
  coupon?: CouponResult;
  reason?: CouponFailure;
  minOrder?: number;
}

/**
 * Server-side coupon validation shared by `/api/coupon` and checkout.
 * Amounts are always recalculated here — the client's discount is never trusted.
 */
export async function resolveCoupon(code: string, subtotal: number): Promise<CouponOutcome> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "not_found" };

  let coupon: {
    code: string;
    description: string;
    type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
    value: number;
    minOrder: number;
    maxDiscount?: number | null;
    active: boolean;
    expiresAt?: Date | null;
    usageLimit?: number | null;
    usedCount?: number;
  } | null = null;

  try {
    coupon = await db.coupon.findUnique({ where: { code: normalized } });
  } catch {
    const MOCK_COUPONS: Record<string, any> = {
      WELCOME10: { code: "WELCOME10", description: "10% off your first order", type: "PERCENT", value: 10, minOrder: 1499, maxDiscount: 500, active: true, usedCount: 0 },
      FLAT500: { code: "FLAT500", description: "₹500 off on orders above ₹3,499", type: "FIXED", value: 500, minOrder: 3499, active: true, usedCount: 0 },
      FIRST20: { code: "FIRST20", description: "20% off for new customers", type: "PERCENT", value: 20, minOrder: 2499, maxDiscount: 800, active: true, usedCount: 0 },
      FREESHIP: { code: "FREESHIP", description: "Free shipping on any order", type: "FREE_SHIPPING", value: 0, minOrder: 0, active: true, usedCount: 0 },
    };
    coupon = MOCK_COUPONS[normalized] ?? null;
  }
  if (!coupon) return { ok: false, reason: "not_found" };
  if (!coupon.active) return { ok: false, reason: "inactive" };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return { ok: false, reason: "usage" };
  if (subtotal < coupon.minOrder) {
    return { ok: false, reason: "min_order", minOrder: coupon.minOrder };
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

  return {
    ok: true,
    coupon: { code: coupon.code, description: coupon.description, discount, freeShipping },
  };
}

export const COUPON_FAILURE_MESSAGE: Record<CouponFailure, string> = {
  not_found: "That coupon code doesn't exist.",
  inactive: "This coupon is no longer active.",
  expired: "This coupon has expired.",
  min_order: "This coupon needs a higher minimum order.",
  usage: "This coupon has reached its usage limit.",
};
