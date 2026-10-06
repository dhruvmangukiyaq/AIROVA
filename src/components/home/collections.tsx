import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion";

export interface CollectionTile {
  name: string;
  slug: string;
  tagline?: string | null;
  image?: string | null;
  count?: number;
}

const FALLBACK_TONE: Record<string, string> = {
  aqua: "#0d2a4a",
  flare: "#2a0d0d",
  aero: "#efe6d4",
  cinder: "#1a1a1a",
  denim: "#1f2f52",
};

/** Horizontal rail of collection cards with the poster art. */
export function CollectionRail({ collections }: { collections: CollectionTile[] }) {
  return (
    <section className="bg-ink py-16 text-cream sm:py-20" aria-labelledby="collections-heading">
      <div className="shell">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The Elements Edition</p>
            <h2 id="collections-heading" className="mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]">
              Four collections. One craft.
            </h2>
          </div>
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] text-gold uppercase transition-colors hover:text-gold-bright"
          >
            All collections
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {collections.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 0.07}>
              <Link
                href={`/shop?collection=${c.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-ink-soft"
                style={{
                  backgroundColor: FALLBACK_TONE[c.slug] ?? "#16161a",
                }}
              >
                {c.image && (
                  <Image
                    src={c.image}
                    alt={`${c.name} collection`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover opacity-85 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[0.55rem] tracking-[0.24em] text-gold uppercase">
                    {c.count ? `${c.count} products` : "Collection"}
                  </p>
                  <h3 className="mt-1 text-2xl text-cream">{c.name}</h3>
                  {c.tagline && (
                    <p className="mt-1 line-clamp-2 text-[0.72rem] leading-snug text-cream/55">
                      {c.tagline.split("—")[0]?.trim()}
                    </p>
                  )}
                </div>
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Dark editorial strip telling the brand story between two grids. */
export function BrandStory() {
  const stats = [
    { value: "4", label: "Elemental collections" },
    { value: "15+", label: "Styles in stock" },
    { value: "7", label: "Days to return" },
    { value: "10k+", label: "Pairs on the street" },
  ];

  return (
    <section className="relative overflow-hidden border-y border-line bg-bone py-16 sm:py-24" aria-labelledby="story-heading">
      <div className="shell grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <Reveal>
          <p className="eyebrow">Our story</p>
          <h2 id="story-heading" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]">
            Footwear that respects
            <br />
            the ground it walks on.
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            <p>
              AIROVA started with a simple frustration: shoes that looked premium
              in the studio and fell apart by the second monsoon. So we built our
              own — lasts shaped for Indian feet, outsoles tested on Mumbai
              tarmac, and materials chosen for heat, humidity and hard use.
            </p>
            <p>
              Every pair carries the same gold mark:{" "}
              <em className="text-ink not-italic">Nature inspires. You move.</em>{" "}
              It is a promise that nothing on the shoe is decorative unless it
              also works.
            </p>
          </div>
          <dl className="mt-9 grid max-w-xl grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-bone px-4 py-5 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-2xl text-ink">{s.value}</span>
                  <span className="mt-1 block text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.12} className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
            <Image
              src="/images/products/aqua-water-edition-sports-shoe-4-poster.webp"
              alt="AIROVA Aqua Water Edition packaging with box, dust bag and accessories"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden border border-gold/40 bg-paper px-5 py-4 shadow-xl sm:block">
            <p className="eyebrow">Packaging</p>
            <p className="mt-1 font-display text-lg text-ink">Unboxing, upgraded</p>
            <p className="text-[0.7rem] text-muted-foreground">
              Box, dust bag, spare laces, care card
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
