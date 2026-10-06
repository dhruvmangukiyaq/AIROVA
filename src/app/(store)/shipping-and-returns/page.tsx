import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageCheck, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { PageHero } from "@/components/pages/page-hero";
import { MotionScope } from "@/components/pages/motion-scope";
import { Reveal } from "@/components/motion";
import { WhatsAppCta } from "@/components/pages/whatsapp-cta";
import { STORE } from "@/lib/commerce";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "AIROVA shipping and returns policy — same-day dispatch before 2pm, free standard shipping over ₹2,999, express ₹199, pan-India delivery in 3–7 days, and a 7-day return or size exchange window.",
  alternates: { canonical: "/shipping-and-returns" },
};

const RETURN_STEPS = [
  {
    day: "Day 0",
    title: "Delivered",
    copy: "Your pair arrives. Try it indoors only, on a clean floor — soles must stay spotless.",
  },
  {
    day: "Day 1–7",
    title: "Raise the request",
    copy: "Reply on WhatsApp or use Account → Orders. The request has to be logged inside the 7-day window.",
  },
  {
    day: "Day 8–10",
    title: "Free pickup & check",
    copy: "The courier collects the original box. Our quality team inspects it within 48 hours of arrival.",
  },
  {
    day: "Day 11–14",
    title: "Refund released",
    copy: "Money goes back to the original payment method, or instantly to store credit if you prefer.",
  },
];

// Static route: no params, typed only so the route helper stays honest.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ShippingAndReturnsPage(_props: PageProps<"/shipping-and-returns">) {
  return (
    <MotionScope>
      <PageHero
        eyebrow="Delivery & after-care"
        title="Shipping & returns"
        description="Everything that happens after you tap Buy — dispatch times, charges, tracking, and the 7-day window to send a pair back."
        breadcrumbs={[{ label: "Shipping & returns", href: "/shipping-and-returns" }]}
      />

      <section className="shell grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        {/* ------------------------------ shipping ------------------------------ */}
        <article aria-labelledby="shipping-heading">
          <div className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center border border-gold/40 text-gold-deep">
              <Truck className="size-5" aria-hidden />
            </span>
            <p className="eyebrow">Shipping</p>
          </div>
          <h2 id="shipping-heading" className="mt-4 text-3xl text-ink sm:text-4xl">
            From our shelf to your door
          </h2>

          <h3 className="mt-8 text-lg text-ink">Processing times</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Orders placed before 2pm on a working day are packed and handed to the courier the
            same day. Orders after 2pm, on weekends or on public holidays are dispatched on the
            next working day. You get a tracking link the moment the parcel is picked up.
          </p>

          <h3 className="mt-8 text-lg text-ink">Shipping charges</h3>
          <div className="mt-3 overflow-x-auto border border-line bg-paper">
            <table className="w-full min-w-[26rem] text-sm">
              <caption className="sr-only">
                AIROVA shipping methods, delivery estimates and charges
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-3 text-left text-[0.66rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Method
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-[0.66rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Delivery
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-[0.66rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <th scope="row" className="px-4 py-3.5 text-left font-medium text-ink">
                    Standard
                  </th>
                  <td className="px-4 py-3.5 text-muted-foreground">3–7 working days</td>
                  <td className="px-4 py-3.5 text-right text-ink tabular-nums">
                    {formatPrice(STORE.shippingFee)}
                  </td>
                </tr>
                <tr className="border-b border-line bg-gold/10">
                  <th scope="row" className="px-4 py-3.5 text-left font-medium text-ink">
                    Standard over {formatPrice(STORE.freeShippingThreshold)}
                  </th>
                  <td className="px-4 py-3.5 text-muted-foreground">3–7 working days</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-gold-deep tabular-nums">
                    Free
                  </td>
                </tr>
                <tr className="border-b border-line">
                  <th scope="row" className="px-4 py-3.5 text-left font-medium text-ink">
                    Express
                  </th>
                  <td className="px-4 py-3.5 text-muted-foreground">1–3 working days</td>
                  <td className="px-4 py-3.5 text-right text-ink tabular-nums">
                    {formatPrice(STORE.expressFee)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="px-4 py-3.5 text-left font-medium text-ink">
                    Cash on Delivery
                  </th>
                  <td className="px-4 py-3.5 text-muted-foreground">Same as above</td>
                  <td className="px-4 py-3.5 text-right text-gold-deep tabular-nums">
                    {STORE.codFee === 0 ? "No extra fee" : formatPrice(STORE.codFee)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 text-lg text-ink">Serviceability & pincodes</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We deliver across India — metros, tier-2 and tier-3 towns, north-eastern states, J&K,
            Ladakh and the Andaman & Nicobar Islands. Remote pincodes take 5–9 working days and
            may not support COD. Enter your pincode in the cart to see serviceability, COD
            eligibility and the exact date before you pay.
          </p>

          <h3 className="mt-8 text-lg text-ink">Tracking your order</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tracking is emailed and sent on WhatsApp when the courier scans your parcel, and it
            stays live under{" "}
            <Link href="/account/orders" className="text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">
              Account → Orders
            </Link>{" "}
            until delivery. Prefer to just ask?{" "}
            <Link href="/contact" className="text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">
              Message the studio
            </Link>
            .
          </p>
        </article>

        {/* ------------------------------- returns ------------------------------ */}
        <article aria-labelledby="returns-heading">
          <div className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center border border-gold/40 text-gold-deep">
              <RefreshCcw className="size-5" aria-hidden />
            </span>
            <p className="eyebrow">Returns & exchanges</p>
          </div>
          <h2 id="returns-heading" className="mt-4 text-3xl text-ink sm:text-4xl">
            7 days to change your mind
          </h2>

          <h3 className="mt-8 text-lg text-ink">The window</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            You have <strong className="text-ink">7 days from delivery</strong> to raise a return
            or a size exchange. One exchange per order is free while the replacement size is in
            stock — we hold it for you while your pair travels back.
          </p>

          <h3 className="mt-8 text-lg text-ink">Condition we can accept</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-gold">
            <li>Tried indoors only — soles clean, scuff-free and unworn outside.</li>
            <li>Original box, dust bag, tags and spare laces all included.</li>
            <li>No odour, creasing from outdoor wear, washing or alteration.</li>
            <li>Packed in the outer shipping box, not just the shoe box.</li>
          </ul>

          <h3 className="mt-8 text-lg text-ink">How to raise one</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-gold">
            <li>WhatsApp us or open Account → Orders and tap Return/Exchange.</li>
            <li>Pick a reason and tell us the size you want instead, if exchanging.</li>
            <li>Keep the pair boxed — we schedule a free reverse pickup within 48 hours.</li>
          </ol>

          <h3 className="mt-8 text-lg text-ink">Refund timelines</h3>
          <div className="mt-3 overflow-x-auto border border-line bg-paper">
            <table className="w-full min-w-[24rem] text-sm">
              <caption className="sr-only">
                Refund times by payment method after a quality check
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-3 text-left text-[0.66rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Paid by
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-[0.66rem] tracking-[0.18em] text-muted-foreground uppercase">
                    Refund reaches you
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["UPI", "3–5 working days"],
                  ["Credit / debit card", "5–7 working days"],
                  ["Net banking", "5–7 working days"],
                  ["Cash on Delivery", "Bank transfer / NEFT, 5–7 working days"],
                  ["Store credit", "Instant, if you choose it"],
                ].map(([method, time]) => (
                  <tr key={method} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3.5 text-left font-medium text-ink">
                      {method}
                    </th>
                    <td className="px-4 py-3.5 text-right text-muted-foreground">{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-8 text-lg text-ink">What cannot be returned</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-gold">
            <li>Pairs worn outdoors, washed or altered by you.</li>
            <li>Items marked “Final sale” on the product page, gift cards.</li>
            <li>Socks and insoles, for hygiene reasons.</li>
            <li>Bulk, corporate or international orders.</li>
          </ul>

          <div className="mt-8 flex items-start gap-4 border border-line bg-bone p-5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
            <div>
              <h3 className="text-base text-ink">90-day defect warranty</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Sole separation, stitching failure and hardware defects are covered for 90 days
                from delivery. Send a photo on WhatsApp and we will repair or replace the pair.
                Everyday wear, impact damage and cosmetic ageing are not covered.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* return window timeline */}
      <section className="border-y border-line bg-ink py-16 text-cream sm:py-20" aria-labelledby="return-timeline-heading">
        <div className="shell">
          <div className="max-w-2xl">
            <p className="eyebrow">Return window timeline</p>
            <h2 id="return-timeline-heading" className="mt-4 text-3xl leading-tight sm:text-4xl">
              From your doorstep back to your bank
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/60">
              Four steps, roughly two weeks end to end — usually faster, because refunds are
              initiated the day your pair clears our quality check.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {RETURN_STEPS.map((step, i) => (
              <Reveal as="li" key={step.day} delay={i * 0.08}>
                <div className="relative h-full border-t-2 border-gold/60 pt-5">
                  <span className="text-[0.62rem] font-semibold tracking-[0.24em] text-gold uppercase">
                    {step.day}
                  </span>
                  <h3 className="mt-3 text-2xl text-cream">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/60">{step.copy}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <div className="mt-12 flex items-center gap-3 border-t border-ink-line pt-6 text-[0.7rem] tracking-[0.16em] text-cream/50 uppercase">
            <PackageCheck className="size-4 text-gold" aria-hidden />
            Free reverse pickup in most serviceable pincodes
          </div>
        </div>
      </section>

      {/* cross-links */}
      <section className="shell py-14 sm:py-16" aria-labelledby="policy-links-heading">
        <h2 id="policy-links-heading" className="sr-only">
          Related help pages
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            { href: "/faq", label: "FAQ", copy: "24 quick answers" },
            { href: "/size-guide", label: "Size guide", copy: "UK 5–11 + size finder" },
            { href: "/contact", label: "Contact us", copy: "We reply within a day" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex items-center justify-between gap-4 border border-line bg-paper px-5 py-5 transition-colors hover:border-gold"
              >
                <span>
                  <span className="block font-display text-lg text-ink">{link.label}</span>
                  <span className="mt-0.5 block text-[0.75rem] text-muted-foreground">
                    {link.copy}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold-deep"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <WhatsAppCta
        title="Need to swap a size?"
        copy="Tell us your order number and the size you want — we will confirm stock and book the free pickup for you."
      />
    </MotionScope>
  );
}
