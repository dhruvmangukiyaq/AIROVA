import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { cn } from "cn";

const TONE: Record<OrderStatus, string> = {
  PLACED: "border-ink/25 bg-ink/5 text-ink",
  PACKED: "border-gold/60 bg-gold/12 text-gold-deep",
  SHIPPED: "border-[#4f7fb8]/45 bg-[#4f7fb8]/10 text-[#36618f]",
  DELIVERED: "border-green-700/40 bg-green-700/10 text-green-800",
  CANCELLED: "border-destructive/40 bg-destructive/10 text-destructive",
  RETURNED: "border-line bg-bone text-muted-foreground",
};

/** Squared status pill shared by the orders list, detail view and overview. */
export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.16em] uppercase",
        TONE[status],
        className,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

/** Compact payment badge — `PAID`, `PENDING`, `COD_PENDING`… */
const PAYMENT_TONE: Record<string, string> = {
  PAID: "text-green-800",
  PENDING: "text-gold-deep",
  COD_PENDING: "text-gold-deep",
  FAILED: "text-destructive",
  REFUNDED: "text-muted-foreground",
};

export function PaymentBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "text-[0.66rem] font-medium tracking-[0.14em] uppercase",
        PAYMENT_TONE[status] ?? "text-muted-foreground",
        className,
      )}
    >
      {status.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
