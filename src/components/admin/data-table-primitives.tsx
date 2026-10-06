"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Inbox, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { MicroLabel } from "@/components/admin/panel";

/** Horizontal strip holding search + filter controls above a table. */
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-ink-line bg-[#131317] px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TableEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center border border-ink-line bg-white/[0.03] text-cream/40">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </span>
      <div>
        <p className="text-sm font-medium text-cream">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-cream/45">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function NoSearchResults({ onClear }: { onClear?: () => void }) {
  return (
    <TableEmptyState
      icon={<SearchX className="size-5" aria-hidden />}
      title="No matches"
      description="Nothing fits the current search and filters. Clear them to see everything."
      action={
        onClear ? (
          <Button type="button" variant="gold-outline" size="xs" onClick={onClear}>
            Clear filters
          </Button>
        ) : undefined
      }
    />
  );
}

/** URL-driven pagination — used where rows are fetched server-side.
 *
 * Accepts `basePath` + a query object rather than a callback so the whole
 * prop tree stays serialisable (server → client boundary).
 */
export function Pagination({
  page,
  totalPages,
  total,
  unit,
  basePath,
  query,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  unit: string;
  basePath: string;
  query?: Record<string, string | undefined>;
  className?: string;
}) {
  const hrefFor = (rawTarget: number) => {
    const target = Math.min(Math.max(rawTarget, 1), Math.max(totalPages, 1));
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value) params.set(key, value);
    }
    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-ink-line px-4 py-3",
        className,
      )}
    >
      <MicroLabel>
        {total} {unit}
        {total === 1 ? "" : "s"} · page {page} of {totalPages}
      </MicroLabel>
      <div className="flex items-center gap-1.5">
        <Button
          asChild
          size="xs"
          variant="outline"
          className={cn(
            page <= 1 && "pointer-events-none opacity-40",
            page <= 1 && "aria-disabled:pointer-events-none",
          )}
        >
          <Link
            href={hrefFor(page - 1)}
            aria-label="Previous page"
            rel="prev"
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
          >
            <ChevronLeft className="size-3.5" aria-hidden /> Prev
          </Link>
        </Button>
        <Button
          asChild
          size="xs"
          variant="outline"
          className={cn(page >= totalPages && "pointer-events-none opacity-40")}
        >
          <Link
            href={hrefFor(page + 1)}
            aria-label="Next page"
            rel="next"
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
          >
            Next <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/** Callback-driven pagination for tables filtered entirely on the client. */
export function ClientPagination({
  page,
  totalPages,
  total,
  unit,
  onPage,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  unit: string;
  onPage: (page: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-ink-line px-4 py-3",
        className,
      )}
    >
      <MicroLabel>
        {total} {unit}
        {total === 1 ? "" : "s"} · page {page} of {totalPages}
      </MicroLabel>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="size-3.5" aria-hidden /> Prev
        </Button>
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next <ChevronRight className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
