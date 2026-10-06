"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@/lib/catalog";
import { activeFilterCount, type ShopParams } from "@/lib/shop-params";
import type { ProductDTO } from "@/lib/types";
import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { FilterPanel, type FilterOptions } from "@/components/shop/filter-panel";
import { ActiveChip, useShopNavigation } from "@/components/shop/use-shop-navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const GENDER_LABEL: Record<string, string> = { MEN: "Men", WOMEN: "Women", UNISEX: "Unisex" };
const CATEGORY_LABEL: Record<string, string> = {
  sports: "Sports",
  sneakers: "Sneakers",
  loafers: "Loafers",
};

export function ShopView({
  params,
  options,
  products,
  total,
  totalPages,
  collectionNames,
}: {
  params: ShopParams;
  options: FilterOptions;
  products: ProductDTO[];
  total: number;
  totalPages: number;
  collectionNames: Record<string, string>;
}) {
  const { update, reset } = useShopNavigation(params);
  const [sheetOpen, setSheetOpen] = useState(false);

  const chips = useMemo(() => {
    const items: { key: string; label: string; remove: () => void }[] = [];
    params.gender.forEach((g) =>
      items.push({
        key: `g-${g}`,
        label: GENDER_LABEL[g] ?? g,
        remove: () => update({ gender: params.gender.filter((v) => v !== g) }),
      }),
    );
    params.category.forEach((c) =>
      items.push({
        key: `c-${c}`,
        label: CATEGORY_LABEL[c] ?? c,
        remove: () => update({ category: params.category.filter((v) => v !== c) }),
      }),
    );
    params.collection.forEach((c) =>
      items.push({
        key: `col-${c}`,
        label: collectionNames[c] ?? c,
        remove: () => update({ collection: params.collection.filter((v) => v !== c) }),
      }),
    );
    params.color.forEach((c) =>
      items.push({
        key: `colr-${c}`,
        label: c,
        remove: () => update({ color: params.color.filter((v) => v !== c) }),
      }),
    );
    params.size.forEach((s) =>
      items.push({
        key: `s-${s}`,
        label: `UK ${s}`,
        remove: () => update({ size: params.size.filter((v) => v !== s) }),
      }),
    );
    if (params.minPrice != null || params.maxPrice != null) {
      items.push({
        key: "price",
        label: [
          params.minPrice != null ? `₹${params.minPrice}` : "₹0",
          params.maxPrice != null ? `₹${params.maxPrice}` : "Any",
        ].join(" – "),
        remove: () => update({ minPrice: undefined, maxPrice: undefined }),
      });
    }
    if (params.q) {
      items.push({
        key: "q",
        label: `“${params.q}”`,
        remove: () => update({ q: "" }),
      });
    }
    return items;
  }, [params, update, collectionNames]);

  const filterCount = activeFilterCount(params);

  return (
    <div className="grid gap-10 lg:grid-cols-[16.5rem_1fr] lg:gap-12">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1 pb-8">
          <FilterPanel params={params} options={options} />
        </div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal />
                  Filters
                  {filterCount > 0 && (
                    <span className="ml-1 grid size-5 place-items-center bg-gold text-[0.6rem] font-bold text-ink">
                      {filterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[19rem] overflow-y-auto p-5 sm:max-w-none">
                <SheetHeader>
                  <SheetTitle className="text-[0.7rem] tracking-[0.24em] uppercase">
                    Refine
                  </SheetTitle>
                </SheetHeader>
                <FilterPanel params={params} options={options} className="mt-2" />
              </SheetContent>
            </Sheet>

            <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
              {total} {total === 1 ? "style" : "styles"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="shop-sort" className="sr-only">
              Sort products
            </label>
            <Select
              value={params.sort}
              onValueChange={(value) => update({ sort: value as SortKey })}
            >
              <SelectTrigger id="shop-sort" size="sm" className="w-[13.5rem] border-line">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {chips.map((chip) => (
              <ActiveChip key={chip.key} label={chip.label} onRemove={chip.remove} />
            ))}
            <button
              type="button"
              onClick={reset}
              className="ml-1 text-[0.65rem] tracking-[0.14em] text-gold-deep uppercase underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 border border-dashed border-line px-6 py-20 text-center">
            <p className="text-xl">No styles match those filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try widening the price range or removing a filter — the Elements Edition is a
              tight, curated line-up.
            </p>
            <Button variant="ink" onClick={reset}>
              Reset filters
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-5 gap-y-10 pt-8 sm:gap-x-6 xl:grid-cols-3">
            {products.map((product, i) => (
              <li key={product.id}>
                <ProductCard product={product} index={i} priority={i < 3} />
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label="Shop pages"
            className="mt-14 flex items-center justify-center gap-1.5"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                aria-current={page === params.page ? "page" : undefined}
                onClick={() => update({ page }, { resetPage: false })}
                className={
                  page === params.page
                    ? "grid h-10 min-w-10 place-items-center bg-ink px-3 text-sm font-semibold text-cream tabular-nums"
                    : "grid h-10 min-w-10 place-items-center border border-line bg-paper px-3 text-sm tabular-nums transition-colors hover:border-ink hover:text-ink"
                }
              >
                {page}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

export function ShopGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
