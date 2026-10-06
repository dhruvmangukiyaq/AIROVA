import type { Metadata } from "next";
import { getFilterOptions, listProducts, SORT_OPTIONS } from "@/lib/catalog";
import { parseShopParams } from "@/lib/shop-params";
import { CATEGORIES } from "@/lib/validators";
import { ShopView } from "@/components/shop/shop-view";

export const metadata: Metadata = {
  title: "Shop all footwear",
  description:
    "Shop AIROVA FOOTWEAR — premium sneakers, sports shoes and loafers for men and women. Filter by collection, colour, size and price. Free shipping over ₹2,999.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop all footwear — AIROVA FOOTWEAR",
    description: "Premium sneakers, sports shoes and loafers. The Elements Edition.",
    url: "/shop",
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  sports: "Sports shoes",
  sneakers: "Sneakers",
  loafers: "Loafers",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = parseShopParams(await searchParams);

  const [result, options] = await Promise.all([
    listProducts({
      gender: params.gender,
      category: params.category,
      collection: params.collection,
      color: params.color,
      size: params.size,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      q: params.q,
      sort: params.sort,
      page: params.page,
      perPage: 12,
    }),
    getFilterOptions(),
  ]);

  const collectionNames = Object.fromEntries(options.collections.map((c) => [c.slug, c.name]));

  const heading = describeQuery(params);

  return (
    <div className="shell pb-24 pt-10 sm:pb-32 sm:pt-14">
      <header className="border-b border-ink pb-8">
        <p className="eyebrow">The Elements Edition</p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-[3.5rem]">{heading}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {options.collections.reduce((sum, c) => sum + c.count, 0)} styles across{" "}
              {options.collections.length} collections — sneakers, sports shoes and loafers
              built for Indian streets.
            </p>
          </div>

          <dl className="flex gap-6 text-xs text-muted-foreground">
            <div>
              <dt className="tracking-[0.16em] uppercase">Sizes</dt>
              <dd className="mt-1 font-medium text-ink tabular-nums">UK 5–11</dd>
            </div>
            <div>
              <dt className="tracking-[0.16em] uppercase">Sort</dt>
              <dd className="mt-1 font-medium text-ink">
                {SORT_OPTIONS.find((s) => s.value === params.sort)?.label}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="pt-10">
        <ShopView
          key={JSON.stringify(params)}
          params={params}
          options={options}
          products={result.products}
          total={result.total}
          totalPages={result.totalPages}
          collectionNames={collectionNames}
        />
      </div>

      {/* Category jump-links — helpful when the filtered result set is empty. */}
      <nav aria-label="Browse by category" className="mt-20 border-t border-line pt-8">
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {CATEGORIES.map((slug) => (
            <li key={slug}>
              <a
                href={`/shop?category=${slug}`}
                className="link-underline text-ink/80 hover:text-gold-deep"
              >
                {CATEGORY_LABEL[slug] ?? slug}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function describeQuery(params: ReturnType<typeof parseShopParams>): string {
  if (params.q) return `Results for “${params.q}”`;
  if (params.gender.length === 1 && !params.category.length) {
    return params.gender[0] === "MEN" ? "Men’s footwear" : params.gender[0] === "WOMEN" ? "Women’s footwear" : "Unisex footwear";
  }
  if (params.category.length === 1 && !params.gender.length) {
    return CATEGORY_LABEL[params.category[0]] ?? "Shop";
  }
  if (params.collection.length === 1) return collectionTitle(params.collection[0]);
  return "Shop all footwear";
}

function collectionTitle(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
