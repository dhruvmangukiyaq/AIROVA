import { formatPrice } from "@/lib/format";
import { cn } from "cn";

/** Money is always tabular so columns line up in admin tables. */
export function Money({
  value,
  className,
  prefix,
}: {
  value: number;
  className?: string;
  prefix?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatPrice(value)}
    </span>
  );
}
