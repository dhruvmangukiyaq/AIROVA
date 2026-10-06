import Link from "next/link";
import { Eye, PackageSearch } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderDate } from "@/lib/format";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, TableEmptyState } from "@/components/admin/data-table-primitives";
import { Money } from "@/components/admin/money";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import {
  OrderStatusBadge,
  PaymentMethodBadge,
  PaymentStatusBadge,
} from "@/components/admin/status-badge";
import { CONTROL_CLASS, SELECT_CLASS, SELECT_STYLE } from "@/components/admin/styles";

export const metadata = { title: "Orders" };

const STATUSES: OrderStatus[] = [
  "PLACED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];
const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "all", label: "All time" },
];
const PER_PAGE = 20;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;

  const q = first(sp.q).trim().slice(0, 80);
  const statusRaw = first(sp.status);
  const status = STATUSES.includes(statusRaw as OrderStatus) ? (statusRaw as OrderStatus) : "";
  const methodRaw = first(sp.method);
  const method: "COD" | "RAZORPAY" | "" =
    methodRaw === "COD" || methodRaw === "RAZORPAY" ? methodRaw : "";
  const range = RANGES.some((r) => r.value === first(sp.range)) ? first(sp.range) : "30";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const placedAfter = new Date();
  placedAfter.setHours(0, 0, 0, 0);
  placedAfter.setDate(placedAfter.getDate() - (Number(range) || 0) + 1);

  const where = {
    ...(status ? { status } : {}),
    ...(method ? { paymentMethod: method } : {}),
    ...(range !== "all" ? { placedAt: { gte: placedAfter } } : {}),
    ...(q
      ? {
          OR: [
            { number: { contains: q } },
            { email: { contains: q } },
            { addrName: { contains: q } },
            { addrPhone: { contains: q } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        number: true,
        placedAt: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        total: true,
        addrName: true,
        email: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const hasFilters = Boolean(q || status || method || range !== "30");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"} match the current view.`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/">View store</Link>
          </Button>
        }
      />

      <Panel>
        <form
          action="/admin/orders"
          method="get"
          className="flex flex-wrap items-end gap-2 border-b border-ink-line px-4 py-3.5"
        >
          <label className="flex min-w-56 flex-1 flex-col gap-1.5">
            <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">
              Search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Order number, email, name or phone"
              className={`${CONTROL_CLASS} h-9 border px-3 text-sm outline-none focus-visible:border-gold/60`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">Status</span>
            <select name="status" defaultValue={status} className={SELECT_CLASS} style={SELECT_STYLE}>
              <option value="">Any status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">
              Payment
            </span>
            <select name="method" defaultValue={method} className={SELECT_CLASS} style={SELECT_STYLE}>
              <option value="">Any method</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="COD">Cash on delivery</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">Period</span>
            <select name="range" defaultValue={range} className={SELECT_CLASS} style={SELECT_STYLE}>
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2 pb-0.5">
            <Button type="submit" variant="gold" size="sm">
              Apply
            </Button>
            {hasFilters ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/orders">Clear</Link>
              </Button>
            ) : null}
          </div>
        </form>

        {orders.length === 0 ? (
          <TableEmptyState
            icon={<PackageSearch className="size-5" aria-hidden />}
            title="No orders in this view"
            description="Try a wider period or clear the search to see everything."
            action={
              hasFilters ? (
                <Button asChild variant="gold-outline" size="xs">
                  <Link href="/admin/orders">Clear filters</Link>
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
                    <TableHead className="text-cream/45">Order</TableHead>
                    <TableHead className="text-cream/45">Customer</TableHead>
                    <TableHead className="text-right text-cream/45">Items</TableHead>
                    <TableHead className="text-right text-cream/45">Total</TableHead>
                    <TableHead className="text-cream/45">Payment</TableHead>
                    <TableHead className="text-cream/45">Status</TableHead>
                    <TableHead className="w-12 text-right text-cream/45">
                      <span className="sr-only">Open</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-ink-line hover:bg-white/[0.02]">
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="block text-cream transition-colors hover:text-gold"
                        >
                          <span className="block text-sm">{order.number}</span>
                          <span className="block text-[0.68rem] text-cream/40">
                            {formatOrderDate(order.placedAt)}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="block max-w-52 truncate text-cream/80">
                          {order.addrName}
                        </span>
                        <span className="block max-w-52 truncate text-[0.68rem] text-cream/40">
                          {order.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-cream/70 tabular-nums">
                        {order._count.items}
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={order.total} className="text-cream" />
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-wrap items-center gap-1.5">
                          <PaymentMethodBadge method={order.paymentMethod} />
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </span>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon-xs" className="text-cream/50 hover:text-gold">
                          <Link href={`/admin/orders/${order.id}`} aria-label={`Open order ${order.number}`}>
                            <Eye className="size-4" aria-hidden />
                          </Link>
                        </Button>
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
              unit="order"
              basePath="/admin/orders"
              query={{ q, status, method, range: range !== "30" ? range : undefined }}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
