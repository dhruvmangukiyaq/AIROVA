import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProduct } from "@/app/(admin)/actions";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import type { ProductValues } from "@/components/admin/products/shared";

export const metadata = { title: "New product" };

const BLANK: ProductValues = {
  name: "",
  slug: "",
  gender: "UNISEX",
  categorySlug: "sneakers",
  collectionSlug: "",
  description: "",
  material: "",
  features: "",
  price: 3499,
  mrp: 5999,
  colorName: "",
  colors: "[]",
  images: "",
  badge: "",
  active: true,
  featured: false,
  bestSeller: false,
  newArrival: false,
  variants: [],
};

export default async function NewProductPage() {
  await requireAdmin();

  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    db.collection.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catalogue"
        title="New product"
        description="Add a product with its variants, pricing and gallery."
      />
      <ProductForm
        mode="create"
        submit={createProduct}
        defaultValues={BLANK}
        categories={categories}
        collections={collections}
      />
    </div>
  );
}
