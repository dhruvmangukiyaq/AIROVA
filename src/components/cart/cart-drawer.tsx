"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, lineKey } from "@/store/cart";
import { PriceSummary } from "@/components/cart/price-summary";
import { CouponField } from "@/components/cart/coupon-field";
import { formatPrice } from "@/lib/format";
import { cardImage } from "@/lib/catalog";

export function CartDrawer() {
  const { lines, summary, drawerOpen, setDrawerOpen, setQty, remove, coupon, applyCoupon } =
    useCart();

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 border-line bg-paper p-0 text-foreground"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-line px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-sm tracking-[0.2em] uppercase">
            <ShoppingBag className="size-4 text-gold" />
            Your bag {lines.length > 0 && <span className="text-muted-foreground">({summary.subtotal > 0 ? lines.length : 0})</span>}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="flex size-20 items-center justify-center border border-line bg-bone">
              <ShoppingBag className="size-8 text-gold-deep" />
            </div>
            <div>
              <h3 className="font-display text-xl">Your bag is empty</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore the Elements Edition — Aqua, Flare, Aero and Cinder.
              </p>
            </div>
            <Button variant="gold" size="lg" asChild onClick={() => setDrawerOpen(false)}>
              <Link href="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-line">
                {lines.map((line) => {
                  const key = lineKey(line);
                  return (
                    <li key={key} className="flex gap-4 py-4">
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="img-well size-20 shrink-0 bg-bone"
                      >
                        <Image
                          src={cardImage(line.image)}
                          alt={line.name}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${line.slug}`}
                            onClick={() => setDrawerOpen(false)}
                            className="line-clamp-2 text-[0.82rem] font-medium hover:text-gold-deep"
                          >
                            {line.name}
                          </Link>
                          <button
                            type="button"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => remove(key)}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[0.7rem] tracking-wide text-muted-foreground uppercase">
                          {line.color} · UK {line.size}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-line">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => setQty(key, line.qty - 1)}
                              className="grid size-7 place-items-center text-muted-foreground hover:bg-bone"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-7 text-center text-xs tabular-nums">
                              {line.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              disabled={line.qty >= 10}
                              onClick={() => setQty(key, line.qty + 1)}
                              className="grid size-7 place-items-center text-muted-foreground hover:bg-bone disabled:opacity-30"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold tabular-nums">
                              {formatPrice(line.price * line.qty)}
                            </p>
                            {line.mrp > line.price && (
                              <p className="text-[0.68rem] text-muted-foreground line-through tabular-nums">
                                {formatPrice(line.mrp * line.qty)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-3 border-t border-line px-5 py-4">
              <CouponField />
              <PriceSummary summary={summary} showFreeShippingBar={false} couponCode={coupon?.code} onRemoveCoupon={() => applyCoupon(null)} />

              <div className="grid gap-2">
                <Button variant="gold" size="lg" className="w-full" asChild>
                  <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
                    Checkout · {formatPrice(summary.total)}
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/cart" onClick={() => setDrawerOpen(false)}>
                    View bag
                  </Link>
                </Button>
              </div>

              <p className="text-center text-[0.65rem] text-muted-foreground">
                7-day returns · COD available · Secure payments
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Small floating trigger for pages that want an inline "bag" button. */
export function CartCountBadge() {
  const { count } = useCart();
  return <span className="tabular-nums">{count}</span>;
}

export { Trash2 };
