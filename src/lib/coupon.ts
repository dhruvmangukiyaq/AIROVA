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

  const coupon = await db.coupon.findUnique({ where: { code: normalized } });
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
