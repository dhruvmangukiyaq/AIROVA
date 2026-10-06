import { cn } from "cn";

/** Thin-bordered dark surface used by every admin module. */
export function Panel({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-none border border-ink-line bg-[#131317] transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-ink-line px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[0.68rem] font-semibold tracking-[0.2em] text-cream/70 uppercase">
          {title}
        </h2>
        {hint ? <p className="mt-1 text-xs text-cream/45">{hint}</p> : null}
      </div>
      {action}
    </header>
  );
}

/** Uppercase, letterspaced micro label — the admin's connective tissue. */
export function MicroLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[0.62rem] font-semibold tracking-[0.18em] text-cream/45 uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
