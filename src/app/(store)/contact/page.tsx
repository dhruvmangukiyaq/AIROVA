import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Truck,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { ContactForm } from "@/components/pages/contact-form";
import { PageHero } from "@/components/pages/page-hero";
import { MotionScope } from "@/components/pages/motion-scope";
import { Reveal } from "@/components/motion";
import { whatsappLink } from "@/lib/commerce";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Talk to AIROVA FOOTWEAR — WhatsApp, email or call our Mumbai team for order help, size advice, exchanges and returns. Support 10am–7pm, Mon–Sat.",
  alternates: { canonical: "/contact" },
};

const MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent(
  `${SITE.address.line1}, ${SITE.address.line2}`,
)}`;

const QUICK_LINKS = [
  {
    href: "/faq",
    label: "FAQ",
    copy: "24 answers on orders, shipping, sizing and care",
    icon: MessageCircle,
  },
  {
    href: "/shipping-and-returns",
    label: "Shipping & returns",
    copy: "Timelines, charges and the 7-day return window",
    icon: Truck,
  },
  {
    href: "/size-guide",
    label: "Size guide",
    copy: "UK 5–11 chart with a find-my-size tool",
    icon: Ruler,
  },
];

const DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: SITE.phone,
    href: `tel:${SITE.phone.replace(/\s+/g, "")}`,
  },
];

// Static route: no params, typed only so the route helper stays honest.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ContactPage(_props: PageProps<"/contact">) {
  return (
    <MotionScope>
      <PageHero
        eyebrow="We're listening"
        title="Contact AIROVA"
        description="Size doubts, order updates, exchanges or press — a real person on our Mumbai team replies within one business day."
        breadcrumbs={[{ label: "Contact us", href: "/contact" }]}
      />

      <section className="shell grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        {/* details column */}
        <Reveal>
          <div className="border border-line bg-bone p-6 sm:p-8">
            <p className="eyebrow">Reach us</p>
            <h2 className="mt-3 text-2xl text-ink sm:text-3xl">Talk to the studio</h2>

            <dl className="mt-7">
              {DETAILS.map((d) => (
                <div
                  key={d.label}
                  className="flex items-start gap-4 border-t border-line py-4 first:border-t-0 first:pt-0"
                >
                  <d.icon className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-[0.66rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      {d.label}
                    </dt>
                    <dd className="mt-1 break-words text-sm text-ink">
                      <a href={d.href} className="link-underline hover:text-gold-deep">
                        {d.value}
                      </a>
                    </dd>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-4 border-t border-line py-4">
                <Clock className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
                <div>
                  <dt className="text-[0.66rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Support hours
                  </dt>
                  <dd className="mt-1 text-sm text-ink">
                    10am – 7pm, Monday to Saturday
                    <span className="mt-0.5 block text-[0.78rem] text-muted-foreground">
                      Closed on Sundays and public holidays
                    </span>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-line py-4">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
                <div>
                  <dt className="text-[0.66rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Studio
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink">
                    {SITE.address.line1}
                    <br />
                    {SITE.address.line2}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
              <a
                href={whatsappLink("Hi AIROVA! I'd like some help with my order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1f9d55] px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#178346]"
              >
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp us
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-line bg-paper px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-ink uppercase transition-colors hover:border-gold"
              >
                <InstagramIcon className="size-4" />
                Instagram
              </a>
            </div>
          </div>
        </Reveal>

        {/* form column */}
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </section>

      {/* stylised static map — no API key, no iframe */}
      <section className="border-y border-line bg-bone py-16 sm:py-20" aria-labelledby="map-heading">
        <div className="shell grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div
            className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-ink"
            style={{
              backgroundImage:
                "linear-gradient(rgba(200,164,93,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(200,164,93,0.14) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          >
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-gold/25" />
              <MapPin className="size-10 fill-gold text-gold drop-shadow-[0_6px_18px_rgba(200,164,93,0.5)]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-ink-line bg-ink/90 px-4 py-3 backdrop-blur-sm">
              <p className="text-[0.64rem] tracking-[0.2em] text-gold uppercase">
                Andheri East · Mumbai 400069
              </p>
              <p className="text-[0.64rem] tracking-[0.2em] text-cream/50 uppercase">
                Visits by appointment
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">Find the studio</p>
            <h2 id="map-heading" className="mt-3 text-3xl leading-tight text-ink sm:text-4xl">
              Andheri East, Mumbai
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {SITE.address.line1}, {SITE.address.line2} — four minutes from Marol Naka metro
              station. The atelier is visit-by-appointment so we can keep a fit session waiting
              for you.
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border border-line bg-paper px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-ink uppercase transition-colors hover:border-gold hover:text-gold-deep"
            >
              Open in Google Maps
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* quick links */}
      <section className="shell py-16 sm:py-20" aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="sr-only">
          Quick links
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((link, i) => (
            <Reveal as="li" key={link.href} delay={i * 0.08}>
              <Link
                href={link.href}
                className="group flex h-full flex-col justify-between gap-6 border border-line bg-paper p-6 transition-colors hover:border-gold"
              >
                <span className="flex items-start justify-between">
                  <link.icon className="size-5 text-gold-deep" aria-hidden />
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-deep"
                    aria-hidden
                  />
                </span>
                <span>
                  <span className="block font-display text-xl text-ink">{link.label}</span>
                  <span className="mt-1.5 block text-[0.8rem] leading-relaxed text-muted-foreground">
                    {link.copy}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </MotionScope>
  );
}
