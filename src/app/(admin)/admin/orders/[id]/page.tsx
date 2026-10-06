import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MessageSquare, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatOrderDate } from "@/lib/format";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Panel, PanelHeader, MicroLabel } from "@/components/admin/panel";
import { PageHeader } from "@/components/admin/page-header";
import { Money } from "@/components/admin/money";
import {
  OrderStatusBadge,
  PaymentMethodBadge,
  PaymentStatusBadge,
} from "@/components/admin/status-badge";
import { OrderActions, PrintButton } from "@/components/admin/orders/order-actions";

export const metadata = { title: "Order" };

const CHAIN: OrderStatus[] = ["PLACED", "PACKED", "SHIPPED", "DELIVERED"];

const formatTime = (d: Date) =>
  d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true, createdAt: true } },
    },
  });
  if (!order) notFound();

  const chainIndex = CHAIN.indexOf(order.status);
  const terminal = chainIndex === -1;
  const steps = CHAIN.map((step, i) => ({
    key: step,
    label: ORDER_STATUS_LABEL[step],
    done: !terminal && i <= chainIndex,
    current: !terminal && i === chainIndex,
    at: !terminal && i === chainIndex ? order.updatedAt : null,
  }));
  const timeline = [
    { key: "placed", label: "Order placed", at: order.placedAt, done: true, current: false },
    ...steps.slice(1),
    ...(terminal
      ? [
          {
            key: order.status,
            label: ORDER_STATUS_LABEL[order.status],
            at: order.updatedAt,
            done: true,
            current: true,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Order"
        title={order.number}
        description={`Placed ${formatOrderDate(order.placedAt)} · ${order.items.length} item${
          order.items.length === 1 ? "" : "s"
        } · ${order.addrCity}, ${order.addrState}`}
        actions={
          <>
            <OrderStatusBadge status={order.status} />
            <PrintButton />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                <ArrowLeft className="size-3.5" aria-hidden />
                All orders
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Panel>
            <PanelHeader title="Items" hint={`${order.items.length} line${order.items.length === 1 ? "" : "s"} on this order`} />
            <ul className="divide-y divide-ink-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span className="relative size-14 shrink-0 overflow-hidden border border-white/10 bg-white/[0.04]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      target="_blank"
                      className="block truncate text-sm text-cream transition-colors hover:text-gold"
                    >
                      {item.name}
                      <ExternalLink className="ml-1.5 inline size-3" aria-hidden />
                    </Link>
                    <MicroLabel className="mt-1 block">
                      {item.color} · UK {item.size} · {item.qty} × <Money value={item.price} />
                    </MicroLabel>
                  </div>
                  <div className="text-right">
                    <Money value={item.price * item.qty} className="text-sm text-cream" />
                    {item.mrp > item.price ? (
                      <span className="mt-0.5 block text-[0.66rem] text-cream/35">
                        MRP <Money value={item.mrp * item.qty} />
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-ink-line px-5 py-4 text-sm">
              <div className="flex justify-between text-cream/60">
                <span>Subtotal</span>
                <Money value={order.subtotal} />
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-cream/60">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <Money value={-order.discount} />
                </div>
              ) : null}
              <div className="flex justify-between text-cream/60">
                <span>Shipping</span>
                <Money value={order.shipping} />
              </div>
              <div className="flex justify-between border-t border-ink-line pt-2.5 text-base text-cream">
                <span>Total</span>
                <Money value={order.total} />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Timeline"
              hint={`Last updated ${formatTime(order.updatedAt)}`}
            />
            <ol className="flex flex-col px-5 py-5">
              {timeline.map((step, i) => (
                <li key={step.key} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < timeline.length - 1 ? (
                    <span
                      aria-hidden
                      className={`absolute top-4 left-[5px] h-full w-px ${step.done ? "bg-gold/40" : "bg-white/10"}`}
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className={`mt-1 size-2.5 shrink-0 rounded-full ${
                      step.current
                        ? "bg-gold ring-4 ring-gold/20"
                        : step.done
                          ? "bg-gold/70"
                          : "bg-white/15"
                    }`}
                  />
                  <div className="-mt-0.5 min-w-0">
                    <p className={`text-sm ${step.done ? "text-cream" : "text-cream/40"}`}>
                      {step.label}
                    </p>
                    <p className="text-[0.68rem] text-cream/40">
                      {step.at
                        ? formatTime(step.at)
                        : step.done
                          ? "Completed"
                          : "Pending"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel>
            <PanelHeader title="Actions" hint="Changes apply immediately and refresh the storefront" />
            <div className="px-5 py-5">
              <OrderActions
                orderId={order.id}
                status={order.status}
                paymentStatus={order.paymentStatus}
                simulate={process.env.NODE_ENV !== "production"}
              />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader title="Customer" />
            <div className="flex flex-col gap-3 px-5 py-5 text-sm">
              <div>
                <MicroLabel>Name</MicroLabel>
                <p className="mt-1 text-cream">{order.addrName}</p>
              </div>
              <div>
                <MicroLabel>Email</MicroLabel>
                <a
                  href={`mailto:${order.email}`}
                  className="mt-1 block break-all text-cream transition-colors hover:text-gold"
                >
                  {order.email}
                </a>
              </div>
              <div>
                <MicroLabel>Phone</MicroLabel>
                <a
                  href={`tel:${order.addrPhone}`}
                  className="mt-1 block text-cream transition-colors hover:text-gold"
                >
                  {order.addrPhone}
                </a>
              </div>
              {order.user ? (
                <Link
                  href={`/admin/customers/${order.user.id}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs text-gold transition-colors hover:text-gold-bright"
                >
                  View customer account
                  <ExternalLink className="size-3" aria-hidden />
                </Link>
              ) : (
                <p className="text-xs text-cream/40">Guest checkout — no account linked.</p>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Shipping address" />
            <address className="flex flex-col gap-1.5 px-5 py-5 text-sm leading-relaxed text-cream/75 not-italic">
              <span className="text-cream">{order.addrName}</span>
              <span>{order.addrLine1}</span>
              {order.addrLine2 ? <span>{order.addrLine2}</span> : null}
              <span>
                {order.addrCity}, {order.addrState} {order.addrPincode}
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-cream/45">
                <Truck className="size-3.5" aria-hidden />
                Deliver to {order.addrPhone}
              </span>
            </address>
          </Panel>

          <Panel>
            <PanelHeader title="Payment" />
            <div className="flex flex-col gap-3 px-5 py-5 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <PaymentMethodBadge method={order.paymentMethod} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div>
                <MicroLabel>Payment id</MicroLabel>
                <p className="mt-1 break-all font-mono text-xs text-cream/70">
                  {order.paymentId ?? "—"}
                </p>
              </div>
              <div>
                <MicroLabel>Coupon</MicroLabel>
                <p className="mt-1 text-cream/70">{order.couponCode ?? "—"}</p>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Customer note" />
            <p className="flex items-start gap-2.5 px-5 py-5 text-sm text-cream/70">
              <MessageSquare className="mt-0.5 size-4 shrink-0 text-gold/70" aria-hidden />
              {order.note || "No note left at checkout."}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
