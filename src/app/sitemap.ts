import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";
import { MOCK_PRODUCTS, MOCK_COLLECTIONS } from "@/lib/mock-catalog";

const BASE = SITE.url.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; updatedAt?: Date }[] = [];
  let collections: { slug: string }[] = [];

  try {
    const [p, c] = await Promise.all([
      db.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.collection.findMany({
        where: { active: true },
        select: { slug: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);
    products = p;
    collections = c;
  } catch {
    products = MOCK_PRODUCTS.map((p) => ({ slug: p.slug, updatedAt: new Date() }));
    collections = MOCK_COLLECTIONS.map((c) => ({ slug: c.slug }));
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/shipping-and-returns`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/size-guide`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticRoutes,
    ...collections.map((collection) => ({
      url: `${BASE}/collections/${collection.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${BASE}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
