import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeIndianRupee, RotateCcw, Truck, type LucideIcon } from "lucide-react";

const VALUES: { icon: LucideIcon; label: string }[] = [
  { icon: Truck, label: "Free shipping over ₹2,999" },
  { icon: RotateCcw, label: "7-day easy returns, no questions" },
  { icon: BadgeIndianRupee, label: "Cash on delivery across India" },
];

/**
 * Shared shell for `/account/login` and `/account/register`: ink-black brand
 * panel on the left (hidden on small screens, where it collapses to a strip),
 * the form in the right column.
 */
export function AuthSplit({ children }: { children: ReactNode }) {
  return (
    <section className="grid border-b border-line lg:min-h-[38rem] lg:grid-cols-2">
      {/* compact brand strip — mobile */}
      <div className="flex items-center justify-between gap-4 bg-ink px-4 py-5 text-cream sm:px-6 lg:hidden">
        <Link href="/" aria-label="AIROVA FOOTWEAR — home">
          <Image
            src="/images/brand/airova-logo-transparent.png"
            alt="AIROVA FOOTWEAR"
            width={160}
            height={48}
            className="h-9 w-auto"
          />
        </Link>
        <p className="text-[0.6rem] font-semibold tracking-[0.28em] text-gold uppercase">
          Step Into Style
        </p>
      </div>

      {/* brand panel — desktop */}
      <div className="relative isolate hidden overflow-hidden bg-ink px-10 py-14 text-cream lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-24 size-[30rem] rounded-full bg-gold/12 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.13)_1px,transparent_0)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />

        <Link href="/" className="relative w-fit" aria-label="AIROVA FOOTWEAR — home">
          <Image
            src="/images/brand/airova-logo-transparent.png"
            alt="AIROVA FOOTWEAR"
            width={220}
            height={64}
            className="h-14 w-auto"
          />
        </Link>

        <div className="relative">
          <p className="eyebrow">Member access</p>
          <p className="mt-5 text-[clamp(2rem,3vw,2.9rem)] leading-[1.05] font-medium font-display">
            Step Into{" "}
            <span className="text-gold-gradient italic">Style.</span>
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/60">
            One account for every pair — order tracking, saved addresses and a wishlist that
            follows you from phone to desktop.
          </p>

          <ul className="mt-8 space-y-3 border-t border-ink-line pt-6">
            {VALUES.map((v) => (
              <li
                key={v.label}
                className="flex items-center gap-3 text-[0.7rem] tracking-[0.12em] text-cream/60 uppercase"
              >
                <v.icon className="size-4 shrink-0 text-gold" aria-hidden />
                {v.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rule-gold" />
      </div>

      {/* form column */}
      <div className="flex items-center justify-center bg-background px-4 py-12 sm:px-8 sm:py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </section>
  );
}
