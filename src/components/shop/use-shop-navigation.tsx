"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toSearchString, type ShopParams } from "@/lib/shop-params";

/** Keeps every filter interaction in the URL so results are shareable + cached. */
export function useShopNavigation(params: ShopParams) {
  const router = useRouter();
  const pathname = usePathname();

  const update = useCallback(
    (patch: Partial<ShopParams>, options: { resetPage?: boolean } = {}) => {
      const next: ShopParams = {
        ...params,
        ...patch,
        page: options.resetPage === false ? (patch.page ?? params.page) : (patch.page ?? 1),
      };
      router.push(`${pathname}${toSearchString(next)}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const reset = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return { update, reset };
}

export function ActiveChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group inline-flex items-center gap-1.5 border border-line bg-paper px-2.5 py-1.5 text-[0.68rem] font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:border-ink hover:bg-ink hover:text-cream"
    >
      {label}
      <X className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
      <span className="sr-only">Remove filter</span>
    </button>
  );
}
