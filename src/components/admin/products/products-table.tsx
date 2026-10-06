"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Package, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import { updateProductStatus } from "@/app/(admin)/actions";
import { thumbImage } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClientPagination,
  FilterBar,
  NoSearchResults,
} from "@/components/admin/data-table-primitives";
import { CONTROL_CLASS } from "@/components/admin/fields";
import { ProductStatusBadge } from "@/components/admin/status-badge";

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  gender: "MEN" | "WOMEN" | "UNISEX";
  categorySlug: string;
  category: string;
  collection: string | null;
  price: number;
  mrp: number;
  badge: string | null;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  image: string | null;
  variantCount: number;
  stock: number;
  reviewCount: number;
  createdAt: string;
}

type SortKey = "newest" | "name" | "price-asc" | "price-desc" | "stock-asc" | "discount";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "stock-asc", label: "Stock: low to high" },
  { value: "discount", label: "Biggest discount" },
];

const PER_PAGE = 10;

const selectClass = `${CONTROL_CLASS} h-9 border px-3 pr-8 text-sm outline-none focus-visible:border-gold/60`;

export function ProductsTable({
  products,
  categories,
  initialQuery,
}: {
  products: ProductRow[];
  categories: { slug: string; name: string }[];
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const [gender, setGender] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [page, setPage] = React.useState(1);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = products.filter((p) => {
      if (gender !== "all" && p.gender !== gender) return false;
      if (category !== "all" && p.categorySlug !== category) return false;
      if (status === "live" && !p.active) return false;
      if (status === "draft" && p.active) return false;
      if (!term) return true;
      return [p.name, p.slug, p.category, p.collection ?? ""].some((v) =>
        v.toLowerCase().includes(term),
      );
    });

    const sorted = [...rows];
    sorted.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-asc":
          return a.stock - b.stock;
        case "discount":
          return discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp);
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return sorted;
  }, [products, query, gender, category, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const clear = () => {
    setQuery("");
    setGender("all");
    setCategory("all");
    setStatus("all");
    setPage(1);
  };

  const toggleStatus = async (row: ProductRow) => {
    setBusyId(row.id);
    const result = await updateProductStatus(row.id, !row.active);
    setBusyId(null);
    if (result.ok) {
      toast.success(result.message ?? "Updated");
      router.refresh();
    } else {
      toast.error(result.error ?? "Could not update the product");
    }
  };

  const hasFilters =
    query.trim() !== "" || gender !== "all" || category !== "all" || status !== "all";

  return (
    <div className="border border-ink-line bg-[#131317]">
      <FilterBar>
        <div className="flex h-9 min-w-52 flex-1 items-center gap-2 border border-white/12 bg-white/[0.03] px-3 focus-within:border-gold/50">
          <Search className="size-3.5 text-cream/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, slug or category…"
            aria-label="Search products"
            className="w-full bg-transparent text-sm text-cream outline-none placeholder:text-cream/35"
          />
        </div>

        <select
          value={gender}
          onChange={(e) => {
            setGender(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by gender"
          className={selectClass}
          style={{ colorScheme: "dark" }}
        >
          <option value="all">All genders</option>
          <option value="MEN">Men</option>
          <option value="WOMEN">Women</option>
          <option value="UNISEX">Unisex</option>
        </select>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
          className={selectClass}
          style={{ colorScheme: "dark" }}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
          className={selectClass}
          style={{ colorScheme: "dark" }}
        >
          <option value="all">Any status</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort products"
          className={selectClass}
          style={{ colorScheme: "dark" }}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </FilterBar>

      {visible.length === 0 ? (
        hasFilters ? (
          <NoSearchResults onClear={clear} />
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Package className="size-6 text-cream/35" aria-hidden />
            <div>
              <p className="text-sm font-medium text-cream">No products yet</p>
              <p className="mt-1 text-xs text-cream/45">
                Add your first product to start building the catalogue.
              </p>
            </div>
            <Button asChild variant="gold" size="xs">
              <Link href="/admin/products/new">Add product</Link>
            </Button>
          </div>
        )
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-ink-line hover:bg-transparent">
                  <TableHead className="min-w-64 text-cream/45">Product</TableHead>
                  <TableHead className="hidden text-cream/45 md:table-cell">Category</TableHead>
                  <TableHead className="hidden text-cream/45 lg:table-cell">Collection</TableHead>
                  <TableHead className="text-right text-cream/45">Price</TableHead>
                  <TableHead className="text-right text-cream/45">Stock</TableHead>
                  <TableHead className="text-cream/45">Status</TableHead>
                  <TableHead className="w-28 text-right text-cream/45">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => {
                  const pct = discountPercent(row.price, row.mrp);
                  return (
                    <TableRow key={row.id} className="border-ink-line hover:bg-white/[0.02]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="relative size-11 shrink-0 overflow-hidden border border-white/10 bg-white/[0.04]">
                            {row.image ? (
                              <Image
                                src={thumbImage(row.image)}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <Package className="absolute inset-0 m-auto size-4 text-cream/30" aria-hidden />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2">
                              <Link
                                href={`/admin/products/${row.id}`}
                                className="truncate text-sm text-cream transition-colors hover:text-gold"
                              >
                                {row.name}
                              </Link>
                              {row.badge ? (
                                <span className="border border-gold/40 px-1.5 py-px text-[0.58rem] tracking-[0.12em] text-gold uppercase">
                                  {row.badge}
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-[0.68rem] text-cream/40">
                              {row.gender.toLowerCase()} · {row.variantCount} variants ·{" "}
                              {row.reviewCount} reviews
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-cream/65 md:table-cell">
                        {row.category}
                      </TableCell>
                      <TableCell className="hidden text-cream/65 lg:table-cell">
                        {row.collection ?? <span className="text-cream/30">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="block text-cream tabular-nums">{formatPrice(row.price)}</span>
                        {pct > 0 ? (
                          <span className="block text-[0.66rem] text-cream/35 line-through tabular-nums">
                            {formatPrice(row.mrp)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            row.stock === 0
                              ? "text-[#e78a82] tabular-nums"
                              : row.stock <= 3
                                ? "text-gold tabular-nums"
                                : "text-cream/70 tabular-nums"
                          }
                        >
                          {row.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ProductStatusBadge active={row.active} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon-xs" className="text-cream/55 hover:text-gold">
                            <Link
                              href={`/product/${row.slug}`}
                              target="_blank"
                              aria-label={`View ${row.name} on the store`}
                            >
                              <Eye className="size-4" aria-hidden />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon-xs" className="text-cream/55 hover:text-gold">
                            <Link href={`/admin/products/${row.id}`} aria-label={`Edit ${row.name}`}>
                              <Pencil className="size-4" aria-hidden />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            disabled={busyId === row.id}
                            onClick={() => toggleStatus(row)}
                            className="text-[0.6rem] text-cream/55 hover:text-gold"
                          >
                            {busyId === row.id
                              ? "…"
                              : row.active
                                ? "Unpublish"
                                : "Publish"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <ClientPagination
            page={safePage}
            totalPages={totalPages}
            total={filtered.length}
            unit="product"
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}
