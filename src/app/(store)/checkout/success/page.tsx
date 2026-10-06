import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronRight, MessageCircle, Package, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { cardImage } from "@/lib/catalog";
import { formatPrice, formatOrderDate } from "@/lib/format";
import { buyOnWhatsApp, checkPincode, whatsappLink } from "@/lib/commerce";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your AIROVA order has been placed.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const reference = typeof sp.order === "string" ? sp.order : "";

  const order = reference
    ? await db.order.findFirst({
        where: { OR: [{ id: reference }, { number: reference }] },
        include: { items: true },
      })
    : null;

  if (!order) {
    return (
      <div className="shell flex min-h-[55vh] flex-col items-center justify-center gap-5 py-24 text-center">
        <p className="eyebrow">Order lookup</p>
        <h1 className="text-4xl">We couldn&apos;t find that order</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          If you just completed a payment it may take a moment to appear. Check your email, or
          reach out and we&apos;ll find it for you.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="ink" asChild>
            <Link href="/account/orders">View my orders</Link>
          </Button>
          <Button variant="whatsapp" asChild>
            <a href={whatsappLink("Hi AIROVA! I need help finding my order.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> WhatsApp support
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const pin = checkPincode(order.addrPincode);
  const eta = pin.serviceable ? pin.standardDays : [4, 7];
  const paid = order.paymentStatus === "PAID";

  return (
    <div className="shell pb-24 pt-10 sm:pb-32 sm:pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Order",
            orderNumber: order.number,
            orderStatus: "https://schema.org/OrderProcessing",
            priceCurrency: "INR",
            price: order.total,
            datePublished: order.placedAt.toISOString(),
            seller: { "@type": "Organization", name: SITE.name },
          }),
        }}
      />

      <section className="border border-ink bg-ink px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="mx-auto grid size-14 place-items-center rounded-full border border-gold/50 bg-gold/10">
          <Check className="size-6 text-gold" strokeWidth={3} />
        </div>
        <p className="eyebrow mt-6">Order confirmed</p>
        <h1 className="mt-3 text-4xl text-cream sm:text-5xl">Thank you — you&apos;re all set</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/70">
          {paid
            ? "Your payment went through and we've received your order. A confirmation email is on its way."
            : "We've received your order. Pay the courier when your pair arrives."}
        </p>

        <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border border-ink-line px-6 py-4 text-left">
          <div>
            <p className="text-[0.6rem] tracking-[0.18em] text-cream/50 uppercase">Order number</p>
            <p className="mt-1 text-sm font-semibold text-gold tabular-nums">{order.number}</p>
          </div>
          <div className="hidden h-8 w-px bg-ink-line sm:block" />
          <div>
            <p className="text-[0.6rem] tracking-[0.18em] text-cream/50 uppercase">Placed on</p>
            <p className="mt-1 text-sm text-cream tabular-nums">{formatOrderDate(order.placedAt)}</p>
          </div>
          <div className="hidden h-8 w-px bg-ink-line sm:block" />
          <div>
            <p className="text-[0.6rem] tracking-[0.18em] text-cream/50 uppercase">Total</p>
            <p className="mt-1 text-sm text-cream tabular-nums">{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="gold" size="lg" asChild>
            <Link href={`/account/orders/${order.id}`}>
              Track order <ChevronRight />
            </Link>
          </Button>
          <Button variant="outline-light" size="lg" asChild>
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </div>
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        {/* Items */}
        <section aria-labelledby="order-items-heading" className="border border-line">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id="order-items-heading" className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
              In this order
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {order.items.reduce((s, i) => s + i.qty, 0)} items
            </span>
          </div>

          <ul className="divide-y divide-line px-5">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <Link href={`/product/${item.slug}`} className="relative size-20 shrink-0 bg-bone">
                  <Image
                    src={cardImage(item.image)}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.slug}`} className="link-underline text-sm font-medium">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.color} · UK {item.size} · Qty {item.qty}
                  </p>
                </div>
                <p className="text-sm tabular-nums">{formatPrice(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-line px-5 py-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-700 tabular-nums">− {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">
                {order.shipping === 0 ? <span className="text-green-700">Free</span> : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between border-t border-line pt-2 font-semibold">
              <span>Total paid</span>
              <span className="tabular-nums">{formatPrice(order.total)}</span>
            </div>
            <p className="text-right text-[0.68rem] text-muted-foreground">
              {order.paymentMethod === "COD" ? "Cash on delivery" : paid ? "Paid via Razorpay" : "Payment pending"}
              {order.couponCode && ` · ${order.couponCode}`}
            </p>
          </div>
        </section>

        {/* Delivery */}
        <aside className="space-y-4">
          <div className="border border-line p-5">
            <div className="flex items-center gap-2.5">
              <Truck className="size-4 text-gold-deep" />
              <h2 className="text-sm">Estimated delivery</h2>
            </div>
            <p className="mt-2 text-2xl tabular-nums">
              {eta[0]}–{eta[1]} days
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Packed in Mumbai within 24 hours · {order.shipping === 0 ? "free shipping" : "paid shipping"}
            </p>
          </div>

          <div className="border border-line p-5">
            <div className="flex items-center gap-2.5">
              <Package className="size-4 text-gold-deep" />
              <h2 className="text-sm">Shipping to</h2>
            </div>
            <address className="mt-2 text-sm not-italic leading-relaxed text-muted-foreground">
              {order.addrName}
              <br />
              {order.addrLine1}
              {order.addrLine2 && (
                <>
                  <br />
                  {order.addrLine2}
                </>
              )}
              <br />
              {order.addrCity}, {order.addrState} {order.addrPincode}
              <br />
              {order.addrPhone}
            </address>
          </div>

          <div className="border border-line bg-bone/60 p-5">
            <h2 className="text-sm">Questions?</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Our team replies on WhatsApp within business hours and can change your address
              before the order is packed.
            </p>
            <Button variant="whatsapp" size="sm" className="mt-3 w-full" asChild>
              <a
                href={buyOnWhatsApp({ orderNumber: order.number })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle /> Chat about this order
              </a>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            A confirmation has been sent to <span className="text-ink">{order.email}</span>
          </p>
        </aside>
      </div>
    </div>
  );
}
