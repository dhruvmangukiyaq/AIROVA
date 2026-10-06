"use client";

import { formatPrice } from "@/lib/format";
import type { PriceSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Free-shipping progress strip used in the cart drawer and cart page. */
export function FreeShippingBar({ summary }: { summary: PriceSummary }) {
  const pct = summary.freeShippingUnlocked
    ? 100
    : Math.min(100, Math.round((1 - summary.amountToFreeShipping / summary.freeShippingThreshold) * 100));

  return (
    <div className="border border-line bg-bone/60 px-4 py-3">
      <p className="mb-2 text-[0.7rem] tracking-wide">
        {summary.freeShippingUnlocked ? (
          <span className="font-semibold text-green-700">
            🎉 You&apos;ve unlocked free shipping
          </span>
        ) : (
          <>
            Add{" "}
            <strong className="text-ink">
              {formatPrice(summary.amountToFreeShipping)}
            </strong>{" "}
            more for free shipping
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Free shipping progress"
        className="h-1 w-full bg-line"
      >
        <div
          className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface RowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  muted?: boolean;
  strong?: boolean;
}

function Row({ label, value, muted, strong }: RowProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4",
        strong ? "text-base font-semibold" : "text-sm",
        muted ? "text-muted-foreground" : "",
      )}
    >
      <span>{label}</span>
      <span className={cn("tabular-nums", strong && "text-ink")}>{value}</span>
    </div>
  );
}

export function PriceSummary({
  summary,
  showFreeShippingBar = true,
  couponCode,
  onRemoveCoupon,
}: {
  summary: PriceSummary;
  showFreeShippingBar?: boolean;
  couponCode?: string | null;
  onRemoveCoupon?: () => void;
}) {
  return (
    <div className="space-y-3">
      {showFreeShippingBar && <FreeShippingBar summary={summary} />}

      <div className="space-y-2 border border-line p-4">
        <Row label="Subtotal" value={formatPrice(summary.subtotal)} />
        {summary.savings > 0 && (
          <Row
            label="MRP savings"
            muted
            value={<span className="text-green-700">− {formatPrice(summary.savings)}</span>}
          />
        )}
        {summary.couponDiscount > 0 && (
          <Row
            label={
              <span className="inline-flex items-center gap-2">
                Coupon {couponCode && <code className="text-[0.65rem] text-gold-deep">{couponCode}</code>}
                {onRemoveCoupon && (
                  <button
                    type="button"
                    onClick={onRemoveCoupon}
                    className="text-[0.65rem] text-muted-foreground underline underline-offset-2 hover:text-destructive"
                  >
                    remove
                  </button>
                )}
              </span>
            }
            value={
              <span className="text-green-700">− {formatPrice(summary.couponDiscount)}</span>
            }
          />
        )}
        <Row
          label="Shipping"
          value={
            summary.shipping === 0 ? (
              <span className="text-green-700">Free</span>
            ) : (
              formatPrice(summary.shipping)
            )
          }
        />
        <div className="rule-gold my-2" />
        <Row strong label="Total" value={formatPrice(summary.total)} />
        <p className="text-right text-[0.68rem] text-muted-foreground">
          Inclusive of all taxes
        </p>
      </div>
    </div>
  );
}
