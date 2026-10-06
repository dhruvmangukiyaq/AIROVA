"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useWishlist } from "@/store/wishlist";

/** Compact wishlist preview for the account overview (localStorage-backed). */
export function WishlistMini({ limit = 4 }: { limit?: number }) {
  const { items, ready } = useWishlist();

  if (!ready) {
    return (
      <div className="divide-y divide-line">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="size-14 shrink-0 shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 shimmer" />
              <div className="h-2.5 w-1/3 shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-start gap-3 px-5 py-8">
        <Heart className="size-5 text-gold" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Nothing saved yet. Tap the heart on any product to keep it here.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.18em] text-ink uppercase hover:text-gold-deep"
        >
          Browse the shop <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.slice(0, limit).map((item) => (
        <li key={item.id}>
          <Link
            href={`/product/${item.slug}`}
            className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-bone/60"
          >
            <span className="img-well size-14 shrink-0 bg-bone">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-1.5"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{item.name}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {item.colorName}
              </span>
            </span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-ink">
              {formatPrice(item.price)}
            </span>
          </Link>
        </li>
      ))}
      {items.length > limit && (
        <li className="px-5 py-3 text-[0.75rem] text-muted-foreground">
          + {items.length - limit} more saved
        </li>
      )}
    </ul>
  );
}
