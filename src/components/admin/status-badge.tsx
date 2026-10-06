import { cn } from "cn";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABEL } from "@/lib/types";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "COD_PENDING";
type PaymentMethod = "RAZORPAY" | "COD";

const ORDER_TONE: Record<OrderStatus, string> = {
  PLACED: "border-gold/45 bg-gold/10 text-gold",
  PACKED: "border-[#8a7fa8]/50 bg-[#8a7fa8]/12 text-[#bcb1dd]",
  SHIPPED: "border-[#4f7fb8]/50 bg-[#4f7fb8]/12 text-[#8ab4e6]",
  DELIVERED: "border-[#6d8b62]/55 bg-[#6d8b62]/12 text-[#a9c9a0]",
  CANCELLED: "border-destructive/50 bg-destructive/12 text-[#e78a82]",
  RETURNED: "border-white/15 bg-white/5 text-cream/55",
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  PENDING: "border-gold/40 bg-gold/10 text-gold",
  PAID: "border-[#6d8b62]/55 bg-[#6d8b62]/12 text-[#a9c9a0]",
  FAILED: "border-destructive/50 bg-destructive/12 text-[#e78a82]",
  REFUNDED: "border-white/15 bg-white/5 text-cream/55",
  COD_PENDING: "border-[#4f7fb8]/50 bg-[#4f7fb8]/12 text-[#8ab4e6]",
};

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  COD_PENDING: "COD due",
};

function Pill({
  children,
  tone,
  className,
  title,
}: {
  children: React.ReactNode;
  tone: string;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-5.5 items-center rounded-none border px-2 text-[0.62rem] font-semibold tracking-[0.14em] whitespace-nowrap uppercase",
        tone,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Pill tone={ORDER_TONE[status]}>{ORDER_STATUS_LABEL[status]}</Pill>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Pill tone={PAYMENT_TONE[status]}>{PAYMENT_LABEL[status]}</Pill>;
}

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <Pill
      tone={
        method === "COD"
          ? "border-white/15 bg-white/5 text-cream/65"
          : "border-[#a8823c]/50 bg-[#a8823c]/10 text-[#e7ce97]"
      }
    >
      {method === "COD" ? "COD" : "Razorpay"}
    </Pill>
  );
}

export function ProductStatusBadge({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <Pill
      className={className}
      tone={
        active
          ? "border-[#6d8b62]/55 bg-[#6d8b62]/12 text-[#a9c9a0]"
          : "border-white/15 bg-white/5 text-cream/55"
      }
    >
      {active ? "Active" : "Draft"}
    </Pill>
  );
}

/** Row of gold stars used in review moderation. */
export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden
          className={cn(
            "text-[0.8rem] leading-none",
            n <= rating ? "text-gold" : "text-cream/20",
          )}
        >
          ★
        </span>
      ))}
    </span>
  );
}
