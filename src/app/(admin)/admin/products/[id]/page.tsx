import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProduct } from "@/app/(admin)/actions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ProductStatusBadge } from "@/components/admin/status-badge";
import { DeleteProductButton } from "@/components/admin/products/delete-product-button";
import { ProductForm } from "@/components/admin/products/product-form";
import type { ProductValues } from "@/components/admin/products/shared";

export const metadata = { title: "Edit product" };

function parseJson<T>(raw: string, fallback: T): T {
  try {
    const parsed: unknown = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: { variants: { orderBy: [{ color: "asc" }, { size: "asc" }] } },
  });
  if (!product) notFound();

  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    db.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);

  const images = parseJson<string[]>(product.images, []);
  const features = parseJson<string[]>(product.features, []);
  const colors = parseJson<{ name: string; hex: string }[]>(product.colors, []);

  const defaultValues: ProductValues = {
    name: product.name,
    slug: product.slug,
    gender: product.gender,
    categorySlug: product.categorySlug as ProductValues["categorySlug"],
    collectionSlug: product.collectionSlug ?? "",
    description: product.description,
    material: product.material ?? "",
    features: features.join("\n"),
    price: product.price,
    mrp: product.mrp,
    colorName: product.colorName,
    colors: JSON.stringify(colors),
    images: images.join("\n"),
    badge: product.badge ?? "",
    active: product.active,
    featured: product.featured,
    bestSeller: product.bestSeller,
    newArrival: product.newArrival,
    variants: product.variants.map((v) => ({
      color: v.color,
      size: v.size,
      stock: v.stock,
      sku: v.sku,
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catalogue"
        title={product.name}
        description={`${product.slug} · ${product.variants.length} variants · updated ${product.updatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
        actions={
          <>
            <ProductStatusBadge active={product.active} className="h-9 px-3" />
            <Button asChild variant="outline" size="sm">
              <Link href={`/product/${product.slug}`} target="_blank">
                <ExternalLink className="size-3.5" aria-hidden />
                View on store
              </Link>
            </Button>
            <DeleteProductButton id={product.id} name={product.name} />
          </>
        }
      />
      <ProductForm
        mode="edit"
        submit={updateProduct.bind(null, product.id)}
        defaultValues={defaultValues}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}
