import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MapPin,
  ReceiptText,
  Star,
  Wallet,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { MicroLabel, Panel, PanelHeader } from "@/components/admin/panel";
import { Money } from "@/components/admin/money";
import { StatCard } from "@/components/admin/stat-card";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/admin/status-badge";
import { TableEmptyState } from "@/components/admin/data-table-primitives";
import { RoleToggle } from "@/components/admin/customers/role-toggle";

export const metadata = { title: "Customer" };

export default async function CustomerDetailPage({
  params,
}: PageProps<"/admin/customers/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      wishlist: { select: { productId: true } },
      reviews: { select: { id: true, rating: true, status: true } },
    },
  });
  if (!user) notFound();

  const [orders, orderAgg] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { placedAt: "desc" },
      take: 8,
      select: {
        id: true,
        number: true,
        placedAt: true,
        status: true,
        paymentStatus: true,
        total: true,
        _count: { select: { items: true } },
      },
    }),
    db.order.aggregate({
      where: { userId: user.id },
      _count: { _all: true },
      _sum: { total: true },
    }),
  ]);

  const orderCount = orderAgg._count._all;
  const spent = orderAgg._sum.total ?? 0;
  const avg = orderCount ? Math.round(spent / orderCount) : 0;
  const publishedReviews = user.reviews.filter((r) => r.status === "published").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Customer"
        title={user.name}
        description={`${user.email} · joined ${formatOrderDate(user.createdAt)}`}
        actions={
          <>
            <span
              className={
                user.role === "ADMIN"
                  ? "inline-flex h-8 items-center border border-gold/45 bg-gold/10 px-2.5 text-[0.64rem] font-semibold tracking-[0.14em] text-gold uppercase"
                  : "inline-flex h-8 items-center border border-white/15 bg-white/5 px-2.5 text-[0.64rem] font-semibold tracking-[0.14em] text-cream/55 uppercase"
              }
            >
              {user.role}
            </span>
            <RoleToggle
              userId={user.id}
              role={user.role}
              name={user.name}
              isSelf={admin.id === user.id}
            />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/customers">
                <ArrowLeft className="size-3.5" aria-hidden />
                All customers
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders"
          value={orderCount}
          note="Lifetime order count"
          icon={ReceiptText}
        />
        <StatCard
          label="Total spent"
          value={<Money value={spent} />}
          note="Sum of order totals"
          icon={Wallet}
          tone="gold"
        />
        <StatCard
          label="Average order"
          value={<Money value={avg} />}
          note={orderCount ? "Across all orders" : "No orders yet"}
        />
        <StatCard
          label="Wishlist"
          value={user.wishlist.length}
          note={`${publishedReviews} published review${publishedReviews === 1 ? "" : "s"}`}
          icon={Heart}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Panel>
            <PanelHeader
              title="Recent orders"
              hint={`${orderCount} order${orderCount === 1 ? "" : "s"} on this account`}
              action={
                orderCount > orders.length ? (
                  <Button asChild variant="ghost" size="xs">
                    <Link href={`/admin/orders?q=${encodeURIComponent(user.email)}`}>
                      View all
                    </Link>
                  </Button>
                ) : undefined
              }
            />
            {orders.length === 0 ? (
              <TableEmptyState
                icon={<ReceiptText className="size-5" aria-hidden />}
                title="No orders yet"
                description="This account has not checked out. They may still be browsing or using the wishlist."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-line text-left font-mono text-[0.6rem] tracking-[0.16em] text-cream/45 uppercase">
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">
                        Status
                      </th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">
                        Payment
                      </th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-ink-line last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="block text-cream transition-colors hover:text-gold"
                          >
                            <span className="block text-sm">{order.number}</span>
                            <span className="block text-[0.68rem] text-cream/40">
                              {formatOrderDate(order.placedAt)} ·{" "}
                              {order._count.items} item
                              {order._count.items === 1 ? "" : "s"}
                            </span>
                          </Link>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Money value={order.total} className="text-cream" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader
              title="Saved addresses"
              hint={`${user.addresses.length} on file`}
              action={<MapPin className="size-4 text-gold/70" aria-hidden />}
            />
            {user.addresses.length === 0 ? (
              <TableEmptyState
                icon={<MapPin className="size-5" aria-hidden />}
                title="No saved addresses"
                description="Guest checkouts do not save addresses; this account has none stored yet."
              />
            ) : (
              <ul className="grid gap-px bg-ink-line sm:grid-cols-2">
                {user.addresses.map((address) => (
                  <li
                    key={address.id}
                    className="bg-[#131317] px-5 py-4 text-sm leading-relaxed text-cream/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <MicroLabel className="text-cream/70">
                        {address.label}
                      </MicroLabel>
                      {address.isDefault ? (
                        <span className="inline-flex h-4.5 items-center border border-gold/45 bg-gold/10 px-1.5 text-[0.55rem] font-semibold tracking-[0.12em] text-gold uppercase">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-cream">{address.name}</p>
                    <p className="mt-0.5">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                    </p>
                    <p>
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="mt-1 text-xs text-cream/45">
                      {address.phone}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader title="Account" />
            <dl className="flex flex-col gap-3.5 px-5 py-5 text-sm">
              <div>
                <MicroLabel>Name</MicroLabel>
                <dd className="mt-1 text-cream">{user.name}</dd>
              </div>
              <div>
                <MicroLabel>Email</MicroLabel>
                <dd className="mt-1">
                  <a
                    href={`mailto:${user.email}`}
                    className="break-all text-cream transition-colors hover:text-gold"
                  >
                    {user.email}
                  </a>
                </dd>
              </div>
              <div>
                <MicroLabel>Phone</MicroLabel>
                <dd className="mt-1 text-cream">
                  {user.phone ? (
                    <a
                      href={`tel:${user.phone}`}
                      className="transition-colors hover:text-gold"
                    >
                      {user.phone}
                    </a>
                  ) : (
                    <span className="text-cream/35">Not provided</span>
                  )}
                </dd>
              </div>
              <div>
                <MicroLabel>Joined</MicroLabel>
                <dd className="mt-1 text-cream/75">
                  {formatOrderDate(user.createdAt)}
                </dd>
              </div>
              <div>
                <MicroLabel>Auth</MicroLabel>
                <dd className="mt-1 text-cream/75">
                  {user.googleId
                    ? "Google sign-in"
                    : user.passwordHash
                      ? "Email + password"
                      : "No password set"}
                </dd>
              </div>
              <div>
                <MicroLabel>User id</MicroLabel>
                <dd className="mt-1 break-all font-mono text-[0.68rem] text-cream/50">
                  {user.id}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Reviews" hint="Written by this customer" />
            {user.reviews.length === 0 ? (
              <p className="px-5 py-5 text-sm text-cream/45">
                No reviews submitted yet.
              </p>
            ) : (
              <ul className="divide-y divide-ink-line">
                {user.reviews.map((review) => (
                  <li
                    key={review.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <span className="flex items-center gap-1 text-gold">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={n <= review.rating ? "" : "text-cream/20"}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                    <span className="inline-flex h-5 items-center border border-white/15 bg-white/5 px-1.5 text-[0.58rem] font-semibold tracking-[0.14em] text-cream/55 uppercase">
                      {review.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-ink-line px-5 py-3">
              <Button asChild variant="ghost" size="xs">
                <Link href="/admin/reviews">
                  <Star className="size-3" aria-hidden />
                  Moderate reviews
                </Link>
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
