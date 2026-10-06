import type { ReactNode } from "react";
import { cn } from "cn";

/** Page header used by every `/account/**` route — one `<h1>` per page. */
export function AccountHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 border-b border-ink pb-6 sm:mb-10", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-3xl leading-[1.08] text-ink sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
