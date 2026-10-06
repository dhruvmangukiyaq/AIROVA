import { db } from "@/lib/db";
import type { Gender, ProductColor, ProductDTO, ReviewDTO, VariantDTO } from "@/lib/types";
import type { Prisma } from "@prisma/client";
import {
  MOCK_PRODUCTS,
  MOCK_COLLECTIONS,
  MOCK_REVIEWS_BY_SLUG,
} from "./mock-catalog";

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

function listMockProducts(f: ShopFilters = {}) {
  let list = [...MOCK_PRODUCTS];

  if (f.gender?.length) {
    const wanted = new Set<string>(f.gender);
    wanted.add("UNISEX");
    list = list.filter((p) => wanted.has(p.gender));
  }
  if (f.category?.length) {
    const wanted = new Set<string>(f.category);
    list = list.filter((p) => wanted.has(p.categorySlug));
  }
  if (f.collection?.length) {
    const wanted = new Set<string>(f.collection);
    list = list.filter((p) => p.collectionSlug && wanted.has(p.collectionSlug));
  }
  if (f.color?.length) {
    const wanted = new Set<string>(f.color);
    list = list.filter((p) => wanted.has(p.colorName));
  }
  if (f.minPrice != null) {
    list = list.filter((p) => p.price >= f.minPrice!);
  }
  if (f.maxPrice != null) {
    list = list.filter((p) => p.price <= f.maxPrice!);
  }
  if (f.size?.length) {
    const wanted = new Set<string>(f.size);
    list = list.filter((p) => p.variants?.some((v) => wanted.has(v.size) && v.stock > 0));
  }
  if (f.q && f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.colorName.toLowerCase().includes(q) ||
        (p.collectionSlug && p.collectionSlug.toLowerCase().includes(q)) ||
        p.categorySlug.toLowerCase().includes(q)
    );
  }

  const sort = f.sort ?? "newest";
  if (sort === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "popular") {
    list.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
  } else if (sort === "discount") {
    list.sort((a, b) => (b.mrp - b.price) - (a.mrp - a.price));
  } else if (sort === "oldest") {
    list.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
  } else {
    // newest
    list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }

  const page = Math.max(1, f.page ?? 1);
  const perPage = f.perPage ?? 12;
  const total = list.length;
  const start = (page - 1) * perPage;
  const paginated = list.slice(start, start + perPage);

  return {
    products: paginated,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function listProducts(f: ShopFilters = {}) {
  try {
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
  } catch (error) {
    console.warn("[catalog] Database unavailable in listProducts, using fallback:", (error as Error)?.message);
    return listMockProducts(f);
  }
}

export async function getProduct(slug: string): Promise<ProductDTO | null> {
  try {
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
  } catch (error) {
    console.warn("[catalog] Database unavailable in getProduct, using fallback:", (error as Error)?.message);
    const p = MOCK_PRODUCTS.find((item) => item.slug === slug);
    return p ?? null;
  }
}

export async function getRelatedProducts(product: ProductDTO, limit = 4) {
  try {
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
  } catch (error) {
    console.warn("[catalog] Database unavailable in getRelatedProducts, using fallback:", (error as Error)?.message);
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.slug !== product.slug &&
        (p.collectionSlug === product.collectionSlug ||
          p.categorySlug === product.categorySlug ||
          p.gender === product.gender)
    ).slice(0, limit);
  }
}

export async function getSiblingColors(product: ProductDTO, limit = 8) {
  try {
    const rows = await db.product.findMany({
      where: {
        active: true,
        id: { not: product.id },
        OR: [
          { collectionSlug: product.collectionSlug ?? "___none___" },
          { categorySlug: product.categorySlug },
        ],
      },
      select: { slug: true, name: true, colorName: true, images: true },
      take: limit,
    });
    return rows.map((s) => ({
      slug: s.slug,
      name: s.name,
      colorName: s.colorName,
      image: (JSON.parse(s.images || "[]") as string[])[0] ?? "",
    }));
  } catch (error) {
    console.warn("[catalog] Database unavailable in getSiblingColors, using fallback:", (error as Error)?.message);
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.slug !== product.slug &&
        (p.collectionSlug === product.collectionSlug || p.categorySlug === product.categorySlug)
    )
      .slice(0, limit)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        colorName: p.colorName,
        image: p.images[0] ?? "",
      }));
  }
}

export async function getFeatured() {
  try {
    const rows = await db.product.findMany({
      where: { active: true, featured: true },
      select,
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return rows.map((r) => toProductDTO(r as unknown as ProductRow));
  } catch (error) {
    console.warn("[catalog] Database unavailable in getFeatured, using fallback:", (error as Error)?.message);
    return MOCK_PRODUCTS.filter((p) => p.featured).slice(0, 8);
  }
}

export async function getNewArrivals(limit = 8) {
  try {
    const rows = await db.product.findMany({
      where: { active: true },
      select,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((r) => toProductDTO(r as unknown as ProductRow));
  } catch (error) {
    console.warn("[catalog] Database unavailable in getNewArrivals, using fallback:", (error as Error)?.message);
    const arrivals = MOCK_PRODUCTS.filter((p) => p.newArrival);
    return (arrivals.length ? arrivals : MOCK_PRODUCTS).slice(0, limit);
  }
}

export async function getBestSellers(limit = 8) {
  try {
    const rows = await db.product.findMany({
      where: { active: true },
      select,
      orderBy: [{ reviewCount: "desc" }, { rating: "desc" }],
      take: limit,
    });
    return rows.map((r) => toProductDTO(r as unknown as ProductRow));
  } catch (error) {
    console.warn("[catalog] Database unavailable in getBestSellers, using fallback:", (error as Error)?.message);
    const sellers = MOCK_PRODUCTS.filter((p) => p.bestSeller);
    return (sellers.length ? sellers : MOCK_PRODUCTS).slice(0, limit);
  }
}

export async function getProductsBySlugs(slugs: string[]) {
  try {
    const rows = await db.product.findMany({ where: { slug: { in: slugs }, active: true }, select });
    const map = new Map(rows.map((r) => [r.slug, toProductDTO(r as unknown as ProductRow)]));
    return slugs.map((s) => map.get(s)).filter(Boolean) as ProductDTO[];
  } catch (error) {
    console.warn("[catalog] Database unavailable in getProductsBySlugs, using fallback:", (error as Error)?.message);
    const map = new Map(MOCK_PRODUCTS.map((p) => [p.slug, p]));
    return slugs.map((s) => map.get(s)).filter(Boolean) as ProductDTO[];
  }
}

/** Distinct colours available in the catalogue — powers the colour filter. */
export async function getFilterOptions() {
  try {
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
  } catch (error) {
    console.warn("[catalog] Database unavailable in getFilterOptions, using fallback:", (error as Error)?.message);
    const colors = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.colorName))).sort();
    const collections = MOCK_COLLECTIONS.map((c) => ({ name: c.name, slug: c.slug, count: c.count }));
    const sizes = ["5", "6", "7", "8", "9", "10", "11"];
    return { colors, collections, sizes };
  }
}

export async function getReviews(productId: string): Promise<ReviewDTO[]> {
  try {
    const rows = await db.review.findMany({
      where: { productId, status: "published" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, rating: true, title: true, body: true, verified: true, createdAt: true },
    });
    return rows;
  } catch (error) {
    console.warn("[catalog] Database unavailable in getReviews, using fallback:", (error as Error)?.message);
    const prod = MOCK_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    const slug = prod ? prod.slug : productId;
    return MOCK_REVIEWS_BY_SLUG[slug] ?? [];
  }
}

export async function getReviewSummary(productId: string) {
  try {
    const rows = await db.review.findMany({ where: { productId, status: "published" }, select: { rating: true } });
    const dist = [0, 0, 0, 0, 0];
    rows.forEach((r) => {
      dist[r.rating - 1] += 1;
    });
    const total = rows.length;
    const avg = total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
    return { total, avg: Math.round(avg * 10) / 10, dist };
  } catch (error) {
    console.warn("[catalog] Database unavailable in getReviewSummary, using fallback:", (error as Error)?.message);
    const prod = MOCK_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    const slug = prod ? prod.slug : productId;
    const revs = MOCK_REVIEWS_BY_SLUG[slug] ?? [];
    const dist = [0, 0, 0, 0, 0];
    revs.forEach((r) => {
      dist[r.rating - 1] += 1;
    });
    const total = revs.length;
    const avg = total ? revs.reduce((s, r) => s + r.rating, 0) / total : (prod?.rating ?? 4.8);
    return { total, avg: Math.round(avg * 10) / 10, dist };
  }
}

/** Suggest products as the shopper types — used by the header search box. */
export async function searchProducts(q: string, limit = 6) {
  const term = q.trim();
  if (term.length < 2) return [];
  try {
    const rows = await db.product.findMany({
      where: { active: true, OR: [{ name: { contains: term } }, { collectionSlug: { contains: term } }, { colorName: { contains: term } }, { categorySlug: { contains: term } }] },
      select,
      take: limit,
      orderBy: [{ reviewCount: "desc" }],
    });
    return rows.map((r) => toProductDTO(r as unknown as ProductRow));
  } catch (error) {
    console.warn("[catalog] Database unavailable in searchProducts, using fallback:", (error as Error)?.message);
    const lower = term.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        (p.collectionSlug && p.collectionSlug.toLowerCase().includes(lower)) ||
        p.colorName.toLowerCase().includes(lower) ||
        p.categorySlug.toLowerCase().includes(lower)
    ).slice(0, limit);
  }
}

export async function getCollections() {
  try {
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
  } catch (error) {
    console.warn("[catalog] Database unavailable in getCollections, using fallback:", (error as Error)?.message);
    return MOCK_COLLECTIONS.map((c) => ({
      name: c.name,
      slug: c.slug,
      tagline: c.tagline,
      story: c.story,
      image: c.image,
      count: c.count,
    }));
  }
}

export async function getCollection(slug: string) {
  try {
    return await db.collection.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
  } catch (error) {
    console.warn("[catalog] Database unavailable in getCollection, using fallback:", (error as Error)?.message);
    const col = MOCK_COLLECTIONS.find((c) => c.slug === slug);
    if (!col) return null;
    return {
      id: `col-${col.slug}`,
      name: col.name,
      slug: col.slug,
      tagline: col.tagline,
      story: col.story,
      image: col.image,
      sortOrder: col.sortOrder,
      active: true,
      _count: { products: col.count },
    };
  }
}

export async function getAllSlugs() {
  try {
    const rows = await db.product.findMany({ where: { active: true }, select: { slug: true } });
    return rows.map((r) => r.slug);
  } catch (error) {
    console.warn("[catalog] Database unavailable in getAllSlugs, using fallback:", (error as Error)?.message);
    return MOCK_PRODUCTS.map((p) => p.slug);
  }
}
