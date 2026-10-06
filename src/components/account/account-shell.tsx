"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import {
  Heart,
  LayoutGrid,
  LogOut,
  MapPin,
  Package,
  Star,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/actions/auth";
import { ConfirmDialog } from "@/components/account/confirm-dialog";
import { WishlistSync } from "@/components/account/wishlist-sync";
import { cn } from "cn";
import type { SessionUser } from "@/lib/types";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/profile", label: "Profile", icon: UserRound },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * `/account/**` chrome: sticky sidebar on desktop, a horizontally scrolling
 * tab row on mobile, plus the silent wishlist → database sync.
 */
export function AccountShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const signOut = () => {
    startTransition(() => logout());
  };

  return (
    <div className="shell pb-24 pt-8 sm:pb-32 sm:pt-12">
      <WishlistSync />

      {/* mobile: scrolling tab row pinned under the header */}
      <nav
        aria-label="Account"
        className="hide-scrollbar sticky top-16 z-30 -mx-4 mb-8 overflow-x-auto border-b border-line bg-background px-4 sm:-mx-6 sm:px-6 lg:hidden"
      >
        <ul className="flex min-w-max items-center gap-1 py-2">
          {NAV.map((item) => {
            const active = isCurrent(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-3 py-2 text-[0.66rem] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-colors",
                    active
                      ? "border-gold text-ink"
                      : "border-transparent text-muted-foreground hover:text-ink",
                  )}
                >
                  <item.icon className="size-3.5" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <ConfirmDialog
              title="Log out?"
              description="You will need to sign in again to view your orders, addresses and wishlist."
              confirmLabel="Log out"
              destructive
              onConfirm={signOut}
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 border-b-2 border-transparent px-3 py-2 text-[0.66rem] font-semibold tracking-[0.16em] whitespace-nowrap uppercase text-muted-foreground transition-colors hover:text-destructive"
                >
                  <LogOut className="size-3.5" aria-hidden />
                  Log out
                </button>
              }
            />
          </li>
        </ul>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
        {/* desktop: sidebar */}
        <aside className="hidden lg:block">
          <nav aria-label="Account" className="sticky top-28 border border-line bg-paper">
            <div className="border-b border-line bg-ink px-5 py-5 text-cream">
              <p className="text-[0.6rem] font-semibold tracking-[0.28em] text-gold uppercase">
                Signed in
              </p>
              <p className="mt-2 truncate font-display text-lg leading-tight">{user.name}</p>
              <p className="mt-1 truncate text-xs text-cream/55">{user.email}</p>
            </div>

            <ul className="p-2">
              {NAV.map((item) => {
                const active = isCurrent(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-3 px-4 py-3 text-[0.7rem] font-semibold tracking-[0.16em] uppercase transition-colors",
                        active
                          ? "bg-bone text-ink"
                          : "text-muted-foreground hover:bg-bone/60 hover:text-ink",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-0 left-0 w-0.5 bg-gold transition-opacity",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <item.icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line p-2">
              <ConfirmDialog
                title="Log out?"
                description="You will need to sign in again to view your orders, addresses and wishlist."
                confirmLabel="Log out"
                destructive
                onConfirm={signOut}
                trigger={
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-[0.7rem] font-semibold tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Log out
                  </button>
                }
              />
            </div>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
