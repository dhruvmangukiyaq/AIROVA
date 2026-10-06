import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { FOOTER_LINKS, SITE } from "@/lib/site";
import { STORE } from "@/lib/commerce";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-cream">
      {/* newsletter band */}
      <div className="border-b border-ink-line">
        <div className="shell grid gap-8 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Join the movement</p>
            <h2 className="mt-3 text-3xl leading-tight text-cream sm:text-4xl">
              Get ₹200 off your first pair.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/60">
              Early access to drops, restock alerts and members-only prices. One
              email a week, no noise.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4">
            <Image
              src="/images/brand/airova-logo-transparent.png"
              alt="AIROVA FOOTWEAR — Step Into Style"
              width={140}
              height={108}
              className="h-24 w-auto"
            />
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
            Premium footwear engineered for Indian streets, weather and
            proportions. Designed in Mumbai, shipped everywhere.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${STORE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-gold/40 px-3 py-2 text-[0.66rem] tracking-[0.16em] text-gold uppercase transition-colors hover:bg-gold hover:text-ink"
            >
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-gold/40 px-3 py-2 text-[0.66rem] tracking-[0.16em] text-gold uppercase transition-colors hover:bg-gold hover:text-ink"
            >
              <InstagramIcon className="size-3.5" /> Instagram
            </a>
          </div>
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="eyebrow mb-4">{group.title}</h3>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/60 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h3 className="eyebrow mb-4">Reach us</h3>
          <ul className="space-y-3 text-sm text-cream/60">
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold/70" />
              <a href={`mailto:${SITE.email}`} className="hover:text-gold">
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold/70" />
              <a href="tel:+919999999999" className="hover:text-gold">
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold/70" />
              <span>
                {SITE.address.line1}
                <br />
                {SITE.address.line2}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* payment strip */}
      <div className="border-t border-ink-line">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-5">
          <p className="text-[0.66rem] tracking-[0.14em] text-cream/45 uppercase">
            UPI · Visa · Mastercard · RuPay · Net banking · COD
          </p>
          <p className="text-[0.66rem] tracking-[0.14em] text-cream/45 uppercase">
            GSTIN {SITE.gstin}
          </p>
        </div>
      </div>

      <div className="border-t border-ink-line">
        <div className="shell flex flex-col gap-3 py-6 text-[0.7rem] text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.legalName}. All rights reserved.
          </p>
          <p className="tracking-[0.2em] uppercase">{SITE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
