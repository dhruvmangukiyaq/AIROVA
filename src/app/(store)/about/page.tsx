import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, HeartPulse, Ruler, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/pages/page-hero";
import { MotionScope } from "@/components/pages/motion-scope";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About AIROVA",
  description:
    "AIROVA FOOTWEAR — Step Into Style. Founded in Mumbai in 2021, we build sports shoes, sneakers and loafers for Indian streets, weather and proportions. Four element collections, 15+ styles, shipped across 180+ Indian cities.",
  alternates: { canonical: "/about" },
};

const ABOUT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `About ${SITE.name}`,
  url: `${SITE.url}/about`,
  description:
    "AIROVA FOOTWEAR designs and sells premium sports shoes, sneakers and loafers for the Indian market.",
  mainEntity: {
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.legalName,
    slogan: SITE.tagline,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    foundingDate: "2021",
    founder: SITE.legalName,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400069",
      addressCountry: "IN",
    },
    sameAs: [SITE.instagram],
  },
} as const;

const PILLARS = [
  {
    icon: Gem,
    title: "Materials",
    copy: "Washed denim and knit uppers, water-shedding coatings on the Aqua line, and moulded EVA midsoles chosen after they survived a Mumbai July — not a studio shoot.",
  },
  {
    icon: HeartPulse,
    title: "Comfort",
    copy: "Lasts shaped around Indian feet, cushioned footbeds with arch support, and breathability tuned for 34°C afternoons and hour-long commutes.",
  },
  {
    icon: Sparkles,
    title: "Design",
    copy: "One element per collection, one silhouette at a time. Nothing on the shoe is decorative unless it also works — that is what the gold mark means.",
  },
  {
    icon: Ruler,
    title: "Value",
    copy: "Every pair is ₹1,999–₹4,499, direct to you with no distributor layers. Fair pricing, free shipping over ₹2,999, and a 90-day defect warranty.",
  },
];

const TIMELINE = [
  {
    name: "Aqua",
    year: "2023",
    copy: "Our first element. A water-shedding upper and a siped outsole built for monsoon platforms and wet tarmac.",
    image: "/images/products/aqua-water-edition-sports-shoe-3-poster.webp",
    alt: "AIROVA Aqua Water Edition sports shoe poster",
  },
  {
    name: "Flare",
    year: "2024",
    copy: "The loud one — saturated colour blocking and reflective hits for people who get stopped on the street.",
    image: "/images/products/flare-fire-edition-sports-shoe-3-poster.webp",
    alt: "AIROVA Flare Fire Edition sports shoe poster",
  },
  {
    name: "Aero",
    year: "2025",
    copy: "Our lightest build. Featherweight knits and a foam that stays springy through a full day on your feet.",
    image: "/images/products/aero-air-edition-sneaker-4-poster.webp",
    alt: "AIROVA Aero Air Edition sneaker poster",
  },
  {
    name: "Cinder",
    year: "2026",
    copy: "Rugged by design — reinforced toe, chunkier tread and muted ash tones for trails, campuses and everything between.",
    image: "/images/products/cinder-ash-edition-sports-shoe-2-poster.webp",
    alt: "AIROVA Cinder Ash Edition sports shoe poster",
  },
];

const NUMBERS = [
  { value: "2021", label: "Founded in Mumbai" },
  { value: "15+", label: "Styles in stock" },
  { value: "4", label: "Element collections" },
  { value: "180+", label: "Cities served" },
  { value: "4.7", label: "From 1,284 reviews" },
];

// Static route: no params, typed only so the route helper stays honest.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AboutPage(_props: PageProps<"/about">) {
  return (
    <MotionScope>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ABOUT_JSONLD) }}
      />

      <PageHero
        eyebrow="Since 2021 · Mumbai"
        title="About AIROVA"
        description="We make footwear for Indian streets, Indian weather and Indian feet — and we refuse to charge runway prices for it."
        breadcrumbs={[{ label: "About AIROVA", href: "/about" }]}
      />

      {/* brand story */}
      <section className="shell grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24" aria-labelledby="story-heading">
        <Reveal>
          <p className="eyebrow">Our story</p>
          <h2 id="story-heading" className="mt-4 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]">
            Step Into Style
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            <p>
              AIROVA began with a frustration every Indian shopper knows: shoes that looked
              premium in the studio and fell apart by the second monsoon. So we stopped buying
              someone else&rsquo;s lasts and made our own — shaped for wider forefeet, tested on
              Mumbai tarmac, and specified for heat, humidity and hard daily use.
            </p>
            <p>
              Today we design in Andheri East, produce with long-standing partners we visit every
              batch, and ship direct to more than 180 cities. No distributor mark-ups, no
              seasonal theatre — just four element collections, refined drop by drop.
            </p>
            <p>
              Every pair carries the same gold line:{" "}
              <em className="text-ink not-italic">Nature inspires. You move.</em>
            </p>
          </div>

          <Button variant="ink" size="lg" className="mt-8" asChild>
            <Link href="/shop">
              Shop the collections
              <ArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
        </Reveal>

        <Reveal delay={0.12} className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone">
            <Image
              src="/images/products/white-denim-low-top-sneaker-1.webp"
              alt="Pair of AIROVA white denim low-top sneakers on a warm neutral surface"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 hidden border border-gold/40 bg-paper px-5 py-4 shadow-xl sm:block">
            <p className="eyebrow">Designed in</p>
            <p className="mt-1 font-display text-lg text-ink">Mumbai, India</p>
            <p className="text-[0.7rem] text-muted-foreground">Shipped to 180+ cities</p>
          </div>
        </Reveal>
      </section>

      {/* large typographic block */}
      <section className="border-y border-line bg-ink py-20 text-cream sm:py-28" aria-labelledby="manifesto-heading">
        <div className="shell">
          <h2 id="manifesto-heading" className="sr-only">
            Our manifesto
          </h2>
          <Reveal>
            <p aria-hidden className="text-[0.66rem] font-semibold tracking-[0.3em] text-gold uppercase">
              Nature inspires
            </p>
            <p className="mt-6 text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.03em] text-cream">
              You move.
            </p>
            <div aria-hidden className="rule-gold my-10" />
            <div className="grid gap-8 sm:grid-cols-3">
              <p className="text-[clamp(1.1rem,2vw,1.5rem)] leading-snug text-cream/70">
                <span className="text-gold-gradient italic">Four elements.</span> One standard of
                craft — from the first sketch to the box on your doorstep.
              </p>
              <p className="text-[clamp(1.1rem,2vw,1.5rem)] leading-snug text-cream/70">
                <span className="text-gold-gradient italic">Built for here.</span> Heat, humidity,
                monsoon, traffic. We design for the ground you actually walk on.
              </p>
              <p className="text-[clamp(1.1rem,2vw,1.5rem)] leading-snug text-cream/70">
                <span className="text-gold-gradient italic">Priced honestly.</span> ₹1,999 to
                ₹4,499, direct from us to you — craft without the import mark-up.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* craft & values */}
      <section className="shell py-16 sm:py-20 lg:py-24" aria-labelledby="pillars-heading">
        <SectionHeading
          eyebrow="What we obsess over"
          title="Four pillars of the house"
          description="Everything we make has to clear all four before it gets a name."
        />
        <h2 id="pillars-heading" className="sr-only">
          Craft and values
        </h2>

        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.07}>
              <div className="h-full bg-paper p-7 sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="flex size-11 items-center justify-center border border-gold/40 text-gold-deep">
                    <p.icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-[0.66rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.copy}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* collection timeline */}
      <section className="border-y border-line bg-bone py-16 sm:py-20 lg:py-24" aria-labelledby="timeline-heading">
        <div className="shell">
          <SectionHeading
            eyebrow="The Elements Edition"
            title="Four collections, one line"
            description="Each collection takes one element and pushes it as far as the silhouette will allow."
            href="/collections"
            linkLabel="Explore collections"
          />
          <h2 id="timeline-heading" className="sr-only">
            Collection timeline
          </h2>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((step, i) => (
              <Reveal as="li" key={step.name} delay={i * 0.08}>
                <article className="group flex h-full flex-col border border-line bg-paper">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-bone">
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-ink/85 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.2em] text-gold uppercase backdrop-blur-sm">
                      {step.year}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-2xl text-ink">{step.name}</h3>
                    <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-muted-foreground">
                      {step.copy}
                    </p>
                    <Link
                      href={`/shop?collection=${step.name.toLowerCase()}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-[0.66rem] font-semibold tracking-[0.18em] text-gold-deep uppercase link-underline self-start"
                    >
                      Shop {step.name}
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* numbers */}
      <section className="shell py-16 sm:py-20" aria-labelledby="numbers-heading">
        <h2 id="numbers-heading" className="sr-only">
          AIROVA in numbers
        </h2>
        <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.05}>
              <div className="h-full bg-paper px-4 py-7 text-center">
                <dt className="sr-only">{n.label}</dt>
                <dd>
                  <span className="block font-display text-3xl text-ink">{n.value}</span>
                  <span className="mt-2 block text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase">
                    {n.label}
                  </span>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* atelier note */}
      <section className="border-y border-line bg-bone py-16 sm:py-20" aria-labelledby="atelier-heading">
        <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">Inside the atelier</p>
            <h2 id="atelier-heading" className="mt-4 text-3xl leading-tight sm:text-4xl">
              A small team, a long memory
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
              <p>
                AIROVA is a twelve-person studio: designers, a pattern cutter, a quality lead and
                the support team that answers your WhatsApp. We sample every silhouette three
                times before it is allowed into a collection, and our quality lead personally
                pulls a pair from each production batch for wear-testing.
              </p>
              <p>
                Because we are small, we can be stubborn — a last that does not work in the heat
                does not ship, a colour that fades after ten washes never leaves the sample room,
                and a defective pair is replaced, not argued with.
              </p>
              <p className="text-ink">
                Want to see how a pair is built, or need a size recommendation?{" "}
                <Link href="/contact" className="link-underline font-medium text-gold-deep">
                  Talk to the studio
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-ink py-16 text-cream sm:py-20" aria-labelledby="about-cta-heading">
        <div className="shell flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2 id="about-cta-heading" className="mt-3 text-3xl leading-tight sm:text-4xl">
              Find the pair that moves with you.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/60">
              Free shipping over ₹2,999, COD across India, and 7 days to change your mind.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="gold" size="xl" asChild>
              <Link href="/shop">
                Shop all
                <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
            <Button variant="outline-light" size="xl" asChild>
              <Link href="/size-guide">Find your size</Link>
            </Button>
          </div>
        </div>
      </section>
    </MotionScope>
  );
}
