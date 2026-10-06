"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cardImage } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { Button } from "@/components/ui/button";

export function WishlistView() {
  const { items, ready, remove, clear } = useWishlist();
  const { add } = useCart();

  if (!ready) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="img-well shimmer" />
            <div className="h-3 w-2/3 shimmer" />
            <div className="h-4 w-1/3 shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 border border-dashed border-line px-6 py-24 text-center">
        <div className="grid size-20 place-items-center border border-line bg-bone">
          <Heart className="size-8 text-gold-deep" />
        </div>
        <div>
          <h2 className="font-display text-2xl">Your wishlist is empty</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Tap the heart on any pair to save it here — perfect for comparing colourways before
            you commit.
          </p>
        </div>
        <Button variant="gold" size="lg" asChild>
          <Link href="/shop">Browse footwear</Link>
        </Button>
      </div>
    );
  }

  const moveToCart = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    add({
      productId: item.id,
      slug: item.slug,
      name: item.name,
      image: item.image,
      color: item.colorName,
      size: "8",
      price: item.price,
      mrp: item.mrp,
      qty: 1,
    });
    remove(item.id);
    toast.success("Moved to your bag", { description: `${item.name} — pick your size in the bag.` });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {items.length} saved {items.length === 1 ? "item" : "items"}
        </p>
        <button
          type="button"
          onClick={() => {
            clear();
            toast.success("Wishlist cleared");
          }}
          className="text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase underline-offset-4 hover:underline hover:text-destructive"
        >
          Clear all
        </button>
      </div>

      <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const pct = discountPercent(item.price, item.mrp);
          return (
            <li key={item.id} className="group">
              <Link href={`/product/${item.slug}`} className="block">
                <div className="img-well bg-bone">
                  <Image
                    src={cardImage(item.image)}
                    alt={`${item.name} in ${item.colorName}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="pt-3">
                  <p className="truncate text-sm font-medium group-hover:text-gold-deep">
                    {item.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.colorName}</p>
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPrice(item.price)}
                    </span>
                    {item.mrp > item.price && (
                      <span className="text-xs text-muted-foreground line-through tabular-nums">
                        {formatPrice(item.mrp)}
                      </span>
                    )}
                    {pct > 0 && <span className="text-[0.68rem] text-green-700">{pct}% off</span>}
                  </div>
                </div>
              </Link>

              <div className="mt-3 flex gap-2">
                <Button variant="ink" size="sm" className="flex-1" onClick={() => moveToCart(item.id)}>
                  <ShoppingBag /> Move to bag
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={`Remove ${item.name} from wishlist`}
                  onClick={() => {
                    remove(item.id);
                    toast("Removed from wishlist", { description: item.name });
                  }}
                  className="px-2.5"
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
