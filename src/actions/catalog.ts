"use server";

import type { Prisma } from "@prisma/client";
import { toProductDTO } from "@/lib/catalog";
import { db } from "@/lib/db";
import type { ProductDTO } from "@/lib/types";

type ProductRow = Parameters<typeof toProductDTO>[0];

/** Mirrors `src/lib/catalog.ts`'s select and adds variants (for size picking). */
const select = {
  id: true,
  name: true,
  slug: true,
  gender: true,
  categorySlug: true,
  collectionSlug: true,
  description: true,
  material: true,
  features: true,
  price: true,
  mrp: true,
  colorName: true,
  colors: true,
  images: true,
  badge: true,
  featured: true,
  bestSeller: true,
  newArrival: true,
  active: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  variants: {
    select: { id: true, color: true, size: true, stock: true, sku: true },
    orderBy: { size: "asc" as const },
  },
} satisfies Prisma.ProductSelect;

/**
 * Hydrates ids (from the localStorage wishlist) into full DTOs. There is no
 * `/api/products/batch` route in this app, so the wishlist grid calls this
 * action inside a transition instead.
 */
export async function getProductsByIds(ids: string[]): Promise<ProductDTO[]> {
  if (!Array.isArray(ids)) return [];

  const clean = [...new Set(ids.map((id) => String(id)))]
    .filter((id) => id.length > 0 && id.length < 64)
    .slice(0, 60);
  if (!clean.length) return [];

  const rows = await db.product.findMany({
    where: { id: { in: clean }, active: true },
    select,
  });

  return rows.map((row) => toProductDTO(row as unknown as ProductRow, true));
}
