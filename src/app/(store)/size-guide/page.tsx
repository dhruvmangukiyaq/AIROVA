import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/pages/page-hero";
import { MotionScope } from "@/components/pages/motion-scope";
import { Reveal } from "@/components/motion";
import { SizeChart } from "@/components/pages/size-chart";
import { SizeFinder } from "@/components/pages/size-finder";
import { WhatsAppCta } from "@/components/pages/whatsapp-cta";

export const metadata: Metadata = {
  title: "Size guide",
  description:
    "AIROVA size guide — UK 5 to 11 with foot length in inches and centimetres, EU and US equivalents, a find-my-size tool, 4-step measuring instructions and fit advice for sneakers, sports shoes and loafers.",
  alternates: { canonical: "/size-guide" },
};

const STEPS = [
  {
    title: "Trace your foot",
    copy: "Stand on a sheet of paper with your heel against a wall, weight evenly spread, in the socks you plan to wear with the shoes.",
  },
  {
    title: "Measure the line",
    copy: "Draw a straight line from the back of the heel to the tip of the longest toe and measure it in centimetres, right down to the millimetre.",
  },
  {
    title: "Do the other foot",
    copy: "Feet are never identical. Measure both — you will almost always find one slightly longer than the other.",
  },
  {
    title: "Match the chart",
    copy: "Use the larger measurement. Our sizes already carry about 1 cm of room, so do not add any extra.",
  },
];

const FIT_NOTES = [
  {
    title: "Sneakers",
    copy: "True to size with a rounded toe box. The denim and knit uppers give slightly after a day, so between sizes go up — never down.",
    tag: "Denim & knit low-tops",
  },
  {
    title: "Sports shoes",
    copy: "Snug through the midfoot, roomier in the toes, and the moulded footbed sits close to the arch. Wide feet and high insteps should size up one.",
    tag: "Aqua · Flare · Cinder",
  },
  {
    title: "Loafers",
    copy: "A slip-on needs a close heel at first — it will feel snug for two or three wears, then soften and settle. Half a size up if you are between sizes.",
    tag: "Slip-ons",
  },
];

// Static route: no params, typed only so the route helper stays honest.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SizeGuidePage(_props: PageProps<"/size-guide">) {
  return (
    <MotionScope>
      <PageHero
        eyebrow="Fit, solved"
        title="Size guide"
        description="UK (India) sizing from 5 to 11, measured in real foot length — plus a tool that picks the size for you."
        breadcrumbs={[{ label: "Size guide", href: "/size-guide" }]}
      />

      {/* chart */}
      <section className="shell py-16 sm:py-20" aria-labelledby="chart-heading">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          <div>
            <p className="eyebrow">The chart</p>
            <h2 id="chart-heading" className="mt-4 text-3xl leading-tight text-ink sm:text-4xl">
              UK 5 to 11, in real measurements
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Every AIROVA size is listed against the foot length it is built for. Toggle between
              inches and centimetres — EU and US equivalents stay the same.
            </p>
            <div className="mt-8">
              <SizeChart />
            </div>
          </div>

          <aside className="space-y-5 lg:pt-16" aria-label="Sizing notes">
            <div className="border border-line bg-bone p-6">
              <p className="eyebrow">Between sizes?</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Size up. A little extra room is never a problem in a lace-up, and it saves you an
                exchange. Half a size is enough — you do not need a full size.
              </p>
            </div>
            <div className="border border-line bg-bone p-6">
              <p className="eyebrow">Wide or flat feet?</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Our sports styles have the roomiest toe box and a moulded arch. For wide feet we
                recommend sizing up one full size in sneakers and loafers.
              </p>
            </div>
            <div className="border border-line bg-bone p-6">
              <p className="eyebrow">Measured already?</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Drop the number into the finder below and we will name the size — then we will
                hold it for you on WhatsApp if you ask.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* finder */}
      <section className="border-y border-line bg-bone py-16 sm:py-20" aria-labelledby="finder-heading">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow">Interactive</p>
            <h2 id="finder-heading" className="mt-4 text-3xl leading-tight text-ink sm:text-4xl">
              Let the finder do the maths
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One number in, one size out. We match your foot length to the smallest size that
              still has room to move — the same rule our fit team uses on WhatsApp.
            </p>
          </div>
          <SizeFinder />
        </div>
      </section>

      {/* how to measure */}
      <section className="shell py-16 sm:py-20" aria-labelledby="measure-heading">
        <p className="eyebrow">How to measure your foot</p>
        <h2 id="measure-heading" className="mt-4 text-3xl leading-tight text-ink sm:text-4xl">
          Four steps, two minutes
        </h2>

        <ol className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.07}>
              <div className="h-full bg-paper p-6 sm:p-7">
                <span
                  aria-hidden
                  className="block font-display text-5xl leading-none text-gold/40"
                >
                  0{i + 1}
                </span>
                <h3 className="mt-5 text-xl text-ink">{step.title}</h3>
                <p className="mt-2.5 text-[0.84rem] leading-relaxed text-muted-foreground">
                  {step.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <p className="mt-6 text-[0.78rem] leading-relaxed text-muted-foreground">
          Tip: measure in the evening, when feet are at their largest — morning measurements run
          small.
        </p>
      </section>

      {/* fit by category */}
      <section className="border-y border-line bg-ink py-16 text-cream sm:py-20" aria-labelledby="fit-heading">
        <div className="shell">
          <p className="eyebrow">Fit advice</p>
          <h2 id="fit-heading" className="mt-4 text-3xl leading-tight sm:text-4xl">
            Each category fits a little differently
          </h2>

          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {FIT_NOTES.map((note, i) => (
              <Reveal as="li" key={note.title} delay={i * 0.08}>
                <div className="flex h-full flex-col border-t-2 border-gold/60 pt-5">
                  <p className="text-[0.6rem] font-semibold tracking-[0.24em] text-gold uppercase">
                    {note.tag}
                  </p>
                  <h3 className="mt-3 text-2xl text-cream">{note.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/60">{note.copy}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-ink-line pt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] text-gold uppercase link-underline"
            >
              Shop all styles
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <span className="text-[0.7rem] tracking-[0.16em] text-cream/40 uppercase">
              UK 5–11 · Free returns within 7 days
            </span>
          </div>
        </div>
      </section>

      <WhatsAppCta
        title="Still unsure about the fit?"
        copy="Send us your foot length in centimetres and the pair you like — we reply with a size, usually in minutes."
      />
    </MotionScope>
  );
}
