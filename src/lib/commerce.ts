import type { CartLine, PriceSummary } from "@/lib/types";

export const STORE = {
  name: "AIROVA FOOTWEAR",
  tagline: "Step Into Style",
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 2999),
  shippingFee: Number(process.env.NEXT_PUBLIC_SHIPPING_FEE ?? 99),
  expressFee: Number(process.env.NEXT_PUBLIC_EXPRESS_SHIPPING_FEE ?? 199),
  codFee: Number(process.env.NEXT_PUBLIC_COD_FEE ?? 0),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919999999999",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/airova.footwear",
  minPrice: 1999,
  maxPrice: 4499,
  sizes: ["5", "6", "7", "8", "9", "10", "11"],
};

/** https://wa.me/91...?text=... */
export function whatsappLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${STORE.whatsapp}?text=${text}`;
}

export function buyOnWhatsApp(opts: {
  product?: string;
  size?: string;
  color?: string;
  orderNumber?: string;
  cartLines?: CartLine[];
}): string {
  if (opts.orderNumber) {
    return whatsappLink(
      `Hi AIROVA! I'd like an update on my order ${opts.orderNumber}. Thanks!`,
    );
  }
  if (opts.cartLines?.length) {
    const items = opts.cartLines
      .map((l) => `• ${l.name} (${l.color}, UK ${l.size}) x${l.qty}`)
      .join("%0A");
    return whatsappLink(`Hi AIROVA! I'd like to order:%0A${items}`);
  }
  const parts = ["Hi AIROVA! I'm interested in"];
  if (opts.product) parts.push(opts.product);
  if (opts.color) parts.push(`(${opts.color}`);
  if (opts.size) parts.push(opts.color ? `UK ${opts.size})` : `- UK ${opts.size}`);
  return whatsappLink(parts.join(" "));
}

export type ShippingMethod = "STANDARD" | "EXPRESS";

export interface CouponResult {
  code: string;
  description?: string | null;
  discount: number;
  freeShipping: boolean;
}

export function shippingFor(subtotal: number, method: ShippingMethod): number {
  if (method === "EXPRESS") return STORE.expressFee;
  if (subtotal >= STORE.freeShippingThreshold) return 0;
  return STORE.shippingFee;
}

/**
 * Single source of truth for the price block shown in the cart, drawer and
 * checkout — so all three always agree.
 */
export function computeSummary(
  lines: CartLine[],
  coupon?: CouponResult | null,
  method: ShippingMethod = "STANDARD",
  includeCodFee = false,
): PriceSummary {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const mrpTotal = lines.reduce((s, l) => s + l.mrp * l.qty, 0);
  const couponDiscount = Math.min(coupon?.discount ?? 0, subtotal);
  const afterCoupon = subtotal - couponDiscount;

  let shipping = shippingFor(afterCoupon, method);
  if (coupon?.freeShipping) shipping = 0;
  if (afterCoupon === 0) shipping = 0;

  const codFee = includeCodFee ? STORE.codFee : 0;
  const total = Math.max(0, afterCoupon + shipping + codFee);

  const amountToFreeShipping = Math.max(0, STORE.freeShippingThreshold - afterCoupon);

  return {
    subtotal,
    mrpTotal,
    savings: Math.max(0, mrpTotal - subtotal - couponDiscount),
    discount: mrpTotal - subtotal,
    couponDiscount,
    shipping,
    shippingFee: shipping,
    total,
    freeShippingThreshold: STORE.freeShippingThreshold,
    amountToFreeShipping,
    freeShippingUnlocked: afterCoupon >= STORE.freeShippingThreshold || !!coupon?.freeShipping,
  };
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.qty, 0);
}

export function isValidPincode(pincode: string): boolean {
  return /^[1-9]\d{5}$/.test(pincode);
}

/**
 * Very small India pincode → serviceability check. In production this should
 * call your courier partner's API (Delhivery/Bluedart); the rules below mirror
 * typical metro SLAs so the UI is realistic without an API key.
 */
export function checkPincode(pincode: string): {
  serviceable: boolean;
  city?: string;
  state?: string;
  cod: boolean;
  standardDays: [number, number];
  expressDays: [number, number];
} {
  if (!isValidPincode(pincode)) {
    return { serviceable: false, cod: false, standardDays: [4, 7], expressDays: [2, 3] };
  }
  const first = pincode[0];
  const cod = !["1", "6", "7"].includes(first) || Number(pincode) % 2 === 0;
  const remote = ["6", "7", "79"].some((p) => pincode.startsWith(p)) && Number(pincode[1]) > 8;
  return {
    serviceable: true,
    cod,
    standardDays: remote ? [5, 9] : [3, 6],
    expressDays: remote ? [3, 5] : [1, 2],
  };
}
