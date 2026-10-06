import { db } from "@/lib/db";
import type { Gender, ProductColor, ProductDTO, ReviewDTO, VariantDTO } from "@/lib/types";
import type { Prisma } from "@prisma/client";

type ProductRow = Prisma.ProductGetPayload<object>;

function parseJSON<T>(value: unknown, fallback: T): T {
  if (typeof value !== "string" || !value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

const FALLBACK_IMAGE = "/images/products/aqua-water-edition-sports-shoe-1.webp";

/** `/images/products/x.webp` → `/images/products/x-card.webp` (falls back to the original). */
export function cardImage(src?: string): string {
  if (!src) return FALLBACK_IMAGE;
  if (src.endsWith("-card.webp")) return src;
  return src.replace(/\.webp$/, "-card.webp");
}

export function thumbImage(src?: string): string {
  if (!src) return FALLBACK_IMAGE;
  if (src.endsWith("-thumb.webp")) return src;
  return src.replace(/\.webp$/, "-thumb.webp");
}

const select = {
  id: true, name: true, slug: true, gender: true, categorySlug: true,
  collectionSlug: true, description: true, material: true, features: true,
  price: true, mrp: true, colorName: true, colors: true, images: true,
  badge: true, featured: true, bestSeller: true, newArrival: true, active: true,
  rating: true, reviewCount: true, createdAt: true,
} satisfies Prisma.ProductSelect;

export function toProductDTO(row: ProductRow, includeVariants = false): ProductDTO {
  const product: ProductDTO = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    gender: row.gender as Gender,
    categorySlug: row.categorySlug as ProductDTO["categorySlug"],
    collectionSlug: row.collectionSlug,
    description: row.description,
    material: row.material,
    features: parseJSON<string[]>(row.features, []),
    price: row.price,
    mrp: row.mrp,
    colorName: row.colorName,
    colors: parseJSON<ProductColor[]>(row.colors, []),
    images: parseJSON<string[]>(row.images, []),
    badge: row.badge,
    featured: row.featured,
    bestSeller: row.bestSeller,
    newArrival: row.newArrival,
    active: row.active,
    rating: row.rating,
    reviewCount: row.reviewCount,
    createdAt: row.createdAt,
  };
  if (includeVariants && "variants" in row) {
    product.variants = ((row as unknown as { variants?: unknown[] }).variants ?? []) as VariantDTO[];
  }
  return product;
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export interface ShopFilters {
  gender?: Gender[];
  category?: string[];
  collection?: string[];
  color?: string[];
  size?: string[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export type SortKey =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "popular"
  | "discount";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Popularity" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "oldest", label: "Oldest first" },
];

const orderByMap: Record<SortKey, Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  popular: [{ reviewCount: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
  discount: { price: "asc" },
};

function buildWhere(f: ShopFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { active: true };

  if (f.gender?.length) {
    // UNISEX products appear in both the men's and women's edits.
    const wanted = new Set<string>(f.gender);
    wanted.add("UNISEX");
    where.gender = { in: [...wanted] as Gender[] };
  }
  if (f.category?.length) where.categorySlug = { in: f.category };
  if (f.collection?.length) where.collectionSlug = { in: f.collection };
  if (f.color?.length) where.colorName = { in: f.color };

  const and: Prisma.ProductWhereInput[] = [];
  if (f.minPrice != null || f.maxPrice != null) {
    and.push({
      price: {
        ...(f.minPrice != null ? { gte: f.minPrice } : {}),
        ...(f.maxPrice != null ? { lte: f.maxPrice } : {}),
      },
    });
  }
  if (f.size?.length) {
    and.push({ variants: { some: { size: { in: f.size }, stock: { gt: 0 } } } });
  }
  if (f.q && f.q.trim()) {
    const q = f.q.trim();
    and.push({
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { colorName: { contains: q } },
        { collectionSlug: { contains: q } },
        { categorySlug: { contains: q } },
      ],
    });
  }
  if (and.length) where.AND = and;

  return where;
}

export async function listProducts(f: ShopFilters = {}) {
  const where = buildWhere(f);
  const page = Math.max(1, f.page ?? 1);
  const perPage = f.perPage ?? 12;
  const sort = f.sort ?? "newest";

  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      select,
      orderBy: orderByMap[sort],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: rows.map((r) => toProductDTO(r as unknown as ProductRow)),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProduct(slug: string): Promise<ProductDTO | null> {
  const row = await db.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: { size: "asc" } },
      category: { select: { name: true, slug: true } },
      collection: { select: { name: true, slug: true, tagline: true } },
    },
  });
  if (!row || !row.active) return null;
  const dto = toProductDTO(row as unknown as ProductRow, true);
  dto.category = row.category ?? undefined;
  dto.collection = row.collection ?? undefined;
  return dto;
}

export async function getRelatedProducts(product: ProductDTO, limit = 4) {
  const rows = await db.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
      OR: [
        { collectionSlug: product.collectionSlug ?? "___none___" },
        { categorySlug: product.categorySlug },
        { gender: product.gender },
      ],
    },
    select,
    orderBy: [{ reviewCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map((r) => toProductDTO(r as unknown as ProductRow));
}

export async function getFeatured() {
  const rows = await db.product.findMany({
    where: { active: true, featured: true },
    select,
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return rows.map((r) => toProductDTO(r as unknown as ProductRow));
}

export async function getNewArrivals(limit = 8) {
  const rows = await db.product.findMany({
    where: { active: true },
    select,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => toProductDTO(r as unknown as ProductRow));
}

export async function getBestSellers(limit = 8) {
  const rows = await db.product.findMany({
    where: { active: true },
    select,
    orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
    take: limit,
  });
  return rows.map((r) => toProductDTO(r as unknown as ProductRow));
}

export async function getProductsBySlugs(slugs: string[]) {
  const rows = await db.product.findMany({ where: { slug: { in: slugs }, active: true }, select });
  const map = new Map(rows.map((r) => [r.slug, toProductDTO(r as unknown as ProductRow)]));
  return slugs.map((s) => map.get(s)).filter(Boolean) as ProductDTO[];
}

/** Distinct colours available in the catalogue — powers the colour filter. */
export async function getFilterOptions() {
  const [colors, collections, sizes] = await Promise.all([
    db.product.findMany({ where: { active: true }, select: { colorName: true }, distinct: ["colorName"] }),
    db.collection.findMany({ where: { active: true }, select: { name: true, slug: true, _count: { select: { products: true } } }, orderBy: { sortOrder: "asc" } }),
    db.variant.findMany({ where: { stock: { gt: 0 } }, select: { size: true }, distinct: ["size"], orderBy: { size: "asc" } }),
  ]);
  return {
    colors: colors.map((c) => c.colorName).sort(),
    collections: collections.map((c) => ({ name: c.name, slug: c.slug, count: c._count.products })),
    sizes: sizes.map((s) => s.size),
  };
}

export async function getReviews(productId: string): Promise<ReviewDTO[]> {
  const rows = await db.review.findMany({
    where: { productId, status: "published" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, rating: true, title: true, body: true, verified: true, createdAt: true },
  });
  return rows;
}

export async function getReviewSummary(productId: string) {
  const rows = await db.review.findMany({ where: { productId, status: "published" }, select: { rating: true } });
  const dist = [0, 0, 0, 0, 0];
  rows.forEach((r) => {
    dist[r.rating - 1] += 1;
  });
  const total = rows.length;
  const avg = total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
  return { total, avg: Math.round(avg * 10) / 10, dist };
}

/** Suggest products as the shopper types — used by the header search box. */
export async function searchProducts(q: string, limit = 6) {
  const term = q.trim();
  if (term.length < 2) return [];
  const rows = await db.product.findMany({
    where: { active: true, OR: [{ name: { contains: term } }, { collectionSlug: { contains: term } }, { colorName: { contains: term } }, { categorySlug: { contains: term } }] },
    select,
    take: limit,
    orderBy: [{ reviewCount: "desc" }],
  });
  return rows.map((r) => toProductDTO(r as unknown as ProductRow));
}

export async function getCollections() {
  const rows = await db.collection.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((c) => ({
    name: c.name,
    slug: c.slug,
    tagline: c.tagline,
    story: c.story,
    image: c.image,
    count: c._count.products,
  }));
}

export async function getAllSlugs() {
  const rows = await db.product.findMany({ where: { active: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}
