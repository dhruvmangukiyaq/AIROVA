import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { CouponsClient } from "./coupons-client";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  await requireAdmin();

  const coupons = await db.coupon.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Percentage and flat discounts customers apply at checkout. Codes validate server-side before any order is created."
      />
      <CouponsClient coupons={coupons} />
    </div>
  );
}
