"use client";

import { useState } from "react";
import { Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCart } from "@/store/cart";

/** Server-validated coupon field (shared by drawer, cart page and checkout). */
export function CouponField({ disabled }: { disabled?: boolean }) {
  const { coupon, applyCoupon, summary } = useCart();
  const [code, setCode] = useState(coupon?.code ?? "");
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    const value = code.trim().toUpperCase();
    if (!value) return;
    setLoading(true);
    try {
      const res = await fetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value, subtotal: summary.subtotal }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        coupon?: {
          code: string;
          description: string | null;
          discount: number;
          freeShipping: boolean;
        };
      };
      if (!res.ok || !data.ok || !data.coupon) {
        toast.error(data.error ?? "This coupon can't be applied.");
        return;
      }
      const c = data.coupon;
      applyCoupon(c);
      toast.success(`Coupon ${c.code} applied — you saved ₹${c.discount}.`);
    } catch {
      toast.error("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between border border-gold/40 bg-gold/8 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-2">
          <Tag className="size-3.5 text-gold-deep" />
          <code className="font-semibold tracking-wider">{coupon.code}</code>
          <span className="text-xs text-muted-foreground">
            − ₹{coupon.discount}
          </span>
        </span>
        <button
          type="button"
          onClick={() => applyCoupon(null)}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-destructive"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Coupon code"
        aria-label="Coupon code"
        disabled={disabled || loading}
        className="h-11 flex-1 border-line bg-white text-xs tracking-[0.14em] uppercase"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
      />
      <Button
        type="button"
        variant="ink"
        size="lg"
        onClick={apply}
        disabled={disabled || loading || !code.trim()}
        className="h-11"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
      </Button>
    </div>
  );
}
