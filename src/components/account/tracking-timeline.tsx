import { Check } from "lucide-react";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { cn } from "cn";

interface Step {
  label: string;
  copy: string;
}

const STEPS: Step[] = [
  { label: "Placed", copy: "We received your order." },
  { label: "Packed", copy: "Packed and labelled at our warehouse." },
  { label: "Shipped", copy: "Handed to our delivery partner." },
  { label: "Delivered", copy: "Dropped off at your address." },
];

const RANK: Record<OrderStatus, number> = {
  PLACED: 1,
  PACKED: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: 1,
  RETURNED: 4,
};

function stamp(value: Date | string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Vertical PLACED → PACKED → SHIPPED → DELIVERED stepper.
 *
 * Only timestamps the database actually holds are printed: `placedAt` for the
 * first step and `updatedAt` for the step that reflects the latest status
 * change. Intermediate steps completed earlier are marked "date not recorded"
 * rather than inventing a delivery history.
 */
export function TrackingTimeline({
  status,
  placedAt,
  updatedAt,
}: {
  status: OrderStatus;
  placedAt: Date | string;
  updatedAt: Date | string;
}) {
  const rank = RANK[status];
  const cancelled = status === "CANCELLED";
  const returned = status === "RETURNED";

  return (
    <div>
      {(cancelled || returned) && (
        <p
          role="status"
          className={cn(
            "mb-6 border px-4 py-3 text-sm",
            cancelled
              ? "border-destructive/40 bg-destructive/8 text-destructive"
              : "border-line bg-bone text-muted-foreground",
          )}
        >
          {cancelled
            ? `This order was cancelled. ${ORDER_STATUS_LABEL.CANCELLED}.`
            : `This order was returned on ${stamp(updatedAt)}.`}
        </p>
      )}

      <ol className="relative">
        {STEPS.map((step, index) => {
          const stepRank = index + 1;
          const done = stepRank <= rank;
          const isLast = index === STEPS.length - 1;

          let when = "Pending";
          if (done) {
            if (stepRank === 1) when = stamp(placedAt);
            else if (stepRank === rank && !returned) when = stamp(updatedAt);
            else when = "Date not recorded";
          } else if (cancelled) {
            when = "Cancelled";
          }

          return (
            <li key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-9 bottom-0 left-[1.1rem] w-px",
                    stepRank < rank ? "bg-gold/60" : "bg-line",
                  )}
                />
              )}

              <span
                aria-hidden
                className={cn(
                  "relative z-10 grid size-9 shrink-0 place-items-center border text-[0.7rem] font-semibold",
                  done
                    ? "border-gold bg-gold text-ink"
                    : "border-line bg-paper text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : stepRank}
              </span>

              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    "text-[0.7rem] font-semibold tracking-[0.16em] uppercase",
                    done ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                <p className="mt-1 text-xs text-muted-foreground/80 tabular-nums">{when}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
