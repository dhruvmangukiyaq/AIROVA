"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsLeft,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Star,
  TicketPercent,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
}

export interface SidebarProps {
  collapsed?: boolean;
  counts?: { orders: number; reviews: number };
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function navItems(counts?: { orders: number; reviews: number }): NavItem[] {
  return [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart, count: counts?.orders },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
    { label: "Content", href: "/admin/content", icon: FileText },
    { label: "Reviews", href: "/admin/reviews", icon: Star, count: counts?.reviews },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];
}

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  collapsed = false,
  counts,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const items = navItems(counts);

  return (
    <div className="flex h-full w-full flex-col bg-[#0e0e10]">
      <Link
        href="/admin"
        onClick={onNavigate}
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-ink-line px-4",
          collapsed && "justify-center px-0",
        )}
        aria-label="AIROVA admin home"
      >
        <span className="relative size-8 shrink-0">
          <Image
            src="/images/brand/airova-monogram-transparent.png"
            alt=""
            aria-hidden
            fill
            sizes="32px"
            className="object-contain"
          />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-[0.78rem] font-semibold tracking-[0.2em] text-cream uppercase">
              AIROVA
            </span>
            <span className="block text-[0.58rem] tracking-[0.3em] text-gold uppercase">
              Control room
            </span>
          </span>
        )}
      </Link>

      <nav
        aria-label="Admin sections"
        className="flex-1 overflow-y-auto px-2 py-4 hide-scrollbar"
      >
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors duration-200",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-gold/[0.07] text-gold"
                      : "text-cream/55 hover:bg-white/[0.03] hover:text-cream",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-0.5 transition-colors",
                      active ? "bg-gold" : "bg-transparent group-hover:bg-gold/30",
                    )}
                  />
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.count ? (
                    <span className="ml-auto border border-gold/40 px-1.5 py-px text-[0.6rem] tracking-normal text-gold tabular-nums">
                      {item.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-ink-line p-2">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-[0.68rem] tracking-[0.16em] text-cream/50 uppercase transition-colors hover:text-gold",
            collapsed && "justify-center px-0",
          )}
        >
          <ExternalLink className="size-4 shrink-0" aria-hidden />
          {!collapsed && <span>View store</span>}
        </Link>
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden w-full items-center gap-3 px-3 py-2.5 text-[0.68rem] tracking-[0.16em] text-cream/40 uppercase transition-colors hover:text-gold lg:flex",
              collapsed && "justify-center px-0",
            )}
          >
            <ChevronsLeft
              className={cn("size-4 shrink-0 transition-transform", collapsed && "rotate-180")}
              aria-hidden
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        ) : null}
      </div>
    </div>
  );
}
