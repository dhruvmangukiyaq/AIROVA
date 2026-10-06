import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCollections, listProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Collections — Aqua, Flare, Aero & Cinder",
  description:
    "Four elements, four signatures. Explore the AIROVA Aqua, Flare, Aero and Cinder collections — premium sneakers and sports shoes built in India.",
  alternates: { canonical: "/collections" },
  openGraph: {
    title: "The Elements Edition — AIROVA Collections",
    description: "Aqua, Flare, Aero and Cinder. Four signatures, one standard.",
    url: "/collections",
  },
};

export default async function CollectionsPage() {
  const collections = await getCollections();
  const priced = await listProducts({ perPage: 24, sort: "newest" });
  const priceFor = (slug: string) => {
    const items = priced.products.filter((p) => p.collectionSlug === slug);
    if (!items.length) return null;
    const min = Math.min(...items.map((p) => p.price));
    const max = Math.max(...items.map((p) => p.price));
    return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
  };

  return (
    <div className="pb-24 sm:pb-32">
      <header className="shell border-b border-ink pb-10 pt-10 sm:pb-14 sm:pt-16">
        <p className="eyebrow">The Elements Edition</p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-[3.5rem]">Collections</h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Four elements, four signatures. Each collection starts from a single mood —
              water, fire, air and earth — and ends in a pair you can wear every day.
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] text-ink uppercase"
          >
            Shop everything
            <ArrowRight className="size-3.5 text-gold-deep transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      <div className="shell mt-12 grid gap-8 md:grid-cols-2">
        {collections.map((collection, i) => {
          const price = priceFor(collection.slug);
          return (
            <Reveal key={collection.slug} delay={i * 0.06}>
              <Link href={`/collections/${collection.slug}`} className="group block">
                <article>
                  <div className="img-well bg-ink">
                    {collection.image && (
                      <Image
                        src={collection.image}
                        alt={`${collection.name} collection`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading={i < 2 ? "eager" : "lazy"}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <p className="text-[0.62rem] font-semibold tracking-[0.28em] text-gold uppercase">
                        {collection.tagline ?? "Elements Edition"}
                      </p>
                      <h2 className="mt-2 text-3xl text-cream sm:text-4xl">{collection.name}</h2>
                      <div className="mt-3 flex items-center gap-3 text-xs text-cream/70 tabular-nums">
                        <span>{collection.count} styles</span>
                        {price && (
                          <>
                            <span aria-hidden>·</span>
                            <span>From {price}</span>
                          </>
                        )}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] text-gold uppercase">
                        Explore
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1.5" />
                      </span>
                    </div>
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
                  </div>
                </article>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <section className="shell mt-16 border-t border-line pt-10">
        <div className="grid gap-8 md:grid-cols-4">
          {[
            ["01", "Source", "Every silhouette begins with one element and one question."],
            ["02", "Sample", "Lasts are refined in-house until the fit feels inevitable."],
            ["03", "Make", "Cut, stitched and finished by partner units in Maharashtra."],
            ["04", "Ship", "Packed in Mumbai, dispatched within 24 hours of your order."],
          ].map(([n, title, body]) => (
            <div key={n}>
              <p className="text-[0.65rem] font-semibold tracking-[0.24em] text-gold tabular-nums">
                {n}
              </p>
              <h3 className="mt-2 text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
