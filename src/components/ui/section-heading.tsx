import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "center",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:mb-12",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={cn(
          "text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]",
          tone === "dark" ? "text-cream" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-xl text-sm leading-relaxed sm:text-base",
            tone === "dark" ? "text-cream/60" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      )}
      {href && (
        <Link
          href={href}
          className={cn(
            "group mt-1 inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors",
            tone === "dark" ? "text-gold hover:text-gold-bright" : "text-ink hover:text-gold-deep",
          )}
        >
          {linkLabel}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

/** Horizontal strip of gold stars with a numeric rating. */
export function StarRating({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <span className="flex" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={cn(
              "size-3.5",
              i < Math.round(rating) ? "fill-gold text-gold" : "fill-line text-line",
            )}
          >
            <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z" />
          </svg>
        ))}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {rating.toFixed(1)}
        {typeof count === "number" && ` (${count})`}
      </span>
    </span>
  );
}
