"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { cardImage } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { lineKey, useCart } from "@/store/cart";
import { PriceSummary } from "@/components/cart/price-summary";
import { CouponField } from "@/components/cart/coupon-field";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import type { ProductDTO } from "@/lib/types";

export function CartPage({ suggestions }: { suggestions: ProductDTO[] }) {
  const { lines, summary, setQty, remove, coupon, applyCoupon, ready } = useCart();

  if (!ready) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="flex gap-4 border border-line p-4">
              <div className="size-28 shrink-0 shimmer" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-3 w-1/3 shimmer" />
                <div className="h-4 w-2/3 shimmer" />
                <div className="h-3 w-1/4 shimmer" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-72 shimmer" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 border border-dashed border-line px-6 py-24 text-center">
        <div className="grid size-20 place-items-center border border-line bg-bone">
          <ShoppingBag className="size-8 text-gold-deep" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Your bag is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Nothing here yet. Start with the Elements Edition — Aqua, Flare, Aero and Cinder.
          </p>
        </div>
        <Button variant="gold" size="lg" asChild>
          <Link href="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      {/* Line items */}
      <div>
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => {
            const key = lineKey(line);
            const pct = discountPercent(line.price, line.mrp);
            return (
              <li key={key} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  href={`/product/${line.slug}`}
                  className="img-well size-28 shrink-0 bg-bone sm:size-32"
                >
                  <Image
                    src={cardImage(line.image)}
                    alt={`${line.name} in ${line.color}`}
                    fill
                    sizes="128px"
                    className="object-contain p-2"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.slug}`}
                        className="link-underline block truncate text-[0.95rem] font-medium hover:text-gold-deep"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.color} · UK {line.size}
                      </p>
                      <p className="mt-2 text-sm font-semibold tabular-nums sm:hidden">
                        {formatPrice(line.price)}
                        {pct > 0 && (
                          <span className="ml-2 text-xs font-normal text-green-700">
                            {pct}% off
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold tabular-nums">{formatPrice(line.price)}</p>
                      {line.mrp > line.price && (
                        <p className="text-xs text-muted-foreground line-through tabular-nums">
                          {formatPrice(line.mrp)}
                        </p>
                      )}
                      {pct > 0 && (
                        <p className="text-[0.68rem] text-green-700">{pct}% off</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.name}`}
                        onClick={() => setQty(key, line.qty - 1)}
                        className="grid h-9 w-9 place-items-center transition-colors hover:bg-bone disabled:opacity-30"
                        disabled={line.qty <= 1}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold tabular-nums">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.name}`}
                        onClick={() => setQty(key, line.qty + 1)}
                        className="grid h-9 w-9 place-items-center transition-colors hover:bg-bone disabled:opacity-30"
                        disabled={line.qty >= 10}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(key)}
                      className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              ← Continue shopping
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            {summary.subtotal} item{summary.subtotal === 1 ? "" : "s"} · {formatPrice(summary.subtotal)}
          </p>
        </div>

        <div className="mt-8">
          <CouponField />
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <PriceSummary
          summary={summary}
          couponCode={coupon?.code}
          onRemoveCoupon={() => applyCoupon(null)}
        />

        <Button variant="gold" size="xl" className="mt-4 w-full" asChild>
          <Link href="/checkout">
            Proceed to checkout
            <ArrowRight />
          </Link>
        </Button>

        <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-muted-foreground">
          Secure checkout · UPI, cards, net banking & COD · 7-day returns
        </p>

        <ul className="mt-6 space-y-2 border-t border-line pt-4 text-xs text-muted-foreground">
          <li>Free shipping over ₹2,999</li>
          <li>Dispatched within 24 hours</li>
          <li>Free size exchange on your first order</li>
        </ul>
      </aside>

      {suggestions.length > 0 && (
        <section aria-labelledby="suggestions-heading" className="border-t border-line pt-12 lg:col-span-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Complete the pair</p>
              <h2 id="suggestions-heading" className="mt-2 text-2xl">
                You might also like
              </h2>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/shop">Shop all</Link>
            </Button>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
            {suggestions.map((product, i) => (
              <li key={product.id}>
                <ProductCard product={product} index={i} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
