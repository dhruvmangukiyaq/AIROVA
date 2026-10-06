import type { LucideIcon } from "lucide-react";
import { cn } from "cn";
import { MicroLabel } from "@/components/admin/panel";

/** Single KPI tile: micro-label, oversized figure, contextual note. */
export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  icon?: LucideIcon;
  tone?: "default" | "gold";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-none border border-ink-line bg-[#131317] p-5",
        tone === "gold" && "border-gold/35",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          tone === "gold"
            ? "bg-gradient-to-r from-gold/70 via-gold/30 to-transparent"
            : "bg-gradient-to-r from-white/15 via-white/5 to-transparent",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <MicroLabel>{label}</MicroLabel>
        {Icon ? <Icon className="size-4 text-gold/70" aria-hidden /> : null}
      </div>
      <p className="mt-3 text-[1.9rem] leading-none font-medium tracking-[-0.02em] text-cream tabular-nums">
        {value}
      </p>
      {note ? <p className="mt-2.5 text-xs text-cream/45">{note}</p> : null}
    </div>
  );
}
