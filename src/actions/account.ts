"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema, sanitizeText } from "@/lib/validators";
import type { CartLine } from "@/lib/types";
import {
  guardRateLimit,
  normalizePhone,
  recomputeProductRating,
  toFieldErrors,
} from "@/actions/common";
import type { ActionState } from "@/actions/state";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(60, "Name is too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .or(z.literal("")),
});

/* ------------------------------------------------------------------ */
/* Addresses                                                           */
/* ------------------------------------------------------------------ */

export async function saveAddress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to manage your addresses." };

  const blocked = await guardRateLimit("account:address", 30);
  if (blocked) return blocked;

  const parsed = addressSchema.safeParse({
    label: sanitizeText(String(formData.get("label") ?? "")) || "Home",
    name: sanitizeText(String(formData.get("name") ?? "")),
    phone: normalizePhone(String(formData.get("phone") ?? "")),
    line1: sanitizeText(String(formData.get("line1") ?? "")),
    line2: sanitizeText(String(formData.get("line2") ?? "")),
    city: sanitizeText(String(formData.get("city") ?? "")),
    state: sanitizeText(String(formData.get("state") ?? "")),
    pincode: String(formData.get("pincode") ?? "").replace(/\D/g, ""),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return { ok: false, fieldErrors: toFieldErrors(parsed.error) };

  const { isDefault, ...fields } = parsed.data;
  const payload = { ...fields, line2: fields.line2 || null };
  const id = String(formData.get("id") ?? "");

  if (id) {
    const existing = await db.address.findFirst({ where: { id, userId: session.id } });
    if (!existing) return { ok: false, error: "That address no longer exists." };
    if (isDefault) {
      await db.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
    }
    await db.address.update({
      where: { id },
      data: { ...payload, isDefault: isDefault || existing.isDefault },
    });
  } else {
    const count = await db.address.count({ where: { userId: session.id } });
    const makeDefault = isDefault || count === 0;
    if (makeDefault) {
      await db.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
    }
    await db.address.create({
      data: { ...payload, userId: session.id, isDefault: makeDefault },
    });
  }

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to manage your addresses." };

  const address = await db.address.findFirst({ where: { id, userId: session.id } });
  if (!address) return { ok: false, error: "That address no longer exists." };

  await db.address.delete({ where: { id } });

  // Never leave the account without a default when one still exists.
  const remaining = await db.address.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, isDefault: true },
  });
  if (remaining.length && !remaining.some((a) => a.isDefault)) {
    await db.address.update({ where: { id: remaining[0].id }, data: { isDefault: true } });
  }

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to manage your addresses." };

  const address = await db.address.findFirst({ where: { id, userId: session.id } });
  if (!address) return { ok: false, error: "That address no longer exists." };

  await db.address.updateMany({ where: { userId: session.id }, data: { isDefault: false } });
  await db.address.update({ where: { id }, data: { isDefault: true } });

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to edit your profile." };

  const parsed = profileSchema.safeParse({
    name: sanitizeText(String(formData.get("name") ?? "")),
    phone: normalizePhone(String(formData.get("phone") ?? "")),
  });
  if (!parsed.success) return { ok: false, fieldErrors: toFieldErrors(parsed.error) };

  await db.user.update({
    where: { id: session.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export async function deleteReview(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to manage your reviews." };

  const review = await db.review.findFirst({
    where: { id, userId: session.id },
    select: { id: true, productId: true, product: { select: { slug: true } } },
  });
  if (!review) return { ok: false, error: "That review no longer exists." };

  await db.review.delete({ where: { id } });
  await recomputeProductRating(review.productId);

  revalidatePath("/account/reviews");
  revalidatePath(`/product/${review.product.slug}`);
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Re-order                                                            */
/* ------------------------------------------------------------------ */

export interface ReorderResult {
  ok: boolean;
  error?: string;
  lines: CartLine[];
  /** Items that could not be added (delisted product / out-of-stock size). */
  skipped: number;
}

/**
 * Converts an old order back into cart lines, but only for items that are
 * still buyable — a delisted product or an exhausted size is reported as
 * `skipped` instead of silently landing in a cart that cannot check out.
 */
export async function reorder(orderId: string): Promise<ReorderResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to buy again.", lines: [], skipped: 0 };

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      OR: [{ userId: session.id }, { userId: null, email: session.email }],
    },
    select: { id: true, items: { select: { productId: true, color: true, size: true, qty: true } } },
  });
  if (!order) return { ok: false, error: "That order no longer exists.", lines: [], skipped: 0 };

  const products = await db.product.findMany({
    where: { id: { in: [...new Set(order.items.map((i) => i.productId))] }, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      mrp: true,
      colorName: true,
      images: true,
      variants: { select: { color: true, size: true, stock: true } },
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: CartLine[] = [];
  let skipped = 0;

  for (const item of order.items) {
    const product = byId.get(item.productId);
    const variant = product?.variants.find(
      (v) => v.color === item.color && v.size === item.size,
    );
    if (!product || !variant || variant.stock < 1) {
      skipped += 1;
      continue;
    }
    const images: string[] = JSON.parse(product.images || "[]");
    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0] ?? "",
      color: variant.color,
      size: variant.size,
      price: product.price,
      mrp: product.mrp,
      qty: Math.min(item.qty, variant.stock),
    });
  }

  if (!lines.length) {
    return {
      ok: false,
      error: skipped
        ? "Those items are out of stock right now."
        : "Nothing in this order can be re-ordered.",
      lines: [],
      skipped,
    };
  }
  return { ok: true, lines, skipped };
}

/* ------------------------------------------------------------------ */
/* Wishlist — localStorage stays the source of truth for display, the  */
/* database mirrors it so the count survives across devices.           */
/* ------------------------------------------------------------------ */

export async function syncWishlist(items: { productId: string }[]): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in to sync your wishlist." };
  if (!Array.isArray(items)) return { ok: false, error: "Invalid wishlist payload." };

  const ids = [...new Set(items.map((i) => String(i.productId)))]
    .filter((id) => id.length > 0 && id.length < 64)
    .slice(0, 100);
  if (!ids.length) return { ok: true };

  const products = await db.product.findMany({
    where: { id: { in: ids }, active: true },
    select: { id: true },
  });

  // Merge only — rows the shopper saved elsewhere are never wiped.
  for (const product of products) {
    await db.wishlist.upsert({
      where: { userId_productId: { userId: session.id, productId: product.id } },
      update: {},
      create: { userId: session.id, productId: product.id },
    });
  }

  revalidatePath("/account");
  return { ok: true };
}
