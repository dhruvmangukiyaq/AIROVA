import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";

const BANNERS = [
  {
    title: "Shop Men",
    href: "/shop?gender=men",
    image: "/images/products/cinder-ash-edition-sports-shoe-4-poster.webp",
    alt: "Man wearing AIROVA Cinder Ash Edition sports shoes on rocky terrain",
    copy: "Sports shoes, loafers and everyday denim sneakers — built wider, cushioned harder.",
    tone: "dark" as const,
  },
  {
    title: "Shop Women",
    href: "/shop?gender=women",
    image: "/images/products/pink-denim-low-top-sneaker-1.webp",
    alt: "AIROVA pink denim low-top sneaker",
    copy: "Lighter lasts, softer washes and the same uncompromising sole.",
    tone: "light" as const,
  },
];

/** Two-up editorial banners routing traffic into the men's and women's edits. */
export function SplitBanners() {
  return (
    <section className="shell py-16 sm:py-20" aria-labelledby="edits-heading">
      <h2 id="edits-heading" className="sr-only">
        Shop by edit
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        {BANNERS.map((b, i) => (
          <Reveal key={b.href} delay={i * 0.1}>
            <Link
              href={b.href}
              className="group relative block aspect-[4/5] overflow-hidden bg-bone sm:aspect-[5/4]"
            >
              <Image
                src={b.image}
                alt={b.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`transition-transform duration-[900ms] ease-out group-hover:scale-105 ${
                  b.tone === "light" ? "object-contain p-8" : "object-cover"
                }`}
              />
              <div
                aria-hidden
                className={`absolute inset-0 ${
                  b.tone === "dark"
                    ? "bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                    : "bg-gradient-to-t from-bone/95 via-bone/25 to-transparent"
                }`}
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 sm:p-8">
                <p
                  className={`text-[0.62rem] font-semibold tracking-[0.24em] uppercase ${
                    b.tone === "dark" ? "text-gold" : "text-gold-deep"
                  }`}
                >
                  {b.tone === "dark" ? "For him" : "For her"}
                </p>
                <h3
                  className={`mt-2 text-3xl sm:text-4xl ${
                    b.tone === "dark" ? "text-cream" : "text-ink"
                  }`}
                >
                  {b.title}
                </h3>
                <p
                  className={`mt-2 max-w-xs text-sm leading-relaxed ${
                    b.tone === "dark" ? "text-cream/65" : "text-ink/65"
                  }`}
                >
                  {b.copy}
                </p>
                <span
                  className={`mt-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] uppercase transition-all group-hover:gap-4 ${
                    b.tone === "dark" ? "text-cream" : "text-ink"
                  }`}
                >
                  Explore <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
