import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Receipt,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderDate, formatPrice } from "@/lib/format";
import { type OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Money } from "@/components/admin/money";
import { PageHeader } from "@/components/admin/page-header";
import { Panel, PanelHeader, MicroLabel } from "@/components/admin/panel";
import { SalesChart, type SalesPoint } from "@/components/admin/sales-chart";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import { TableEmptyState } from "@/components/admin/data-table-primitives";

const ALL_STATUSES: OrderStatus[] = [
  "PLACED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

// `absolute` keeps the root layout's `%s | AIROVA FOOTWEAR` template from
// doubling up on the admin default title.
export const metadata = { title: { absolute: "Admin — AIROVA FOOTWEAR" } };

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default async function AdminDashboardPage() {
  await requireAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since14 = new Date(today);
  since14.setDate(today.getDate() - 13);
  const since30 = new Date(today);
  since30.setDate(today.getDate() - 29);

  const [
    paidOrders,
    orderCount,
    lowStockCount,
    newCustomers,
    salesRows,
    statusGroups,
    itemRows,
    productRows,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    db.order.findMany({
      where: {
        paymentStatus: { in: ["PAID", "COD_PENDING"] },
        status: { notIn: ["CANCELLED", "RETURNED"] },
      },
      select: { total: true },
    }),
    db.order.count(),
    db.variant.count({ where: { stock: { gt: 0, lte: 3 } } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since30 } } }),
    db.order.findMany({
      where: { placedAt: { gte: since14 }, status: { notIn: ["CANCELLED", "RETURNED"] } },
      select: { placedAt: true, total: true },
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.orderItem.findMany({
      where: { order: { status: { notIn: ["CANCELLED", "RETURNED"] } } },
      select: { productId: true, price: true, qty: true },
    }),
    db.product.findMany({ select: { id: true, name: true, slug: true, images: true } }),
    db.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 8,
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
    db.variant.findMany({
      where: { stock: { gt: 0, lte: 3 } },
      orderBy: { stock: "asc" },
      take: 8,
      select: {
        id: true,
        color: true,
        size: true,
        stock: true,
        product: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const aov = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;

  const sales: SalesPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    sales.push({
      iso: dayKey(d),
      label: `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`,
      value: 0,
    });
  }
  const salesIndex = new Map(sales.map((s, i) => [s.iso, i]));
  for (const row of salesRows) {
    const idx = salesIndex.get(dayKey(new Date(row.placedAt)));
    if (idx != null) sales[idx].value += row.total;
  }

  const statusCounts = new Map<OrderStatus, number>(
    statusGroups.map((g) => [g.status as OrderStatus, g._count._all]),
  );
  const maxStatus = Math.max(1, ...ALL_STATUSES.map((s) => statusCounts.get(s) ?? 0));

  const productMap = new Map(productRows.map((p) => [p.id, p]));
  const byProduct = new Map<string, { qty: number; revenue: number }>();
  for (const item of itemRows) {
    const entry = byProduct.get(item.productId) ?? { qty: 0, revenue: 0 };
    entry.qty += item.qty;
    entry.revenue += item.price * item.qty;
    byProduct.set(item.productId, entry);
  }
  const topProducts = [...byProduct.entries()]
    .map(([productId, stats]) => ({ productId, product: productMap.get(productId), ...stats }))
    .filter((row) => row.product)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Control room"
        title="Dashboard"
        description="Revenue, orders and stock across the AIROVA storefront."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                Orders
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="gold" size="sm">
              <Link href="/admin/products/new">New product</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Revenue"
          value={formatPrice(revenue)}
          note="Paid + COD pending, cancellations excluded"
          icon={IndianRupee}
          tone="gold"
        />
        <StatCard
          label="Orders"
          value={orderCount}
          note="All time"
          icon={Receipt}
        />
        <StatCard
          label="Avg order value"
          value={formatPrice(aov)}
          note={`Across ${paidOrders.length} paid order${paidOrders.length === 1 ? "" : "s"}`}
          icon={TrendingUp}
        />
        <StatCard
          label="Low stock"
          value={lowStockCount}
          note="Variants with 1–3 pairs left"
          icon={AlertTriangle}
          tone={lowStockCount > 0 ? "gold" : "default"}
        />
        <StatCard
          label="New customers"
          value={newCustomers}
          note="Joined in the last 30 days"
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader title="Sales — last 14 days" hint="Revenue by day, cancellations excluded" />
          <SalesChart data={sales} />
        </Panel>

        <Panel>
          <PanelHeader title="Orders by status" hint={`${orderCount} orders total`} />
          <div className="flex flex-col gap-3.5 px-5 py-5">
            {ALL_STATUSES.map((status) => {
              const count = statusCounts.get(status) ?? 0;
              const pct = Math.round((count / maxStatus) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between gap-3">
                    <OrderStatusBadge status={status} />
                    <span className="text-sm text-cream/70 tabular-nums">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1 w-full bg-white/[0.06]">
                    <div
                      className={status === "CANCELLED" || status === "RETURNED" ? "h-full bg-destructive/60" : "h-full bg-gold/70"}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Top products"
            hint="Quantity and revenue across fulfilled orders"
            action={
              <Button asChild variant="ghost" size="xs" className="text-gold">
                <Link href="/admin/products">
                  All products
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              </Button>
            }
          />
          {topProducts.length === 0 ? (
            <TableEmptyState
              title="No sales yet"
              description="Product performance appears once orders start coming in."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-ink-line hover:bg-transparent">
                  <TableHead className="text-cream/45">Product</TableHead>
                  <TableHead className="text-right text-cream/45">Units</TableHead>
                  <TableHead className="text-right text-cream/45">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((row) => (
                  <TableRow key={row.productId} className="border-ink-line hover:bg-white/[0.02]">
                    <TableCell>
                      <Link
                        href={`/admin/products/${row.productId}`}
                        className="text-cream transition-colors hover:text-gold"
                      >
                        {row.product?.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-cream/70 tabular-nums">{row.qty}</TableCell>
                    <TableCell className="text-right">
                      <Money value={row.revenue} className="text-cream" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel>
          <PanelHeader
            title="Recent orders"
            hint="Latest eight orders"
            action={
              <Button asChild variant="ghost" size="xs" className="text-gold">
                <Link href="/admin/orders">
                  All orders
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              </Button>
            }
          />
          {recentOrders.length === 0 ? (
            <TableEmptyState
              title="No orders yet"
              description="When customers check out, their orders land here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-ink-line hover:bg-transparent">
                  <TableHead className="text-cream/45">Order</TableHead>
                  <TableHead className="text-cream/45">Customer</TableHead>
                  <TableHead className="text-right text-cream/45">Total</TableHead>
                  <TableHead className="text-right text-cream/45">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-ink-line hover:bg-white/[0.02]">
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block text-cream transition-colors hover:text-gold"
                      >
                        <span className="block text-sm">{order.number}</span>
                        <span className="block text-[0.68rem] text-cream/40">
                          {formatOrderDate(order.placedAt)} · {order._count.items} item
                          {order._count.items === 1 ? "" : "s"}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-cream/70">
                      <span className="block truncate">{order.addrName}</span>
                      <span className="block truncate text-[0.68rem] text-cream/40">
                        {order.email}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Money value={order.total} className="text-cream" />
                    </TableCell>
                    <TableCell className="text-right">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Low stock alerts"
          hint="Variants with three pairs or fewer"
          action={
            <Button asChild variant="ghost" size="xs" className="text-gold">
              <Link href="/admin/products">
                Manage stock
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            </Button>
          }
        />
        {lowStock.length === 0 ? (
          <TableEmptyState
            title="Stock levels look healthy"
            description="No variant is down to its last three pairs right now."
          />
        ) : (
          <ul className="divide-y divide-ink-line">
            {lowStock.map((variant) => (
              <li
                key={variant.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/products/${variant.product.slug}`}
                    className="block truncate text-sm text-cream transition-colors hover:text-gold"
                  >
                    {variant.product.name}
                  </Link>
                  <MicroLabel className="mt-1 block">
                    {variant.color} · UK {variant.size}
                  </MicroLabel>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={
                      variant.stock === 1
                        ? "border border-destructive/50 bg-destructive/10 px-2 py-0.5 text-xs text-[#e78a82] tabular-nums"
                        : "border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs text-gold tabular-nums"
                    }
                  >
                    {variant.stock} left
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
