import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Package, Plus } from "lucide-react";
import { requireAccount } from "@/actions/common";
import { db } from "@/lib/db";
import { formatOrderDate, formatPrice } from "@/lib/format";
import { AccountHeading } from "@/components/account/account-heading";
import { StatusPill } from "@/components/account/status-pill";
import { WishlistMini } from "@/components/account/wishlist-mini";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My account",
  description:
    "Your AIROVA FOOTWEAR account — order history, saved addresses, wishlist and profile settings.",
  alternates: { canonical: "/account" },
};

const sectionCard = "border border-line bg-paper";

export default async function AccountOverviewPage() {
  const session = await requireAccount("/account");

  const [profile, orderStats, latest, addresses, wishlistCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true, createdAt: true },
    }),
    db.order.aggregate({
      where: { userId: session.id },
      _count: { _all: true },
      _sum: { total: true },
    }),
    db.order.findFirst({
      where: { userId: session.id },
      orderBy: { placedAt: "desc" },
      include: { items: { select: { image: true, name: true, qty: true }, take: 4 } },
    }),
    db.address.findMany({
      where: { userId: session.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      take: 2,
    }),
    db.wishlist.count({ where: { userId: session.id } }),
  ]);

  const firstName = (profile?.name ?? session.name).trim().split(/\s+/)[0] ?? "there";
  const orderCount = orderStats._count._all;
  const spent = orderStats._sum.total ?? 0;

  const stats = [
    { label: "Orders placed", value: String(orderCount), hint: "Lifetime" },
    { label: "Total spent", value: formatPrice(spent), hint: "Across all orders" },
    { label: "Wishlist", value: String(wishlistCount), hint: "Saved for later" },
  ];

  return (
    <>
      <AccountHeading
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        description={
          <>
            Member since {formatOrderDate(profile?.createdAt ?? new Date())} ·{" "}
            {profile?.email ?? session.email}
          </>
        }
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/profile">Edit profile</Link>
          </Button>
        }
      />

      {/* quick stats */}
      <dl className="grid gap-px border border-line bg-line sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-paper p-5">
            <dt className="text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              {stat.label}
            </dt>
            <dd className="mt-2 font-display text-3xl leading-none text-ink tabular-nums">
              {stat.value}
            </dd>
            <dd className="mt-2 text-[0.7rem] text-muted-foreground">{stat.hint}</dd>
          </div>
        ))}
      </dl>

      {/* latest order */}
      <section className={`mt-8 ${sectionCard}`} aria-labelledby="latest-order-heading">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 id="latest-order-heading" className="text-lg text-ink">
            Latest order
          </h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-gold-deep"
          >
            All orders <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </header>

        {latest ? (
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                  Order number
                </p>
                <p className="mt-1 font-display text-xl break-all text-ink">{latest.number}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Placed {formatOrderDate(latest.placedAt)} · {formatPrice(latest.total)}
                </p>
              </div>
              <StatusPill status={latest.status} />
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {latest.items.map((item, i) => (
                <li key={`${item.image}-${i}`} className="img-well size-16 bg-bone">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="gold" size="sm" asChild>
                <Link href={`/account/orders/${latest.id}#tracking`}>
                  Track order <ArrowRight data-icon="inline-end" className="size-3.5" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/account/orders/${latest.id}`}>View details</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 p-6">
            <Package className="size-5 text-gold" aria-hidden />
            <p className="text-sm text-muted-foreground">
              No orders yet — your first pair is one click away.
            </p>
            <Button variant="gold" size="sm" asChild>
              <Link href="/shop">
                Start shopping <ArrowRight data-icon="inline-end" className="size-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* addresses + wishlist */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="addresses-heading" className={sectionCard}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id="addresses-heading" className="text-lg text-ink">
              Saved addresses
            </h2>
            <Link
              href="/account/addresses"
              className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-gold-deep"
            >
              Manage
            </Link>
          </header>

          {addresses.length ? (
            <ul className="divide-y divide-line">
              {addresses.map((address) => (
                <li key={address.id} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-gold-deep" aria-hidden />
                    <p className="text-[0.62rem] font-semibold tracking-[0.2em] text-ink uppercase">
                      {address.label}
                    </p>
                    {address.isDefault && (
                      <span className="border border-gold/60 bg-gold/10 px-1.5 py-0.5 text-[0.55rem] font-semibold tracking-[0.14em] text-gold-deep uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-ink">
                    {address.name} · {address.city}, {address.state} — {address.pincode}
                  </p>
                  <p className="mt-0.5 text-xs break-words text-muted-foreground">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3 p-6">
              <p className="text-sm text-muted-foreground">
                No saved addresses yet — add one for a faster checkout.
              </p>
            </div>
          )}

          <div className="border-t border-line p-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/addresses">
                <Plus data-icon="inline-start" className="size-3.5" /> Add address
              </Link>
            </Button>
          </div>
        </section>

        <section aria-labelledby="wishlist-heading" className={sectionCard}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id="wishlist-heading" className="text-lg text-ink">
              Your wishlist
            </h2>
            <Link
              href="/account/wishlist"
              className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-gold-deep"
            >
              Open
            </Link>
          </header>
          <WishlistMini limit={4} />
        </section>
      </div>
    </>
  );
}
