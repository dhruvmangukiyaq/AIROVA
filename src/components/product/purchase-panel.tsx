"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buyOnWhatsApp, checkPincode, isValidPincode } from "@/lib/commerce";
import { discountPercent, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist, type WishlistItem } from "@/store/wishlist";
import type { ProductDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SizeGuideDialog } from "@/components/product/size-guide-dialog";

export function PurchasePanel({
  product,
  relatedColors,
}: {
  product: ProductDTO;
  relatedColors: { slug: string; name: string; colorName: string; image: string }[];
}) {
  const router = useRouter();
  const { add } = useCart();
  const { has, toggle } = useWishlist();

  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pinResult, setPinResult] = useState<ReturnType<typeof checkPincode> | null>(null);

  const sizeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of variants) {
      map.set(v.size, (map.get(v.size) ?? 0) + v.stock);
    }
    return map;
  }, [variants]);

  const sizes = useMemo(
    () => [...sizeMap.keys()].sort((a, b) => Number(a) - Number(b)),
    [sizeMap],
  );

  const stock = size ? (sizeMap.get(size) ?? 0) : 0;
  const lowStock = size != null && stock > 0 && stock <= 3;
  const maxQty = Math.min(10, Math.max(1, stock || 10));
  const pct = discountPercent(product.price, product.mrp);
  const liked = has(product.id);

  const onAdd = () => {
    if (!size) {
      toast.error("Select a size first", { description: "UK 5–11 available." });
      return;
    }
    if (stock <= 0) {
      toast.error("Out of stock", { description: `UK ${size} is currently unavailable.` });
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      color: product.colorName,
      size,
      price: product.price,
      mrp: product.mrp,
      qty,
    });
    toast.success("Added to bag", {
      description: `${product.name} · UK ${size} · ${product.colorName}`,
    });
  };

  const onWish = () => {
    const item: WishlistItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? "",
      price: product.price,
      mrp: product.mrp,
      colorName: product.colorName,
    };
    const added = toggle(item);
    toast(added ? "Saved to wishlist" : "Removed from wishlist", { description: product.name });
  };

  const checkPin = () => {
    if (!isValidPincode(pincode)) {
      setPinResult(null);
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    setPinResult(checkPincode(pincode));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Colour */}
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Colour
          </p>
          <p className="text-sm font-medium">{product.colorName}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {product.colors.map((color) => (
            <span
              key={color.name}
              title={color.name}
              className="grid size-8 place-items-center rounded-full border border-line"
            >
              <span
                className="size-5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="sr-only">{color.name}</span>
            </span>
          ))}

          {relatedColors.length > 0 && (
            <div className="ml-1 flex items-center gap-2 border-l border-line pl-3">
              {relatedColors.map((related) => (
                <Link
                  key={related.slug}
                  href={`/product/${related.slug}`}
                  title={`${related.name} — ${related.colorName}`}
                  className={cn(
                    "relative block size-8 overflow-hidden rounded-full border transition-colors",
                    related.slug === product.slug
                      ? "border-ink ring-1 ring-gold"
                      : "border-line hover:border-ink",
                  )}
                >
                  <Image
                    src={related.image.replace(/\.webp$/, "-thumb.webp")}
                    alt={related.colorName}
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Size */}
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Select size <span className="normal-case tracking-normal">(UK)</span>
          </p>
          <SizeGuideDialog />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7" role="group" aria-label="Size">
          {sizes.map((s) => {
            const available = (sizeMap.get(s) ?? 0) > 0;
            const selected = size === s;
            return (
              <button
                key={s}
                type="button"
                disabled={!available}
                aria-pressed={selected}
                onClick={() => {
                  setSize(s);
                  setQty(1);
                }}
                className={cn(
                  "relative h-11 border text-sm font-medium tabular-nums transition-all",
                  selected && "border-ink bg-ink text-cream",
                  available && !selected && "border-line bg-paper hover:border-ink",
                  !available && "cursor-not-allowed border-line/60 bg-bone text-muted-foreground/50",
                )}
              >
                {s}
                {!available && (
                  <span
                    aria-hidden
                    className="absolute inset-0 grid place-items-center text-[0.7rem] text-muted-foreground/70 line-through"
                  >
                    {s}
                  </span>
                )}
                <span className="sr-only">
                  {available ? `UK ${s}` : `UK ${s} — out of stock`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 min-h-5 text-xs">
          {size == null && (
            <p className="text-muted-foreground">Select a size to see availability.</p>
          )}
          {size != null && stock <= 0 && (
            <p className="font-medium text-destructive">UK {size} is out of stock.</p>
          )}
          {lowStock && (
            <p className="font-medium text-amber-700">
              Only {stock} left in UK {size} — order soon.
            </p>
          )}
          {size != null && stock > 3 && (
            <p className="flex items-center gap-1.5 text-green-700">
              <Check className="size-3.5" /> In stock, ships within 24 hours
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Quantity + CTAs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Quantity
          </p>
          <div className="flex items-center border border-line">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid h-10 w-10 place-items-center text-ink/70 transition-colors hover:bg-bone disabled:opacity-30"
              disabled={qty <= 1}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="grid h-10 w-10 place-items-center text-ink/70 transition-colors hover:bg-bone disabled:opacity-30"
              disabled={qty >= maxQty}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="gold" size="xl" className="flex-1" onClick={onAdd}>
            <ShoppingBag />
            Add to bag
          </Button>
          <Button
            variant="outline"
            size="xl"
            aria-pressed={liked}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            onClick={onWish}
            className={cn("w-14 px-0", liked && "border-red-300 text-red-500")}
          >
            <Heart className={cn(liked && "fill-current")} />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/checkout")}
            className="w-full"
          >
            Buy it now
          </Button>
          <Button variant="whatsapp" size="lg" className="w-full" asChild>
            <a
              href={buyOnWhatsApp({
                product: product.name,
                size: size ?? undefined,
                color: product.colorName,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy on WhatsApp
            </a>
          </Button>
        </div>
      </div>

      {/* Pincode */}
      <div className="border border-line bg-bone/60 p-4">
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Check delivery
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && checkPin()}
            className="h-10 rounded-none bg-paper tabular-nums"
            aria-label="Delivery pincode"
          />
          <Button variant="ink" onClick={checkPin} className="h-10">
            Check
          </Button>
        </div>

        {pinResult && (
          <div className="mt-3 text-xs">
            {pinResult.serviceable ? (
              <>
                <p className="flex items-center gap-1.5 font-medium text-green-700">
                  <Check className="size-3.5" /> Delivers to {pincode}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Standard {pinResult.standardDays[0]}–{pinResult.standardDays[1]} days ·
                  Express {pinResult.expressDays[0]}–{pinResult.expressDays[1]} days
                  {pinResult.cod ? " · COD available" : " · COD unavailable"}
                </p>
              </>
            ) : (
              <p className="font-medium text-destructive">
                We don&apos;t deliver to this pincode yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Trust strip */}
      <ul className="grid gap-3 border-t border-line pt-5 text-xs text-muted-foreground sm:grid-cols-2">
        <li className="flex items-start gap-2.5">
          <Truck className="mt-0.5 size-4 shrink-0 text-gold-deep" />
          Free shipping over ₹2,999 · dispatched in 24h
        </li>
        <li className="flex items-start gap-2.5">
          <RotateCcw className="mt-0.5 size-4 shrink-0 text-gold-deep" />
          7-day returns & free size exchanges
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-deep" />
          6-month manufacturing warranty
        </li>
        <li className="flex items-start gap-2.5">
          <Check className="mt-0.5 size-4 shrink-0 text-gold-deep" />
          100% authentic, ships from Mumbai
        </li>
      </ul>

      {pct > 0 && (
        <p className="text-xs text-muted-foreground">
          You save {formatPrice(product.mrp - product.price)} ({pct}% off) on this pair.
        </p>
      )}
    </div>
  );
}
