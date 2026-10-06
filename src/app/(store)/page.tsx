import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/home/hero";
import { SplitBanners } from "@/components/home/split-banners";
import { CollectionRail, BrandStory } from "@/components/home/collections";
import { ProductRail } from "@/components/home/product-rail";
import { Testimonials, SocialCta } from "@/components/home/social-proof";
import { Reveal } from "@/components/motion";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getBestSellers,
  getCollections,
  getNewArrivals,
  listProducts,
} from "@/lib/catalog";

export default async function HomePage() {
  const [collections, newArrivals, bestSellers, featured] = await Promise.all([
    getCollections(),
    getNewArrivals(8),
    getBestSellers(8),
    listProducts({ sort: "popular", perPage: 4 }),
  ]);

  return (
    <>
      <Hero />

      <SplitBanners />

      <CollectionRail collections={collections} />

      {/* Featured grid — the four headline pairs */}
      <section className="shell py-16 sm:py-20" aria-labelledby="featured-heading">
        <SectionHeading
          eyebrow="Hand-picked"
          title="The headline pairs"
          description="Four silhouettes that define the Elements Edition — each one engineered around a single element."
          href="/shop"
          linkLabel="Shop all"
        />
        <h2 id="featured-heading" className="sr-only">
          Featured products
        </h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {featured.products.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.07}>
              <ProductCard product={p} index={i} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      <ProductRail
        eyebrow="Just landed"
        title="New arrivals"
        description="Fresh washes, new colourways and the latest element drops."
        href="/shop?sort=newest"
        products={newArrivals}
      />

      <BrandStory />

      <ProductRail
        eyebrow="Most wanted"
        title="Best sellers"
        description="The pairs that keep coming back into stock first."
        href="/shop?sort=popular"
        products={bestSellers}
      />

      {/* category shortcuts */}
      <section className="border-y border-line bg-bone py-14" aria-labelledby="categories-heading">
        <div className="shell">
          <SectionHeading
            eyebrow="Shop by category"
            title="Find your pair faster"
          />
          <h2 id="categories-heading" className="sr-only">
            Shop by category
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {[
              { slug: "sports", label: "Sports shoes", copy: "Performance trainers with all-terrain grip", img: "/images/products/flare-fire-edition-sports-shoe-1.webp" },
              { slug: "sneakers", label: "Sneakers", copy: "Everyday low-tops in denim and knit", img: "/images/products/white-denim-low-top-sneaker-1.webp" },
              { slug: "loafers", label: "Loafers", copy: "Slip-ons for smart-casual days", img: "/images/products/sky-blue-denim-slip-on-loafer-1.webp" },
            ].map((c, i) => (
              <Reveal as="li" key={c.slug} delay={i * 0.08}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="group flex items-center gap-4 border border-line bg-paper p-4 transition-colors hover:border-gold"
                >
                  <span className="img-well size-20 shrink-0 bg-bone">
                    <Image
                      src={c.img}
                      alt={c.label}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-110"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg text-ink">{c.label}</span>
                    <span className="mt-0.5 block text-[0.75rem] leading-snug text-muted-foreground">
                      {c.copy}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <Testimonials />
      <SocialCta />
    </>
  );
}
