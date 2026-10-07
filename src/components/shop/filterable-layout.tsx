"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { activeFilterCount, type ShopParams } from "@/lib/shop-params";
import { FilterPanel, type FilterOptions } from "@/components/shop/filter-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/**
 * Shop shell: a hidden-by-default filter sidebar revealed by the filter icon,
 * a toolbar row, and the page body.
 *
 * Desktop — the icon toggles the sidebar in place.
 * Mobile  — the icon opens the sidebar in a slide-over sheet.
 */
export function FilterableLayout({
  params,
  options,
  leading,
  trailing,
  children,
}: {
  params: ShopParams;
  options: FilterOptions;
  /** Rendered beside the filter icon in the toolbar (e.g. result count). */
  leading?: React.ReactNode;
  /** Rendered at the far end of the toolbar (e.g. sort control). */
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const filterCount = activeFilterCount(params);
  const expanded = open || sheetOpen;

  const toggleFilters = () => {
    const onDesktop =
      typeof window !== "undefined" && window.matchMedia("(min-width: 64rem)").matches;
    if (onDesktop) setOpen((v) => !v);
    else setSheetOpen(true);
  };

  return (
    <div className={cn("grid gap-10 lg:gap-12", open && "lg:grid-cols-[16.5rem_1fr]")}>
      {/* Sidebar — hidden until the filter icon is pressed */}
      <aside
        id="shop-filters"
        className={cn("hidden lg:block", !open && "lg:hidden")}
      >
        <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1 pb-8">
          <FilterPanel params={params} options={options} />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              aria-expanded={expanded}
              aria-controls="shop-filters"
            >
              <SlidersHorizontal />
              Filters
              {filterCount > 0 && (
                <span className="ml-1 grid size-5 place-items-center bg-gold text-[0.6rem] font-bold text-ink">
                  {filterCount}
                </span>
              )}
            </Button>
            {leading}
          </div>
          {trailing}
        </div>

        {children}
      </div>

      {/* Mobile sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[19rem] overflow-y-auto p-5 sm:max-w-none">
          <SheetHeader>
            <SheetTitle className="text-[0.7rem] tracking-[0.24em] uppercase">
              Refine
            </SheetTitle>
          </SheetHeader>
          <FilterPanel params={params} options={options} className="mt-2" />
        </SheetContent>
      </Sheet>
    </div>
  );
}
