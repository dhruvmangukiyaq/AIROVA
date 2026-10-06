"use client";

import * as React from "react";
import { Check, Clock, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setReviewStatus } from "@/app/(admin)/actions";

type Status = "published" | "pending" | "rejected";

export function ReviewActions({
  reviewId,
  status,
}: {
  reviewId: string;
  status: string;
}) {
  const [pending, startTransition] = React.useTransition();

  const set = (next: Status) => {
    startTransition(async () => {
      const result = await setReviewStatus(reviewId, next);
      if (result.ok) toast.success(result.message ?? "Review updated");
      else toast.error(result.error ?? "Could not update the review");
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status !== "published" ? (
        <Button
          type="button"
          size="xs"
          variant="outline-light"
          disabled={pending}
          onClick={() => set("published")}
        >
          <Check className="size-3" aria-hidden />
          Approve
        </Button>
      ) : null}
      {status !== "rejected" ? (
        <Button
          type="button"
          size="xs"
          variant="destructive"
          disabled={pending}
          onClick={() => set("rejected")}
        >
          <X className="size-3" aria-hidden />
          Reject
        </Button>
      ) : null}
      {status !== "pending" ? (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={pending}
          onClick={() => set("pending")}
          title="Send back to the moderation queue"
        >
          <Clock className="size-3" aria-hidden />
          Hold
        </Button>
      ) : null}
    </div>
  );
}
