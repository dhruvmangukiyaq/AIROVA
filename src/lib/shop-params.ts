import { SORT_OPTIONS, type SortKey } from "@/lib/catalog";
import type { Gender } from "@/lib/types";

/** URL ↔ filter state for `/shop`. The URL is the single source of truth. */
export interface ShopParams {
  gender: Gender[];
  category: string[];
  collection: string[];
  color: string[];
  size: string[];
  minPrice?: number;
  maxPrice?: number;
  q: string;
  sort: SortKey;
  page: number;
}

type Raw = Record<string, string | string[] | undefined>;

function list(raw: Raw, key: string): string[] {
  const value = raw[key];
  if (!value) return [];
  return (Array.isArray(value) ? value : value.split(","))
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

function int(raw: Raw, key: string): number | undefined {
  const value = list(raw, key)[0];
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : undefined;
}

const SORT_KEYS = new Set(SORT_OPTIONS.map((o) => o.value));

export function parseShopParams(raw: Raw): ShopParams {
  const genders = list(raw, "gender")
    .map((g) => g.toUpperCase())
    .filter((g): g is Gender => g === "MEN" || g === "WOMEN" || g === "UNISEX");

  const sortRaw = list(raw, "sort")[0] as SortKey | undefined;

  return {
    gender: [...new Set(genders)],
    category: [...new Set(list(raw, "category"))],
    collection: [...new Set(list(raw, "collection"))],
    color: [...new Set(list(raw, "color"))],
    size: [...new Set(list(raw, "size"))],
    minPrice: int(raw, "minPrice"),
    maxPrice: int(raw, "maxPrice"),
    q: list(raw, "q")[0] ?? "",
    sort: sortRaw && SORT_KEYS.has(sortRaw) ? sortRaw : "newest",
    page: Math.max(1, int(raw, "page") ?? 1),
  };
}

/** Serialises a filter state back to a query string (without `page` resets). */
export function toSearchString(params: Partial<ShopParams>, includePage = true): string {
  const sp = new URLSearchParams();
  const push = (key: string, values: string[]) => {
    if (values.length) sp.set(key, values.join(","));
  };

  push("gender", params.gender ?? []);
  push("category", params.category ?? []);
  push("collection", params.collection ?? []);
  push("color", params.color ?? []);
  push("size", params.size ?? []);

  if (params.minPrice != null) sp.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) sp.set("maxPrice", String(params.maxPrice));
  if (params.q) sp.set("q", params.q);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  if (includePage && params.page && params.page > 1) sp.set("page", String(params.page));

  const value = sp.toString();
  return value ? `?${value}` : "";
}

export function activeFilterCount(params: ShopParams): number {
  return (
    params.gender.length +
    params.category.length +
    params.collection.length +
    params.color.length +
    params.size.length +
    (params.minPrice != null ? 1 : 0) +
    (params.maxPrice != null ? 1 : 0) +
    (params.q ? 1 : 0)
  );
}
