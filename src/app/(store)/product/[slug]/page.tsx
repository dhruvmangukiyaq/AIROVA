import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, PackageCheck, RefreshCcw, Ruler } from "lucide-react";
import { db } from "@/lib/db";
import {
  getProduct,
  getRelatedProducts,
  getReviews,
  getReviewSummary,
} from "@/lib/catalog";
import { SITE } from "@/lib/site";
import { STORE } from "@/lib/commerce";
import { discountPercent, formatPrice } from "@/lib/format";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { ReviewSection } from "@/components/product/reviews";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";
import { ProductCard } from "@/components/product/product-card";
import { StarRating } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const title = `${product.name} — ${product.colorName}`;
  const description = product.description.slice(0, 155);
  const image = product.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE.name}`,
      description,
      url: `/product/${product.slug}`,
      images: image ? [{ url: image, alt: `${product.name} in ${product.colorName}` }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const [related, siblings, reviews, summary] = await Promise.all([
    getRelatedProducts(product, 4),
    db.product.findMany({
      where: {
        active: true,
        id: { not: product.id },
        OR: [
          { collectionSlug: product.collectionSlug ?? "___none___" },
          { categorySlug: product.categorySlug },
        ],
      },
      select: { slug: true, name: true, colorName: true, images: true },
      take: 8,
    }),
    getReviews(product.id),
    getReviewSummary(product.id),
  ]);

  const relatedColors = siblings.map((s) => ({
    slug: s.slug,
    name: s.name,
    colorName: s.colorName,
    image: (JSON.parse(s.images || "[]") as string[])[0] ?? "",
  }));

  const pct = discountPercent(product.price, product.mrp);
  const breadcrumb = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(product.category
      ? [{ label: product.category.name, href: `/shop?category=${product.category.slug}` }]
      : []),
    { label: product.name, href: `/product/${product.slug}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} — ${product.colorName}`,
    sku: product.slug.toUpperCase(),
    brand: { "@type": "Brand", name: SITE.name },
    description: product.description,
    image: product.images.map((img) => `${SITE.url}${img}`),
    category: product.category?.name,
    color: product.colorName,
    material: product.material ?? undefined,
    aggregateRating:
      summary.total > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: summary.avg,
            reviewCount: summary.total,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE.name },
    },
    review: reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.body,
      datePublished: new Date(r.createdAt).toISOString(),
    })),
  };

  return (
    <div className="shell pb-24 pt-6 sm:pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 overflow-x-auto hide-scrollbar">
        <ol className="flex items-center gap-2 whitespace-nowrap text-[0.68rem] tracking-[0.12em] text-muted-foreground uppercase">
          {breadcrumb.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="size-3 opacity-50" aria-hidden />}
              {i === breadcrumb.length - 1 ? (
                <span aria-current="page" className="text-ink">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="transition-colors hover:text-gold-deep">
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            alt={`${product.name} in ${product.colorName}`}
            badge={product.badge}
          />
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">
              {product.collection?.name ?? product.category?.name ?? "AIROVA"} ·{" "}
              {product.gender === "UNISEX" ? "Unisex" : product.gender === "MEN" ? "Men" : "Women"}
            </p>

            <h1 className="mt-3 text-3xl leading-[1.1] sm:text-4xl">{product.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={product.rating} count={summary.total || product.reviewCount} />
              <span className="text-xs text-muted-foreground">SKU {product.slug.toUpperCase()}</span>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-semibold tabular-nums">{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-base text-muted-foreground line-through tabular-nums">
                  {formatPrice(product.mrp)}
                </span>
              )}
              {pct > 0 && (
                <span className="border border-gold/50 bg-gold/10 px-2 py-0.5 text-[0.68rem] font-semibold tracking-[0.1em] text-gold-deep uppercase">
                  {pct}% off
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Inclusive of all taxes · Free shipping over {formatPrice(STORE.freeShippingThreshold)}
            </p>

            <Separator className="my-6" />

            <PurchasePanel product={product} relatedColors={relatedColors} />
          </div>
        </div>
      </div>

      {/* Details */}
      <section aria-labelledby="details-heading" className="mt-20 border-t border-ink pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <p className="eyebrow">The detail</p>
            <h2 id="details-heading" className="mt-3 text-3xl">
              Built to be worn every day
            </h2>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.material && (
              <div className="mt-8">
                <h3 className="text-lg">Materials</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {product.material}
                </p>
              </div>
            )}

            {product.features.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg">Features</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 border border-line bg-bone/50 px-3.5 py-3 text-sm"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 bg-gold" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="border border-line p-5">
              <div className="flex items-center gap-2.5">
                <PackageCheck className="size-4 text-gold-deep" />
                <h3 className="text-sm">Delivery</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Dispatched from Mumbai within 24 hours. Standard delivery 3–6 days, express 1–2
                days. Free over {formatPrice(STORE.freeShippingThreshold)}.
              </p>
            </div>

            <div className="border border-line p-5">
              <div className="flex items-center gap-2.5">
                <RefreshCcw className="size-4 text-gold-deep" />
                <h3 className="text-sm">Returns & exchanges</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                7 days to return or exchange for a different size — free of charge on your first
                exchange. Unworn, in the original box with tags attached.
              </p>
              <Link
                href="/shipping-and-returns"
                className="link-underline mt-3 inline-block text-xs font-semibold tracking-[0.12em] text-gold-deep uppercase"
              >
                Read the policy
              </Link>
            </div>

            <div className="border border-line p-5">
              <div className="flex items-center gap-2.5">
                <Ruler className="size-4 text-gold-deep" />
                <h3 className="text-sm">Fit</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                True to size with a standard width. Between sizes? Size up, or ask our fit team.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <SizeGuideDialog triggerVariant="outline" />
                <Link
                  href="/size-guide"
                  className="text-xs font-semibold tracking-[0.12em] text-gold-deep uppercase underline-offset-4 hover:underline"
                >
                  Full guide
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Reviews */}
      <section aria-labelledby="reviews-heading" id="reviews" className="mt-20 border-t border-ink pt-12">
        <p className="eyebrow">Worn & reviewed</p>
        <h2 id="reviews-heading" className="mt-3 text-3xl">
          What people say
        </h2>
        <div className="mt-8">
          <ReviewSection productId={product.id} summary={summary} reviews={reviews} />
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20 border-t border-ink pt-12">
          <p className="eyebrow">Keep exploring</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="related-heading" className="text-3xl">
                You may also like
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Pairs cut from the same brief — similar build, different element.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/shop">View all</Link>
            </Button>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((item, i) => (
              <li key={item.id}>
                <ProductCard product={item} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
