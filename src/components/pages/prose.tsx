import { cn } from "cn";

/**
 * Long-form typography block for policy pages. Headings inherit Playfair from
 * the base layer, so only spacing, colour and link treatment are set here.
 */
export function Prose({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl text-sm leading-[1.8] text-muted-foreground",
        "[&_h2]:mt-11 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-ink sm:[&_h2]:text-2xl",
        "[&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:text-ink",
        "[&_p]:mb-4",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-5",
        "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2.5 [&_ol]:pl-5",
        "[&_li]:marker:text-gold",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-gold/70 [&_a]:transition-colors hover:[&_a]:text-gold-deep",
        "[&_hr]:my-8 [&_hr]:border-line",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Numbered/labelled paragraph pair used inside grids and step lists. */
export function FieldRow({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line py-4 first:border-t-0 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-6">
      <dt className="text-[0.68rem] font-semibold tracking-[0.2em] text-gold-deep uppercase">
        {term}
      </dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:mt-0">
        {children}
      </dd>
    </div>
  );
}
