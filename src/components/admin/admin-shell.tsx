"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { cn } from "cn";
import type { SessionUser } from "@/lib/types";

/** Fixed sidebar (desktop) + sheet (mobile) around a scrollable content column. */
export function AdminShell({
  user,
  counts,
  children,
}: {
  user: SessionUser;
  counts?: { orders: number; reviews: number };
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen">
      <aside
        aria-label="Admin navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-ink-line transition-[width] duration-300 lg:block",
          collapsed ? "w-18" : "w-64",
        )}
      >
        <Sidebar
          collapsed={collapsed}
          counts={counts}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 border-r border-ink-line bg-[#0e0e10] p-0 [&>button]:text-cream/60"
        >
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Sections of the AIROVA control room.
          </SheetDescription>
          <Sidebar counts={counts} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-18" : "lg:pl-64",
        )}
      >
        <Topbar user={user} onOpenMenu={() => setMobileOpen(true)} />
        <main id="admin-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[86rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
