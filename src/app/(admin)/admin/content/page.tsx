import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { readSiteSettings } from "@/lib/content";
import { PageHeader } from "@/components/admin/page-header";
import { SiteSettingsForm } from "./site-settings-form";
import { TaxonomyManager } from "./taxonomy-manager";

export const metadata = { title: "Content" };

export default async function AdminContentPage() {
  await requireAdmin();

  const [settings, collections, categories] = await Promise.all([
    readSiteSettings(),
    db.collection.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        story: true,
        image: true,
        sortOrder: true,
        active: true,
        _count: { select: { products: true } },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        active: true,
        _count: { select: { products: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Storefront"
        title="Content"
        description="Edit the homepage copy, promo banners, testimonials and FAQ, plus the collections and categories that organise the catalogue."
      />

      <SiteSettingsForm initial={settings} />
      <TaxonomyManager collections={collections} categories={categories} />
    </div>
  );
}
