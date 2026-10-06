"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, HeartOff, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getProductsByIds } from "@/actions/catalog";
import { formatPrice } from "@/lib/format";
import type { ProductDTO, VariantDTO } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

/** First variant that can actually be sold, preferring the card's own colour. */
function buyableVariant(product: ProductDTO): VariantDTO | undefined {
  const variants = product.variants ?? [];
  return (
    variants.find((v) => v.color === product.colorName && v.stock > 0) ??
    variants.find((v) => v.stock > 0)
  );
}

/**
 * The saved-items grid. Wishlist ids live in localStorage, so products are
 * hydrated through a server action inside a transition; the ids are then
 * merged into the database row by the silent `<WishlistSync />` in the shell.
 */
export function WishlistView() {
  const { items, ready, remove } = useWishlist();
  const { add } = useCart();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [hydrating, startHydrate] = useTransition();
  const fetchedKey = useRef("");

  const key = items.map((item) => item.id).join(",");

  useEffect(() => {
    if (!ready) return;
    if (!key) {
      // Nothing saved: the empty state below renders and stale products are
      // simply never read again until a new key arrives.
      fetchedKey.current = "";
      return;
    }
    if (fetchedKey.current === key) return;
    fetchedKey.current = key;
    startHydrate(async () => {
      const found = await getProductsByIds(key.split(","));
      setProducts(found);
    });
  }, [key, ready]);

  const byId = new Map(products.map((product) => [product.id, product]));

  const moveToCart = (id: string) => {
    const product = byId.get(id);
    if (!product) return;
    const variant = buyableVariant(product);
    if (!variant) {
      toast.error("That size is out of stock right now.");
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      color: variant.color,
      size: variant.size,
      price: product.price,
      mrp: product.mrp,
      qty: 1,
    });
    remove(id);
    toast.success("Added to your bag", { description: `${product.name} · UK ${variant.size}` });
  };

  if (!ready || (items.length > 0 && hydrating && !products.length)) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border border-line bg-paper">
            <div className="aspect-[4/5] shimmer" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-3/4 shimmer" />
              <div className="h-3 w-1/2 shimmer" />
              <div className="h-9 w-full shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-start gap-4 border border-line bg-paper p-8">
        <HeartOff className="size-6 text-gold" aria-hidden />
        <div>
          <h2 className="text-xl text-ink">Your wishlist is empty</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tap the heart on any pair to keep it here — the list follows you across
            devices once you are signed in.
          </p>
        </div>
        <Button variant="gold" size="sm" asChild>
          <Link href="/shop">
            <ShoppingBag data-icon="inline-start" className="size-3.5" /> Browse the shop
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
          {items.length} saved item{items.length === 1 ? "" : "s"}
        </p>
        <Link
          href="/shop"
          className="link-underline text-[0.7rem] font-semibold tracking-[0.16em] uppercase hover:text-gold-deep"
        >
          Keep shopping
        </Link>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const product = byId.get(item.id);
          const variant = product ? buyableVariant(product) : undefined;
          const soldOut = !product || !variant;

          return (
            <li
              key={item.id}
              className="flex flex-col border border-line bg-paper transition-colors hover:border-gold"
            >
              <Link
                href={`/product/${item.slug}`}
                className="img-well relative aspect-[4/5] bg-bone"
                tabIndex={product ? 0 : -1}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-4"
                />
                {soldOut && (
                  <span className="absolute top-3 left-3 border border-ink bg-ink px-2 py-1 text-[0.58rem] font-semibold tracking-[0.16em] text-cream uppercase">
                    {product ? "Out of stock" : "Unavailable"}
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="link-underline text-sm text-ink"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.colorName}
                    {variant ? ` · UK ${variant.size} in stock` : ""}
                  </p>
                </div>

                <p className="flex items-baseline gap-2">
                  <span className="font-display text-lg tabular-nums text-ink">
                    {formatPrice(item.price)}
                  </span>
                  {item.mrp > item.price && (
                    <span className="text-xs tabular-nums text-muted-foreground line-through">
                      {formatPrice(item.mrp)}
                    </span>
                  )}
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="gold"
                    size="xs"
                    onClick={() => moveToCart(item.id)}
                    disabled={soldOut}
                  >
                    {soldOut ? "Unavailable" : "Move to bag"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                  >
                    <Trash2 data-icon="inline-start" className="size-3" /> Remove
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={cn("mt-6", items.length > 6 && "border-t border-line pt-6")}>
        <Button type="button" variant="gold-outline" size="sm" asChild>
          <Link href="/shop">
            Find your next pair <ArrowRight data-icon="inline-end" className="size-3.5" />
          </Link>
        </Button>
      </div>
    </>
  );
}
