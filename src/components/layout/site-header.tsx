"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { SearchDialog } from "@/components/layout/search-dialog";
import { cn } from "@/lib/utils";
import { NAV } from "@/lib/site";
import type { SessionUser } from "@/lib/types";

const COLLECTIONS = [
  { label: "Aqua — Water Edition", href: "/shop?collection=aqua" },
  { label: "Flare — Fire Edition", href: "/shop?collection=flare" },
  { label: "Aero — Air Edition", href: "/shop?collection=aero" },
  { label: "Cinder — Ash Edition", href: "/shop?collection=cinder" },
  { label: "Denim Edit", href: "/shop?collection=denim" },
  { label: "All collections", href: "/collections" },
];

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="AIROVA FOOTWEAR — home"
      className={cn("group flex items-center gap-3", className)}
    >
      <Image
        src="/images/brand/airova-monogram-transparent.png"
        alt=""
        aria-hidden
        width={44}
        height={27}
        className="h-7 w-auto transition-transform duration-500 group-hover:scale-110"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-[0.3em] text-cream">
          AIROVA
        </span>
        <span className="mt-0.5 text-[0.5rem] font-medium tracking-[0.42em] text-gold/85">
          FOOTWEAR
        </span>
      </span>
    </Link>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
    href === pathname ||
    (href !== "/" && pathname.startsWith(href.split("?")[0]) && href.split("?").length === 1);
  return (
    <Link
      href={href}
      className={cn(
        "relative py-1 text-[0.7rem] font-medium tracking-[0.18em] whitespace-nowrap uppercase transition-colors",
        active ? "text-gold" : "text-cream/75 hover:text-cream",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300",
          active ? "w-full" : "w-0",
        )}
      />
    </Link>
  );
}

function IconLink({
  href,
  label,
  count,
  onClick,
  children,
}: {
  href?: string;
  label: string;
  count?: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const inner = (
    <span className="relative inline-flex size-9 items-center justify-center text-cream/85 transition-colors hover:text-gold">
      {children}
      {typeof count === "number" && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.55rem] leading-4 font-bold text-ink">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
  if (onClick) {
    return (
      <button type="button" aria-label={label} onClick={onClick}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href!} aria-label={label}>
      {inner}
    </Link>
  );
}

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const { count, setDrawerOpen } = useCart();
  const { items } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ⌘K / Ctrl-K opens search, matching the hint shown in the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-ink transition-shadow duration-300",
          scrolled && "shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)]",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* left: mobile trigger + logo */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="-ml-2 size-9 text-cream lg:hidden"
                >
                  <Menu className="mx-auto size-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-[86%] max-w-sm flex-col gap-0 border-ink-line bg-ink p-0 text-cream"
              >
                <SheetHeader className="border-b border-ink-line px-5 py-4">
                  <SheetTitle className="sr-only">Menu</SheetTitle>
                  <Logo />
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto px-5 py-6">
                  <ul className="space-y-1">
                    {NAV.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setNavOpen(false)}
                          className="flex items-center justify-between border-b border-ink-line/70 py-3 text-sm tracking-[0.14em] uppercase transition-colors hover:text-gold"
                        >
                          {item.label}
                          <ChevronDown className="size-3.5 -rotate-90 text-gold/50" />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <p className="eyebrow mt-8 mb-3">Collections</p>
                  <ul className="space-y-2">
                    {COLLECTIONS.slice(0, 5).map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          onClick={() => setNavOpen(false)}
                          className="text-sm text-cream/70 transition-colors hover:text-gold"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col gap-2">
                    {!user && (
                      <>
                        <Button variant="gold" size="lg" asChild>
                          <Link href="/account/login" onClick={() => setNavOpen(false)}>
                            Sign in
                          </Link>
                        </Button>
                        <Button variant="outline-light" size="lg" asChild>
                          <Link href="/account/register" onClick={() => setNavOpen(false)}>
                            Create account
                          </Link>
                        </Button>
                      </>
                    )}
                    {user && (
                      <Button variant="gold" size="lg" asChild>
                        <Link href="/account" onClick={() => setNavOpen(false)}>
                          My account
                        </Link>
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            <Logo />
          </div>

          {/* centre: desktop nav */}
          <nav aria-label="Main" className="hidden shrink-0 items-center gap-7 lg:flex">
            {NAV.slice(0, 5).map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} />
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 py-1 text-[0.7rem] font-medium tracking-[0.18em] whitespace-nowrap uppercase text-cream/75 outline-none transition-colors hover:text-cream">
                Collections
                <ChevronDown className="size-3 text-gold/70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="min-w-60 border-ink-line bg-ink p-1.5 text-cream"
              >
                {COLLECTIONS.map((c) => (
                  <DropdownMenuItem
                    key={c.href}
                    className="cursor-pointer px-3 py-2.5 text-xs tracking-[0.1em] uppercase focus:bg-ink-soft focus:text-gold"
                    asChild
                  >
                    <Link href={c.href}>{c.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* right: actions */}
          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-2">
            <IconLink label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="size-[18px]" />
            </IconLink>

            <IconLink label="Wishlist" href="/wishlist" count={items.length}>
              <Heart className="size-[18px]" />
            </IconLink>

            <IconLink
              label={user ? "My account" : "Sign in"}
              href={user ? "/account" : "/account/login"}
            >
              <User className="size-[18px]" />
            </IconLink>

            {user?.role === "ADMIN" && (
              <IconLink label="Admin dashboard" href="/admin">
                <LayoutDashboard className="size-[18px]" />
              </IconLink>
            )}

            <IconLink label="Cart" count={count} onClick={() => setDrawerOpen(true)}>
              <ShoppingBag className="size-[18px]" />
            </IconLink>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
