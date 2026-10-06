"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteReview } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/account/confirm-dialog";

/** Delete a review with a confirmation; the product rating is recomputed server-side. */
export function ReviewDeleteButton({
  id,
  productName,
}: {
  id: string;
  productName: string;
}) {
  const [pending, startTransition] = useTransition();

  const remove = () => {
    startTransition(async () => {
      const result = await deleteReview(id);
      if (result.ok) toast.success("Review deleted");
      else toast.error(result.error ?? "Could not delete that review.");
    });
  };

  return (
    <ConfirmDialog
      title="Delete this review?"
      description={`Your review of ${productName} will be removed and the product's rating recalculated.`}
      confirmLabel="Delete review"
      destructive
      onConfirm={remove}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={pending}
          className="text-muted-foreground hover:text-destructive"
        >
          {pending ? (
            <Loader2 data-icon="inline-start" className="size-3 animate-spin" />
          ) : (
            <Trash2 data-icon="inline-start" className="size-3" />
          )}
          Delete
        </Button>
      }
    />
  );
}
