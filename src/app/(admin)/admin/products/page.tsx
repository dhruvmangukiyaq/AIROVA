import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ProductsTable, type ProductRow } from "@/components/admin/products/products-table";

function parseImages(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await searchParams;
  const initialQuery = typeof sp.q === "string" ? sp.q : "";

  const [products, categories, collections, stockGroups] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        gender: true,
        categorySlug: true,
        collectionSlug: true,
        price: true,
        mrp: true,
        badge: true,
        active: true,
        featured: true,
        bestSeller: true,
        newArrival: true,
        images: true,
        reviewCount: true,
        createdAt: true,
        _count: { select: { variants: true } },
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true, active: true } }),
    db.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true, active: true } }),
    db.variant.groupBy({ by: ["productId"], _sum: { stock: true } }),
  ]);

  const stockByProduct = new Map(stockGroups.map((g) => [g.productId, g._sum.stock ?? 0]));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const collectionName = new Map(collections.map((c) => [c.slug, c.name]));

  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    gender: p.gender,
    categorySlug: p.categorySlug,
    category: categoryName.get(p.categorySlug) ?? p.categorySlug,
    collection: p.collectionSlug ? collectionName.get(p.collectionSlug) ?? p.collectionSlug : null,
    price: p.price,
    mrp: p.mrp,
    badge: p.badge,
    active: p.active,
    featured: p.featured,
    bestSeller: p.bestSeller,
    newArrival: p.newArrival,
    image: parseImages(p.images)[0] ?? null,
    variantCount: p._count.variants,
    stock: stockByProduct.get(p.id) ?? 0,
    reviewCount: p.reviewCount,
    createdAt: p.createdAt.toISOString(),
  }));

  const activeCount = rows.filter((r) => r.active).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description={`${rows.length} products · ${activeCount} live · ${rows.length - activeCount} in draft`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/">View store</Link>
            </Button>
            <Button asChild variant="gold" size="sm">
              <Link href="/admin/products/new">
                <Plus className="size-4" aria-hidden />
                Add product
              </Link>
            </Button>
          </>
        }
      />

      <ProductsTable
        products={rows}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        initialQuery={initialQuery}
      />
    </div>
  );
}
