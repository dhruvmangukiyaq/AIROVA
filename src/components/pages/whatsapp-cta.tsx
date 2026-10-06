import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/commerce";

/**
 * Ink-black support band reused at the foot of the help pages:
 * size doubts go to WhatsApp, everything else to /contact.
 */
export function WhatsAppCta({
  title = "Not sure about your size?",
  copy = "Send us your foot length in centimetres — a real person replies within minutes, 10am–7pm, Mon–Sat.",
}: {
  title?: string;
  copy?: string;
}) {
  return (
    <section aria-label="WhatsApp fit and order help" className="relative bg-ink text-cream">
      <div className="rule-gold" />
      <div className="shell flex flex-col gap-8 py-14 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="eyebrow">Talk to us</p>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/60">{copy}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="gold" size="lg" asChild>
            <a
              href={whatsappLink("Hi AIROVA! I need help with sizing — my foot length is cm.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle data-icon="inline-start" className="size-4" />
              Chat on WhatsApp
            </a>
          </Button>
          <Button variant="outline-light" size="lg" asChild>
            <Link href="/contact">
              Contact us
              <ArrowRight data-icon="inline-end" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
