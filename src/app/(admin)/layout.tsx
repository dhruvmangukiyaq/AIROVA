import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: {
    default: "Admin — AIROVA FOOTWEAR",
    template: "%s — Admin — AIROVA FOOTWEAR",
  },
  robots: { index: false, follow: false },
};

/**
 * Admin route group. Everything renders on ink-black surfaces (`.dark`), and
 * the sidebar/topbar shell only mounts for a signed-in admin — the login page
 * deliberately falls through to a bare dark canvas.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return <div className="dark min-h-screen bg-ink text-cream antialiased">{children}</div>;
  }

  const [openOrders, pendingReviews] = await Promise.all([
    db.order.count({ where: { status: "PLACED" } }),
    db.review.count({ where: { status: "pending" } }),
  ]);

  return (
    <div className="dark min-h-screen bg-ink text-cream antialiased">
      <AdminShell
        user={session}
        counts={{ orders: openOrders, reviews: pendingReviews }}
      >
        {children}
      </AdminShell>
    </div>
  );
}
