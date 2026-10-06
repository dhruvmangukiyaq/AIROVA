"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import type { ProductDTO } from "@/lib/types";
import { cardImage } from "@/lib/catalog";

/**
 * Search overlay with type-ahead suggestions. Fetches on a 250 ms debounce
 * and falls back to the full listing page for anything else.
 */
export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    // Short queries are cleared by the input handler, so nothing to fetch here.
    if (query.trim().length < 2) return;
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("bad status");
        setResults((await res.json()) as ProductDTO[]);
      } catch {
        setError(true);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  const submit = (value?: string) => {
    const q = (value ?? query).trim();
    if (!q) return;
    onOpenChange(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  const popular = useMemo(
    () => [
      { label: "Sports shoes", href: "/shop?category=sports" },
      { label: "Sneakers", href: "/shop?category=sneakers" },
      { label: "Loafers", href: "/shop?category=loafers" },
      { label: "Aqua collection", href: "/shop?collection=aqua" },
      { label: "Under ₹2,499", href: "/shop?maxPrice=2499" },
    ],
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[8%] max-w-2xl translate-y-0 gap-0 border-line bg-paper p-0">
        <DialogTitle className="sr-only">Search AIROVA Footwear</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-3 border-b border-line px-5"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4 shrink-0 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              const trimmed = value.trim();
              setQuery(value);
              setError(false);
              // All state transitions happen in the event handler so the
              // effect below only has to schedule the network request.
              if (trimmed.length < 2) {
                setResults(null);
                setLoading(false);
              } else {
                setLoading(true);
              }
            }}
            placeholder="Search for shoes, colours, collections…"
            aria-label="Search products"
            className="h-14 w-full bg-transparent text-sm tracking-wide outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 border border-line px-1.5 py-0.5 text-[0.6rem] text-muted-foreground sm:block">
            ESC
          </kbd>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-14 shrink-0 bg-bone" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3 bg-bone" />
                    <Skeleton className="h-3 w-1/4 bg-bone" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Something went wrong. Please try again.
            </p>
          )}

          {!loading && !error && results && results.length > 0 && (
            <ul className="divide-y divide-line">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-4 py-3 transition-opacity hover:opacity-70"
                  >
                    <div className="img-well size-16 shrink-0 bg-bone">
                      <Image
                        src={cardImage(p.images[0])}
                        alt={p.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.categorySlug} · {p.colorName}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPrice(p.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && !error && results && results.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No matches for “{query}”. Try “sneakers”, “navy” or “aqua”.
            </p>
          )}

          {!results && (
            <div>
              <p className="eyebrow mb-3">Popular right now</p>
              <div className="flex flex-wrap gap-2">
                {popular.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className="border border-line px-3 py-1.5 text-xs tracking-wide transition-colors hover:border-gold hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
