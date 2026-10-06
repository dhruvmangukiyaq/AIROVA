"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Banknote, Printer } from "lucide-react";
import { toast } from "sonner";
import { markOrderPaid, updateOrderStatus } from "@/app/(admin)/actions";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import type { OrderStatus } from "@/lib/types";

const CHAIN: OrderStatus[] = ["PLACED", "PACKED", "SHIPPED", "DELIVERED"];

const ACTION_LABEL: Record<string, string> = {
  PACKED: "Mark packed",
  SHIPPED: "Mark shipped",
  DELIVERED: "Mark delivered",
};

export function PrintButton() {
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
      <Printer className="size-3.5" aria-hidden />
      Print
    </Button>
  );
}

export function OrderActions({
  orderId,
  status,
  paymentStatus,
  simulate,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: string;
  simulate: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const run = async (action: () => Promise<{ ok: boolean; error?: string; message?: string }>) => {
    setBusy(true);
    try {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Updated");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not update the order");
      }
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (next: OrderStatus) => () => run(() => updateOrderStatus(orderId, next));
  const markPaid = () => run(() => markOrderPaid(orderId));

  const index = CHAIN.indexOf(status);
  const terminal = index === -1;
  const nextSteps = terminal ? [] : CHAIN.slice(index + 1);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-cream/45 uppercase">
          Fulfilment
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {nextSteps.length === 0 ? (
            <p className="text-sm text-cream/45">
              {terminal ? "This order is closed." : "Fully fulfilled — nothing left to do."}
            </p>
          ) : (
            nextSteps.map((step) => (
              <Button
                key={step}
                type="button"
                variant={step === "DELIVERED" ? "gold" : "gold-outline"}
                size="sm"
                disabled={busy}
                onClick={setStatus(step)}
              >
                {ACTION_LABEL[step]}
              </Button>
            ))
          )}
        </div>
      </div>

      {!terminal ? (
        <div className="flex flex-wrap gap-2">
          <ConfirmButton
            title="Cancel this order?"
            description="The customer keeps their items unless you arrange a return — payment, if captured, still needs a refund in Razorpay."
            confirmLabel="Cancel order"
            onConfirm={setStatus("CANCELLED")}
          >
            Cancel order
          </ConfirmButton>
          <ConfirmButton
            title="Mark as returned?"
            description="Use this once the parcel is back with you and restocked."
            confirmLabel="Mark returned"
            onConfirm={setStatus("RETURNED")}
          >
            Return
          </ConfirmButton>
        </div>
      ) : null}

      {paymentStatus !== "PAID" ? (
        <div>
          <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-cream/45 uppercase">
            Payment
          </p>
          <div className="mt-2">
            <ConfirmButton
              title={simulate ? "Simulate a successful payment?" : "Mark this order as paid?"}
              description={
                simulate
                  ? "Razorpay is running without live keys, so this records a simulated capture for local development."
                  : "Record the payment as received — use only when the money has actually landed."
              }
              confirmLabel={simulate ? "Simulate payment" : "Mark paid"}
              variant="gold-outline"
              onConfirm={markPaid}
            >
              <Banknote className="size-3.5" aria-hidden />
              {simulate ? "Simulate payment" : "Mark as paid"}
            </ConfirmButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
