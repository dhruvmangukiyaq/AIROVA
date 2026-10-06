import type { Metadata } from "next";
import { FaqAccordion } from "@/components/pages/faq-accordion";
import { FAQ_COUNT } from "@/components/pages/faq-data";
import { PageHero } from "@/components/pages/page-hero";
import { WhatsAppCta } from "@/components/pages/whatsapp-cta";

export const metadata: Metadata = {
  title: "FAQ — Orders, shipping, returns & sizing",
  description:
    "Answers to the 24 questions shoppers ask AIROVA most: Razorpay and COD payments, free shipping over ₹2,999, 3–7 day delivery, the 7-day return window, size exchanges, fit and care.",
  alternates: { canonical: "/faq" },
};

// Static route: no params, typed only so the route helper stays honest.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function FaqPage(_props: PageProps<"/faq">) {
  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        description={`${FAQ_COUNT} straight answers on payments, delivery, returns, sizing and care — searchable, no login required.`}
        breadcrumbs={[{ label: "FAQ", href: "/faq" }]}
      />

      <section className="shell py-16 sm:py-20" aria-label="Frequently asked questions">
        <FaqAccordion />
      </section>

      <WhatsAppCta
        title="Not sure which pair fits?"
        copy="Send us your foot length and the style you like — we will confirm the size, or hold one for you while you decide. WhatsApp 10am–7pm, Mon–Sat."
      />
    </>
  );
}
