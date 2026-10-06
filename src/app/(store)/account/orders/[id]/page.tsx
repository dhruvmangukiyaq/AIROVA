import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, MapPin, PackageCheck } from "lucide-react";
import { requireAccount } from "@/actions/common";
import { db } from "@/lib/db";
import { formatOrderDate, formatPrice } from "@/lib/format";
import { AccountHeading } from "@/components/account/account-heading";
import { OrderActions } from "@/components/account/order-actions";
import { PaymentBadge, StatusPill } from "@/components/account/status-pill";
import { TrackingTimeline } from "@/components/account/tracking-timeline";
import { Button } from "@/components/ui/button";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    select: { number: true },
  });
  if (!order) return { title: "Order not found" };
  return {
    title: `Order ${order.number}`,
    description: `Tracking, items and payment details for AIROVA order ${order.number}.`,
    alternates: { canonical: `/account/orders/${id}` },
  };
}

const PAYMENT_LABEL: Record<string, string> = {
  RAZORPAY: "Online — Razorpay",
  COD: "Cash on delivery",
};

const stamp = (value: Date | string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Single order: tracking stepper, the exact items bought, the delivery
 * address as it was captured at checkout, and the invoice-style breakdown.
 *
 * Orders placed by guests (checkout without an account) belong to the email
 * address, so those are matched on `email` as well as `userId`.
 */
export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await requireAccount(`/account/orders/${id}`);

  const order = await db.order.findFirst({
    where: { id, OR: [{ userId: session.id }, { userId: null, email: session.email }] },
    include: { items: true },
  });
  if (!order) notFound();

  const mrpTotal = order.items.reduce((sum, item) => sum + item.mrp * item.qty, 0);

  return (
    <>
      <AccountHeading
        eyebrow="Order detail"
        title={
          <span className="font-display break-all">
            {order.number}
            <span className="ml-3 align-middle">
              <StatusPill status={order.status} />
            </span>
          </span>
        }
        description={`Placed ${stamp(order.placedAt)} · Confirmation sent to ${order.email}`}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/orders">
              <ArrowLeft data-icon="inline-start" className="size-3.5" /> All orders
            </Link>
          </Button>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
        <div className="min-w-0 space-y-8">
          {/* items */}
          <section aria-labelledby="order-items" className="border border-line bg-paper">
            <h2
              id="order-items"
              className="border-b border-line px-5 py-4 text-[0.66rem] font-semibold tracking-[0.2em] text-ink uppercase"
            >
              {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </h2>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap gap-4 px-5 py-4 sm:flex-nowrap">
                  <span className="img-well size-20 shrink-0 bg-bone">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="link-underline text-sm text-ink"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.color} · UK {item.size} · Qty {item.qty}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatPrice(item.price)} each
                      {item.mrp > item.price && (
                        <span className="ml-2 line-through">
                          {formatPrice(item.mrp)}
                        </span>
                      )}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-medium tabular-nums text-ink">
                    {formatPrice(item.price * item.qty)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="space-y-2.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums text-ink">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">
                    Discount{order.couponCode ? ` · ${order.couponCode}` : ""}
                  </dt>
                  <dd className="tabular-nums text-green-800">
                    −{formatPrice(order.discount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums text-ink">
                  {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="text-[0.7rem] font-semibold tracking-[0.16em] text-ink uppercase">
                  Total paid
                </dt>
                <dd className="font-display text-lg tabular-nums text-ink">
                  {formatPrice(order.total)}
                </dd>
              </div>
              {mrpTotal > order.subtotal && (
                <p className="text-xs text-muted-foreground">
                  You saved {formatPrice(mrpTotal - order.subtotal)} against maximum retail
                  prices.
                </p>
              )}
            </dl>
          </section>

          {/* delivery + payment */}
          <div className="grid gap-6 sm:grid-cols-2">
            <section aria-labelledby="order-address" className="border border-line bg-paper p-5">
              <h2
                id="order-address"
                className="flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.2em] text-ink uppercase"
              >
                <MapPin className="size-3.5 text-gold" aria-hidden /> Delivering to
              </h2>
              <address className="mt-3 text-sm leading-relaxed text-muted-foreground not-italic">
                <span className="block font-medium text-ink">{order.addrName}</span>
                {order.addrLine1}
                {order.addrLine2 ? <>, {order.addrLine2}</> : null}
                <br />
                {order.addrCity}, {order.addrState} {order.addrPincode}
                <br />
                <span className="tabular-nums">+91 {order.addrPhone}</span>
              </address>
              {order.note && (
                <p className="mt-3 border-t border-line pt-3 text-xs text-muted-foreground">
                  Note: {order.note}
                </p>
              )}
            </section>

            <section aria-labelledby="order-payment" className="border border-line bg-paper p-5">
              <h2
                id="order-payment"
                className="flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.2em] text-ink uppercase"
              >
                <CreditCard className="size-3.5 text-gold" aria-hidden /> Payment
              </h2>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Method</dt>
                  <dd className="text-ink">{PAYMENT_LABEL[order.paymentMethod]}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <PaymentBadge status={order.paymentStatus} />
                  </dd>
                </div>
                {order.paymentId && (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Reference</dt>
                    <dd className="truncate font-mono text-xs text-ink">{order.paymentId}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Last update</dt>
                  <dd className="text-xs tabular-nums text-muted-foreground">
                    {stamp(order.updatedAt)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="border border-line bg-paper p-5">
            <OrderActions
              orderId={order.id}
              orderNumber={order.number}
              status={order.status}
            />
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <PackageCheck className="size-3.5 text-gold" aria-hidden />
              Need to change something? Message us on WhatsApp before the parcel is packed.
            </p>
          </div>
        </div>

        {/* tracking */}
        <aside id="tracking" className="scroll-mt-28">
          <div className="border border-line bg-paper p-5 sm:p-6">
            <h2 className="text-[0.66rem] font-semibold tracking-[0.2em] text-ink uppercase">
              Tracking
            </h2>
            <div className="mt-5">
              <TrackingTimeline
                status={order.status}
                placedAt={order.placedAt}
                updatedAt={order.updatedAt}
              />
            </div>
          </div>

          <div className="mt-6 border border-line bg-ink p-5 text-cream">
            <p className="text-[0.6rem] font-semibold tracking-[0.28em] text-gold uppercase">
              Need help?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">
              Quote {order.number} when you message us and we will pick it up straight away.
            </p>
            <p className="mt-3 text-xs tabular-nums text-cream/55">
              Order date: {formatOrderDate(order.placedAt)}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
