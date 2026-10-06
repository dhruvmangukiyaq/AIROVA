import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Quote, Star, Truck, ShieldCheck, Headphones } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { STORE, whatsappLink } from "@/lib/commerce";
import { SITE } from "@/lib/site";

const REVIEWS = [
  {
    name: "Rohit S.",
    city: "Mumbai",
    rating: 5,
    title: "Monsoon-proof",
    body: "Wore the Aqua through three weeks of Mumbai rain. Grip is genuinely different — no sliding on wet platform tiles.",
    product: "Aqua Water Edition",
  },
  {
    name: "Sneha R.",
    city: "Bengaluru",
    rating: 5,
    title: "Worth every rupee",
    body: "Packaging felt like a ₹8k shoe. The Flare gets stopped on the street — people literally ask where they're from.",
    product: "Flare Fire Edition",
  },
  {
    name: "Imran Q.",
    city: "Hyderabad",
    rating: 4,
    title: "Repeat buyer",
    body: "Third order now. Sizing is consistent across the loafers and sneakers, which is rare for an Indian brand.",
    product: "Denim Edit",
  },
];

const SOCIAL = [
  {
    src: "/images/products/flare-fire-edition-sports-shoe-3-poster.webp",
    alt: "AIROVA Flare Fire Edition worn on the street at sunset",
  },
  {
    src: "/images/products/aero-air-edition-sneaker-1.webp",
    alt: "Pair of AIROVA Aero Air Edition ivory and gold sneakers",
  },
  {
    src: "/images/products/cinder-ash-edition-sports-shoe-2-poster.webp",
    alt: "AIROVA Cinder Ash Edition top view on volcanic rock",
  },
  {
    src: "/images/products/navy-denim-slip-on-loafer-1.webp",
    alt: "AIROVA navy denim slip-on loafers with gold hardware",
  },
];

const PROMISES = [
  { icon: Truck, title: "Free shipping", copy: "On every order above ₹2,999, pan-India." },
  { icon: ShieldCheck, title: "Secure payments", copy: "UPI, cards, net banking & COD." },
  { icon: Headphones, title: "Real humans", copy: "WhatsApp support 10am–7pm, Mon–Sat." },
];

export function Testimonials() {
  return (
    <section className="shell py-16 sm:py-20" aria-labelledby="reviews-heading">
      <SectionHeading
        eyebrow="4.7 / 5 from 1,284 shoppers"
        title="What the street is saying"
        description="Verified reviews from customers across India."
      />
      <h2 id="reviews-heading" className="sr-only">
        Customer testimonials
      </h2>

      <div className="grid gap-5 md:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.08}>
            <figure className="flex h-full flex-col border border-line bg-paper p-6 transition-colors hover:border-gold/50">
              <Quote className="size-6 text-gold/60" aria-hidden />
              <blockquote className="mt-4 flex-1">
                <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-gold-deep uppercase">
                  {r.title}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  “{r.body}”
                </p>
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-between border-t border-line pt-4">
                <div>
                  <p className="text-sm font-medium text-ink">{r.name}</p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {r.city} · {r.product}
                  </p>
                </div>
                <span className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: r.rating }).map((_, s) => (
                    <Star key={s} className="size-3 fill-gold text-gold" />
                  ))}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-3">
        {PROMISES.map((p) => (
          <li key={p.title} className="flex items-start gap-4 bg-paper px-6 py-6">
            <p.icon className="mt-0.5 size-5 shrink-0 text-gold-deep" />
            <div>
              <p className="text-sm font-semibold text-ink">{p.title}</p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-muted-foreground">
                {p.copy}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SocialCta() {
  return (
    <section className="bg-ink py-16 text-cream sm:py-20" aria-labelledby="social-heading">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Follow the movement</p>
            <h2 id="social-heading" className="mt-4 text-3xl leading-tight sm:text-4xl">
              Tag <span className="text-gold">@airova.footwear</span>
              <br />
              to be featured.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/60">
              Drop photos, styling questions or size doubts straight into our
              WhatsApp — a real person replies within minutes.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-gold/50 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-gold uppercase transition-colors hover:bg-gold hover:text-ink"
              >
                <InstagramIcon className="size-4" /> Instagram
              </a>
              <a
                href={whatsappLink("Hi AIROVA! I saw your shoes on Instagram — can you help me pick a size?")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1f9d55] px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#178346]"
              >
                <MessageCircle className="size-4" /> WhatsApp us
              </a>
              <Link
                href="/shop"
                className="border border-cream/25 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-cream uppercase transition-colors hover:border-cream hover:bg-cream hover:text-ink"
              >
                Shop now
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SOCIAL.map((s, i) => (
              <Reveal key={s.src} delay={i * 0.06}>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden bg-ink-soft"
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute inset-0 bg-ink/45 opacity-0 transition-opacity group-hover:opacity-100" />
                  <InstagramIcon className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-cream opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ink-line pt-6 text-[0.65rem] tracking-[0.2em] text-cream/45 uppercase">
          <span>Delivery in {STORE.name}</span>
          <span>Nature inspires. You move.</span>
        </div>
      </div>
    </section>
  );
}
