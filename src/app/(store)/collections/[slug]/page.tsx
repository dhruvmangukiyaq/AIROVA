import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCollection, getFilterOptions, listProducts } from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { ProductCard } from "@/components/product/product-card";
import { FilterPanel } from "@/components/shop/filter-panel";
import { parseShopParams, toSearchString } from "@/lib/shop-params";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection || !collection.active) notFound();

  const description = (collection.story ?? collection.tagline ?? "").slice(0, 155) ||
    `Shop the ${collection.name} collection — premium AIROVA footwear.`;

  return {
    title: `${collection.name} collection`,
    description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.name} — AIROVA FOOTWEAR`,
      description,
      url: `/collections/${collection.slug}`,
      images: collection.image ? [{ url: collection.image, alt: collection.name }] : [],
    },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection || !collection.active) notFound();

  const raw = await searchParams;
  const filters = parseShopParams(raw);
  const [result, options] = await Promise.all([
    listProducts({
      collection: [slug],
      gender: filters.gender,
      category: filters.category,
      color: filters.color,
      size: filters.size,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: filters.page,
      perPage: 12,
    }),
    getFilterOptions(),
  ]);

  const base = `/collections/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.name} collection`,
    url: `${SITE.url}/collections/${collection.slug}`,
    description: collection.story ?? collection.tagline ?? undefined,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  };

  return (
    <div className="pb-24 sm:pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <header className="relative overflow-hidden bg-ink">
        {collection.image && (
          <Image
            src={collection.image}
            alt={`${collection.name} collection`}
            fill
            priority
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover opacity-55"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />

        <div className="shell relative py-16 sm:py-24">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-[0.68rem] tracking-[0.14em] text-cream/60 uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-gold">Home</Link>
              </li>
              <li aria-hidden><ChevronRight className="size-3" /></li>
              <li>
                <Link href="/collections" className="transition-colors hover:text-gold">
                  Collections
                </Link>
              </li>
              <li aria-hidden><ChevronRight className="size-3" /></li>
              <li aria-current="page" className="text-cream">{collection.name}</li>
            </ol>
          </nav>

          <p className="eyebrow mt-6">{collection.tagline ?? "Elements Edition"}</p>
          <h1 className="mt-3 text-5xl leading-[1.02] text-cream sm:text-6xl lg:text-7xl">
            {collection.name}
          </h1>
          {collection.story && (
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/70 sm:text-base">
              {collection.story}
            </p>
          )}
          <p className="mt-6 text-xs tracking-[0.16em] text-gold uppercase tabular-nums">
            {collection._count.products} styles
          </p>
        </div>
      </header>

      <div className="shell pt-12">
        <div className="grid gap-10 lg:grid-cols-[16.5rem_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1 pb-8">
              <FilterPanel params={filters} options={options} />
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
                {result.total} {result.total === 1 ? "style" : "styles"}
              </p>
              <p className="text-xs text-muted-foreground">
                Sorted by{" "}
                {filters.sort === "price-asc"
                  ? "price, low to high"
                  : filters.sort === "price-desc"
                    ? "price, high to low"
                    : "newest first"}
              </p>
            </div>

            {result.products.length === 0 ? (
              <div className="flex flex-col items-center gap-4 border border-dashed border-line px-6 py-20 text-center">
                <p className="text-xl">Nothing matches those filters</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Clear a filter to see the full {collection.name} line-up.
                </p>
                <Link
                  href={base}
                  className="border border-ink bg-ink px-6 py-3 text-[0.72rem] font-semibold tracking-[0.16em] text-cream uppercase"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-x-5 gap-y-10 pt-8 sm:gap-x-6 xl:grid-cols-3">
                {result.products.map((product, i) => (
                  <li key={product.id}>
                    <ProductCard product={product} index={i} priority={i < 3} />
                  </li>
                ))}
              </ul>
            )}

            {result.totalPages > 1 && (
              <nav aria-label="Collection pages" className="mt-14 flex justify-center gap-1.5">
                {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`${base}${toSearchString({ ...filters, page })}`}
                    aria-current={page === filters.page ? "page" : undefined}
                    className={
                      page === filters.page
                        ? "grid h-10 min-w-10 place-items-center bg-ink px-3 text-sm font-semibold text-cream tabular-nums"
                        : "grid h-10 min-w-10 place-items-center border border-line px-3 text-sm tabular-nums transition-colors hover:border-ink"
                    }
                  >
                    {page}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

