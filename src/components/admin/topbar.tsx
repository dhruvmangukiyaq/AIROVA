"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu, Search, Settings } from "lucide-react";
import { logoutAdmin } from "@/app/(admin)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/types";

const TITLES: { match: RegExp; title: string }[] = [
  { match: /^\/admin$/, title: "Dashboard" },
  { match: /^\/admin\/products/, title: "Products" },
  { match: /^\/admin\/orders/, title: "Orders" },
  { match: /^\/admin\/customers/, title: "Customers" },
  { match: /^\/admin\/coupons/, title: "Coupons" },
  { match: /^\/admin\/content/, title: "Content" },
  { match: /^\/admin\/reviews/, title: "Reviews" },
  { match: /^\/admin\/settings/, title: "Settings" },
];

function sectionTitle(pathname: string) {
  return TITLES.find((t) => t.match.test(pathname))?.title ?? "Admin";
}

function initials(name: string, email: string) {
  const source = name?.trim() || email.split("@")[0] || "A";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Topbar({
  user,
  onOpenMenu,
}: {
  user: SessionUser;
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [q, setQ] = React.useState("");

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = q.trim();
    router.push(term ? `/admin/products?q=${encodeURIComponent(term)}` : "/admin/products");
  };

  const onLogout = () => {
    startTransition(async () => {
      try {
        await logoutAdmin();
      } catch {
        toast.error("Could not log out — try again.");
      }
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-ink-line bg-[#0e0e10]/95 px-4 backdrop-blur sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-cream/70 lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden />
      </Button>

      <div className="flex min-w-0 items-baseline gap-2">
        <span className="hidden text-[0.62rem] tracking-[0.22em] text-cream/35 uppercase sm:inline">
          Admin
        </span>
        <span aria-hidden className="hidden text-cream/20 sm:inline">
          /
        </span>
        <span className="truncate text-sm font-medium tracking-[0.04em] text-cream">
          {sectionTitle(pathname)}
        </span>
      </div>

      <form
        onSubmit={onSearch}
        role="search"
        className="ml-auto hidden items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-1.5 transition-colors focus-within:border-gold/50 md:flex"
      >
        <Search className="size-3.5 text-cream/40" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-44 bg-transparent text-sm text-cream outline-none placeholder:text-cream/35"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5 md:ml-2">
        <Button asChild variant="ghost" size="xs" className="hidden text-cream/60 sm:inline-flex">
          <Link href="/" target="_blank">
            <ExternalLink className="size-3.5" aria-hidden />
            View store
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 border border-white/10 px-2 py-1.5 transition-colors hover:border-gold/40"
              aria-label="Account menu"
            >
              <span className="grid size-7 place-content-center bg-gold text-[0.65rem] font-bold text-ink">
                {initials(user.name, user.email)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-[9rem] truncate text-xs text-cream">
                  {user.name || user.email}
                </span>
                <span className="block text-[0.6rem] tracking-[0.14em] text-gold uppercase">
                  Admin
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-none border-ink-line bg-[#16161a]">
            <DropdownMenuLabel>
              <span className="block truncate text-xs text-cream">{user.email}</span>
              <span className="mt-0.5 block text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">
                Signed in as admin
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-ink-line" />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">
                <Settings className="size-4" aria-hidden />
                Store settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank">
                <ExternalLink className="size-4" aria-hidden />
                View store
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-ink-line" />
            <DropdownMenuItem
              onSelect={onLogout}
              disabled={pending}
              className="text-[#e78a82] focus:bg-destructive/15 focus:text-[#e78a82]"
            >
              <LogOut className="size-4" aria-hidden />
              {pending ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
