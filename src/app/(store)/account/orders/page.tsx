import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PackageOpen, ShoppingBag } from "lucide-react";
import { requireAccount } from "@/actions/common";
import { db } from "@/lib/db";
import { formatOrderDate, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { AccountHeading } from "@/components/account/account-heading";
import { PaymentBadge, StatusPill } from "@/components/account/status-pill";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My orders",
  description: "Track, review and re-order everything you have bought from AIROVA FOOTWEAR.",
  alternates: { canonical: "/account/orders" },
};

const PER_PAGE = 6;

/** Tab set — "Placed" also folds in PACKED (still with the customer's order). */
const TABS: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "", label: "All" },
  { key: "PLACED", label: "Placed", statuses: ["PLACED", "PACKED"] },
  { key: "SHIPPED", label: "Shipped", statuses: ["SHIPPED"] },
  { key: "DELIVERED", label: "Delivered", statuses: ["DELIVERED"] },
  { key: "CANCELLED", label: "Cancelled", statuses: ["CANCELLED", "RETURNED"] },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireAccount("/account/orders");
  const params = await searchParams;

  const activeKey = TABS.some((t) => t.key === first(params.status)) ? first(params.status) : "";
  const active = TABS.find((t) => t.key === activeKey)!;
  const page = Math.max(1, Number.parseInt(first(params.page), 10) || 1);

  const where = {
    userId: session.id,
    ...(active.statuses ? { status: { in: active.statuses } } : {}),
  };

  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        items: { select: { image: true, name: true }, take: 4 },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], where: { userId: session.id }, _count: { _all: true } }),
  ]);

  const countFor = (statuses?: OrderStatus[]) =>
    counts
      .filter((c) => (statuses ? statuses.includes(c.status as OrderStatus) : true))
      .reduce((sum, c) => sum + c._count._all, 0);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hrefFor = (key: string, target: number) => {
    const query = new URLSearchParams();
    if (key) query.set("status", key);
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return `/account/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <AccountHeading
        eyebrow="Order history"
        title="Your orders"
        description={`${total} order${total === 1 ? "" : "s"} on this account. Track a parcel, view an invoice-style breakdown or buy a pair again.`}
      />

      {/* filter tabs */}
      <nav aria-label="Filter orders" className="hide-scrollbar -mx-1 overflow-x-auto">
        <ul className="flex min-w-max gap-2 px-1 pb-1">
          {TABS.map((tab) => {
            const activeTab = tab.key === activeKey;
            const count = countFor(tab.statuses);
            return (
              <li key={tab.key || "all"}>
                <Link
                  href={hrefFor(tab.key, 1)}
                  aria-current={activeTab ? "page" : undefined}
                  className={
                    activeTab
                      ? "inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2 text-[0.66rem] font-semibold tracking-[0.16em] text-cream uppercase"
                      : "inline-flex items-center gap-2 border border-line bg-paper px-4 py-2 text-[0.66rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:border-gold hover:text-ink"
                  }
                >
                  {tab.label}
                  <span className={activeTab ? "text-gold" : "text-muted-foreground/70"}>
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {orders.length ? (
        <>
          <ol className="mt-8 grid gap-5">
            {orders.map((order) => (
              <li key={order.id} className="border border-line bg-paper">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[0.58rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                      Order number
                    </p>
                    <p className="mt-1 font-display text-lg break-all text-ink">{order.number}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatOrderDate(order.placedAt)} · {order._count.items} item
                      {order._count.items === 1 ? "" : "s"}
                    </p>
                  </div>
                  <StatusPill status={order.status} />
                </header>

                <div className="grid gap-4 px-5 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-6">
                  <ul className="flex gap-2">
                    {order.items.map((item, i) => (
                      <li key={`${item.image}-${i}`} className="img-well size-14 shrink-0 bg-bone">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-contain p-1.5"
                        />
                      </li>
                    ))}
                  </ul>

                  <dl className="flex flex-wrap gap-x-7 gap-y-2">
                    <div>
                      <dt className="text-[0.58rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Total
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-ink tabular-nums">
                        {formatPrice(order.total)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.58rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Payment
                      </dt>
                      <dd className="mt-1 flex items-center gap-2 text-sm text-ink">
                        {order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay"}
                        <PaymentBadge status={order.paymentStatus} />
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="gold-outline" size="sm" asChild>
                      <Link href={`/account/orders/${order.id}#tracking`}>
                        Track <ArrowRight data-icon="inline-end" className="size-3.5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/account/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {totalPages > 1 && (
            <nav
              aria-label="Orders pagination"
              className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6"
            >
              {page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefFor(activeKey, page - 1)} rel="prev">
                    <ArrowLeft data-icon="inline-start" className="size-3.5" /> Previous
                  </Link>
                </Button>
              ) : (
                <span />
              )}
              <p className="text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
                Page {page} of {totalPages}
              </p>
              {page < totalPages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={hrefFor(activeKey, page + 1)} rel="next">
                    Next <ArrowRight data-icon="inline-end" className="size-3.5" />
                  </Link>
                </Button>
              ) : (
                <span />
              )}
            </nav>
          )}
        </>
      ) : (
        <div className="mt-8 flex flex-col items-start gap-4 border border-line bg-paper p-8">
          <PackageOpen className="size-6 text-gold" aria-hidden />
          <div>
            <h2 className="text-xl text-ink">
              {activeKey ? `No ${active.label.toLowerCase()} orders` : "No orders yet"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {activeKey
                ? "Try another filter — or start shopping to place your first order."
                : "When you place your first order it will show up here with live tracking."}
            </p>
          </div>
          <Button variant="gold" size="sm" asChild>
            <Link href="/shop">
              <ShoppingBag data-icon="inline-start" className="size-3.5" /> Shop the collection
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
