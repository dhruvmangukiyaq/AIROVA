"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Loader2, MessageCircle, RotateCcw, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { reorder } from "@/actions/account";
import { buyOnWhatsApp, whatsappLink } from "@/lib/commerce";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";

/**
 * Per-order actions: re-fill the cart from a past order (stock-checked on the
 * server) and the WhatsApp shortcuts shoppers actually use for support.
 */
export function OrderActions({
  orderId,
  orderNumber,
  status,
}: {
  orderId: string;
  orderNumber: string;
  status: string;
}) {
  const { add } = useCart();
  const [pending, startTransition] = useTransition();

  const buyAgain = () => {
    if (pending) return;
    startTransition(async () => {
      const result = await reorder(orderId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not re-order these items.");
        return;
      }
      result.lines.forEach(add);
      toast.success(
        result.skipped
          ? `${result.lines.length} item${result.lines.length === 1 ? "" : "s"} added — ${result.skipped} out of stock.`
          : `${result.lines.length} item${result.lines.length === 1 ? "" : "s"} added to your bag.`,
      );
    });
  };

  const delivered = status === "DELIVERED";
  const returnable = status === "DELIVERED" || status === "RETURNED";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="gold"
        size="sm"
        onClick={buyAgain}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? <Loader2 data-icon="inline-start" className="size-3.5 animate-spin" /> : null}
        Buy again
      </Button>

      <Button type="button" variant="outline" size="sm" asChild>
        <Link href="/cart">
          View bag <Undo2 data-icon="inline-end" className="size-3.5" />
        </Link>
      </Button>

      <Button type="button" variant="whatsapp" size="sm" asChild>
        <a href={buyOnWhatsApp({ orderNumber })} target="_blank" rel="noopener noreferrer">
          <MessageCircle data-icon="inline-start" className="size-3.5" /> Order help
        </a>
      </Button>

      {returnable && (
        <Button type="button" variant="outline" size="sm" asChild>
          <a
            href={whatsappLink(
              `Hi AIROVA! I'd like to ${delivered ? "return" : "check the return status of"} order ${orderNumber}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RotateCcw data-icon="inline-start" className="size-3.5" />
            {delivered ? "Request a return" : "Return status"}
          </a>
        </Button>
      )}
    </div>
  );
}
