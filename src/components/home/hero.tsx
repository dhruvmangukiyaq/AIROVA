"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Truck, RotateCcw, BadgeIndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

const TRUST = [
  { icon: Truck, label: "Free shipping over ₹2,999" },
  { icon: BadgeIndianRupee, label: "COD across India" },
  { icon: RotateCcw, label: "7-day easy returns" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      {/* ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 size-[42rem] rounded-full bg-gold/12 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 -left-40 size-[34rem] rounded-full bg-[#2f6fd0]/18 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [background-size:34px_34px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="shell relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="eyebrow"
          >
            Elements Edition · 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
            className="mt-5 text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.98] font-medium tracking-[-0.02em] text-cream"
          >
            Step Into
            <br />
            <span className="text-gold-gradient italic">Style.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
            className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-cream/65 sm:text-base"
          >
            Sports shoes, sneakers and loafers engineered for Indian streets and
            Indian weather. Four elements. One standard of craft.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease: EASE }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button variant="gold" size="xl" asChild>
              <Link href="/shop?gender=men">
                Shop men <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
            <Button variant="outline-light" size="xl" asChild>
              <Link href="/shop?gender=women">
                Shop women <ArrowRight data-icon="inline-end" className="size-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-ink-line pt-6"
          >
            {TRUST.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-[0.7rem] tracking-[0.1em] text-cream/55 uppercase">
                <t.icon className="size-3.5 text-gold" />
                {t.label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* hero product */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="relative aspect-square w-full">
            <div
              aria-hidden
              className="absolute inset-[12%] rounded-full bg-gradient-to-b from-gold/22 to-transparent blur-3xl"
            />
            <Image
              src="/images/products/aqua-water-edition-sports-shoe-1.webp"
              alt="AIROVA Aqua Water Edition blue and white sports shoe"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              loading="eager"
              fetchPriority="high"
              className="relative object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="absolute -bottom-2 left-0 border border-gold/35 bg-ink/85 px-4 py-3 backdrop-blur-sm sm:-left-4"
          >
            <p className="eyebrow">Now live</p>
            <p className="mt-1 font-display text-lg text-cream">Aqua Water Edition</p>
            <p className="text-[0.72rem] text-cream/55">from ₹3,999</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="absolute -top-2 right-0 hidden border border-ink-line bg-ink-soft/80 px-3 py-2 backdrop-blur-sm sm:block"
          >
            <p className="text-[0.6rem] tracking-[0.2em] text-gold uppercase">
              Nature inspires
            </p>
            <p className="text-[0.6rem] tracking-[0.2em] text-cream/50 uppercase">
              You move
            </p>
          </motion.div>
        </motion.div>
      </div>

      <div className="rule-gold" />
    </section>
  );
}
