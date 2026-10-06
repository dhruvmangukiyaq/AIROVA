"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewSchema, sanitizeText } from "@/lib/validators";
import { guardRateLimit, recomputeProductRating, toFieldErrors } from "@/actions/common";
import type { ActionState } from "@/actions/state";

/**
 * Creates a review in the `pending` queue. Ratings shown on the product page
 * only ever aggregate `published` rows, so a submission can't inflate them
 * before an admin approves it.
 */
export async function submitReview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guardRateLimit("review:submit", 5);
  if (blocked) return blocked;

  const parsed = reviewSchema.safeParse({
    productId: String(formData.get("productId") ?? ""),
    rating: Number(formData.get("rating") ?? 0),
    title: sanitizeText(String(formData.get("title") ?? "")),
    body: sanitizeText(String(formData.get("body") ?? "")),
    name: sanitizeText(String(formData.get("name") ?? "")),
    email: sanitizeText(String(formData.get("email") ?? "")),
  });
  if (!parsed.success) return { ok: false, fieldErrors: toFieldErrors(parsed.error) };

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, slug: true, active: true },
  });
  if (!product || !product.active) {
    return { ok: false, fieldErrors: { productId: ["That product is no longer available."] } };
  }

  const session = await getSession();
  let verified = false;
  if (session) {
    const delivered = await db.orderItem.findFirst({
      where: { productId: product.id, order: { userId: session.id, status: "DELIVERED" } },
      select: { id: true },
    });
    verified = delivered !== null;
  }

  await db.review.create({
    data: {
      productId: product.id,
      userId: session?.id ?? null,
      name: parsed.data.name,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      verified,
      status: "pending",
    },
  });

  await recomputeProductRating(product.id);
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/account/reviews");

  return { ok: true, message: "Thanks! Your review is with our team for moderation." };
}
