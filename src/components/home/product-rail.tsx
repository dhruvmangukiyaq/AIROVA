"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ProductDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Horizontally scrolling product rail with chevron controls (touch friendly). */
export function ProductRail({
  eyebrow,
  title,
  description,
  href,
  products,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  products: ProductDTO[];
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="shell">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            align="left"
            tone={tone}
            eyebrow={eyebrow}
            title={title}
            description={description}
            href={href}
            linkLabel="View all"
          />
          <div className="mb-12 hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className={cn(
                "grid size-10 place-items-center border transition-colors",
                tone === "dark"
                  ? "border-ink-line text-cream hover:border-gold hover:text-gold"
                  : "border-line text-ink hover:border-gold hover:text-gold-deep",
              )}
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className={cn(
                "grid size-10 place-items-center border transition-colors",
                tone === "dark"
                  ? "border-ink-line text-cream hover:border-gold hover:text-gold"
                  : "border-line text-ink hover:border-gold hover:text-gold-deep",
              )}
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              className="w-[68vw] shrink-0 snap-start sm:w-[42vw] lg:w-[24%]"
            >
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
