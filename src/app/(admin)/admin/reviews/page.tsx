import Link from "next/link";
import { MessageSquareWarning, Star } from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderDate } from "@/lib/format";
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
  Pagination,
  TableEmptyState,
} from "@/components/admin/data-table-primitives";
import { PageHeader } from "@/components/admin/page-header";
import { MicroLabel, Panel, PanelHeader } from "@/components/admin/panel";
import { RatingStars } from "@/components/admin/status-badge";
import { CONTROL_CLASS } from "@/components/admin/styles";
import { ReviewActions } from "./review-actions";

export const metadata = { title: "Reviews" };

const STATUSES = ["published", "pending", "rejected"] as const;
type StatusFilter = (typeof STATUSES)[number] | "";

const STATUS_TAB: Record<StatusFilter, string> = {
  "": "All reviews",
  published: "Published",
  pending: "Pending",
  rejected: "Rejected",
};

const PILL: Record<string, string> = {
  published:
    "border-[#6d8b62]/55 bg-[#6d8b62]/12 text-[#a9c9a0]",
  pending: "border-gold/45 bg-gold/10 text-gold",
  rejected: "border-destructive/50 bg-destructive/12 text-[#e78a82]",
};

const PER_PAGE = 20;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminReviewsPage({
  searchParams,
}: PageProps<"/admin/reviews">) {
  await requireAdmin();
  const sp = await searchParams;

  const q = first(sp.q).trim().slice(0, 80);
  const raw = first(sp.status);
  const status: StatusFilter = (STATUSES as readonly string[]).includes(raw)
    ? (raw as StatusFilter)
    : "";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { title: { contains: q } },
            { body: { contains: q } },
          ],
        }
      : {}),
  };

  const [reviews, total, statusGroups, ratingGroups] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        rating: true,
        title: true,
        body: true,
        verified: true,
        status: true,
        createdAt: true,
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.review.count({ where }),
    db.review.groupBy({ by: ["status"], _count: { _all: true } }),
    db.review.groupBy({
      by: ["rating"],
      where: { status: "published" },
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(statusGroups.map((g) => [g.status, g._count._all]));
  const totalAll = statusGroups.reduce((sum, g) => sum + g._count._all, 0);
  const ratingCounts = new Map(ratingGroups.map((g) => [g.rating, g._count._all]));
  const publishedTotal = ratingGroups.reduce((sum, g) => sum + g._count._all, 0);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hasFilters = Boolean(q || status);

  const hrefFor = (target: number, next: StatusFilter = status) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (next) params.set("status", next);
    params.set("page", String(target));
    return `/admin/reviews?${params.toString()}`;
  };

  const tabClass = (active: boolean) =>
    `inline-flex h-7 items-center gap-1.5 border px-2.5 text-[0.64rem] font-semibold tracking-[0.14em] uppercase transition-colors ${
      active
        ? "border-gold/55 bg-gold/10 text-gold"
        : "border-white/12 bg-white/[0.03] text-cream/55 hover:border-gold/40 hover:text-cream"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Merchandising"
        title="Reviews"
        description="Moderate what shoppers see. Approved reviews show on product pages immediately."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Moderation queue"
            hint="Approve, reject or hold any submission"
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                {(["", ...STATUSES] as StatusFilter[]).map((s) => (
                  <Link
                    key={s || "all"}
                    href={hrefFor(1, s)}
                    className={tabClass(status === s)}
                    aria-current={status === s ? "page" : undefined}
                  >
                    {STATUS_TAB[s]}
                    <span className="tabular-nums text-[0.58rem] opacity-70">
                      {s === "" ? totalAll : (counts.get(s) ?? 0)}
                    </span>
                  </Link>
                ))}
              </div>
            }
          />

          <form
            action="/admin/reviews"
            method="get"
            className="flex flex-wrap items-end gap-2 border-b border-ink-line px-4 py-3.5"
          >
            <input type="hidden" name="status" value={status} />
            <label className="flex min-w-56 flex-1 flex-col gap-1.5">
              <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">
                Search
              </span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Reviewer, title or comment"
                className={`${CONTROL_CLASS} h-9 border px-3 text-sm outline-none focus-visible:border-gold/60`}
              />
            </label>
            <div className="flex items-center gap-2 pb-0.5">
              <Button type="submit" variant="gold" size="sm">
                Apply
              </Button>
              {hasFilters ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/reviews">Clear</Link>
                </Button>
              ) : null}
            </div>
          </form>

          {reviews.length === 0 ? (
            <TableEmptyState
              icon={<MessageSquareWarning className="size-5" aria-hidden />}
              title="No reviews here"
              description={
                status === "pending"
                  ? "The moderation queue is empty — every submission has been handled."
                  : "Nothing matches this view. Clear the filters to see every review."
              }
              action={
                hasFilters ? (
                  <Button asChild variant="gold-outline" size="xs">
                    <Link href="/admin/reviews">Clear filters</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-ink-line hover:bg-transparent">
                      <TableHead className="text-cream/45">Review</TableHead>
                      <TableHead className="hidden text-cream/45 lg:table-cell">
                        Product
                      </TableHead>
                      <TableHead className="hidden text-cream/45 sm:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="text-right text-cream/45">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow
                        key={review.id}
                        className="border-ink-line hover:bg-white/[0.02]"
                      >
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <RatingStars rating={review.rating} />
                            <span className="text-sm text-cream">{review.title}</span>
                            {review.verified ? (
                              <span className="inline-flex h-4.5 items-center border border-[#6d8b62]/55 bg-[#6d8b62]/12 px-1.5 text-[0.55rem] font-semibold tracking-[0.12em] text-[#a9c9a0] uppercase">
                                Verified
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 line-clamp-2 max-w-2xl text-xs text-cream/50">
                            {review.body}
                          </p>
                          <p className="mt-1 text-[0.66rem] text-cream/35">
                            {review.name} · {formatOrderDate(review.createdAt)}
                          </p>
                          <span className="mt-1.5 inline-flex h-5 items-center border border-white/15 bg-white/5 px-1.5 text-[0.58rem] font-semibold tracking-[0.14em] text-cream/55 uppercase sm:hidden">
                            {review.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Link
                            href={`/admin/products/${review.product.id}`}
                            className="block max-w-44 truncate text-cream/75 transition-colors hover:text-gold"
                          >
                            {review.product.name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`inline-flex h-5.5 items-center border px-2 text-[0.62rem] font-semibold tracking-[0.14em] uppercase ${PILL[review.status] ?? PILL.published}`}
                          >
                            {review.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <ReviewActions
                            reviewId={review.id}
                            status={review.status}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                unit="review"
                basePath="/admin/reviews"
                query={{ q, status }}
              />
            </>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader
              title="Rating spread"
              hint="Published reviews only"
              action={
                <span className="flex items-center gap-1 text-gold">
                  <Star className="size-3.5 fill-gold" aria-hidden />
                  <MicroLabel className="text-cream">
                    {publishedTotal} total
                  </MicroLabel>
                </span>
              }
            />
            <div className="flex flex-col gap-3 px-5 py-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts.get(star) ?? 0;
                const pct = publishedTotal
                  ? Math.round((count / publishedTotal) * 100)
                  : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="flex w-10 shrink-0 items-center gap-1 text-xs text-cream/60 tabular-nums">
                      {star}
                      <Star className="size-3 fill-gold text-gold" aria-hidden />
                    </span>
                    <span className="h-2 flex-1 bg-white/[0.06]">
                      <span
                        className="block h-2 bg-gold/80"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="w-14 shrink-0 text-right text-xs text-cream/50 tabular-nums">
                      {count} · {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="How it works" />
            <ul className="flex flex-col gap-2.5 px-5 py-4 text-xs leading-relaxed text-cream/55">
              <li>
                <span className="text-cream/80">Approve</span> publishes the
                review on the product page and refreshes its rating average.
              </li>
              <li>
                <span className="text-cream/80">Reject</span> hides it from the
                storefront without deleting the submission.
              </li>
              <li>
                <span className="text-cream/80">Hold</span> returns a review to
                the pending queue for a second look.
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
