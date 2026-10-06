"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cardImage } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { useWishlist, type WishlistItem } from "@/store/wishlist";
import type { ProductDTO } from "@/lib/types";

const GENDER_LABEL: Record<string, string> = {
  MEN: "Men",
  WOMEN: "Women",
  UNISEX: "Unisex",
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductDTO;
  priority?: boolean;
  /** Stagger index for parent animations; kept for call-site convenience. */
  index?: number;
}) {
  const { has, toggle } = useWishlist();
  const liked = has(product.id);
  const primary = product.images[0];
  const secondary = product.images[1];
  const pct = discountPercent(product.price, product.mrp);

  const onWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: WishlistItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: primary,
      price: product.price,
      mrp: product.mrp,
      colorName: product.colorName,
    };
    const added = toggle(item);
    toast(added ? "Saved to wishlist" : "Removed from wishlist", {
      description: product.name,
    });
  };

  return (
    <article className="group relative">
      <Link
        href={`/product/${product.slug}`}
        className="block"
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
      >
        <div className="img-well bg-bone">
          {product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-ink px-2.5 py-1 text-[0.58rem] font-semibold tracking-[0.16em] text-gold uppercase">
              {product.badge}
            </span>
          )}
          {pct > 0 && !product.badge && (
            <span className="absolute top-3 left-3 z-10 bg-gold px-2.5 py-1 text-[0.58rem] font-semibold tracking-[0.16em] text-ink uppercase">
              {pct}% off
            </span>
          )}

          <Image
            src={cardImage(primary)}
            alt={`${product.name} in ${product.colorName}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="object-contain p-4 transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:opacity-0"
          />

          {secondary && (
            <Image
              src={cardImage(secondary)}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.06] group-hover:opacity-100"
            />
          )}

          {/* gold hairline sweep on hover */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
        </div>

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.62rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                {GENDER_LABEL[product.gender] ?? product.gender} · {product.categorySlug}
              </p>
              <h3 className="mt-1.5 truncate text-[0.92rem] font-medium text-foreground transition-colors group-hover:text-gold-deep">
                {product.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {product.colorName}
              </p>
            </div>

            {product.reviewCount > 0 && (
              <span className="flex shrink-0 items-center gap-1 text-[0.7rem] text-muted-foreground tabular-nums">
                <Star className="size-3 fill-gold text-gold" />
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="text-[0.95rem] font-semibold tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(product.mrp)}
              </span>
            )}
            {pct > 0 && (
              <span className="text-[0.7rem] font-medium text-green-700">
                ({pct}% off)
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={onWish}
        aria-pressed={liked}
        aria-label={liked ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className={cn(
          "absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-paper/85 backdrop-blur-sm transition-all hover:bg-paper",
          liked ? "text-red-500" : "text-ink/55 hover:text-ink",
        )}
      >
        <Heart className={cn("size-4", liked && "fill-current")} />
      </button>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="img-well shimmer" />
      <div className="pt-4 space-y-2">
        <div className="h-2.5 w-1/3 shimmer" />
        <div className="h-3.5 w-3/4 shimmer" />
        <div className="h-3 w-1/4 shimmer" />
      </div>
    </div>
  );
}
