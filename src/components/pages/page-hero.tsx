import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Dark ink band that opens every static page: breadcrumb, gold eyebrow,
 * one large Playfair h1 and a single-line description.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      {/* ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-24 size-[30rem] rounded-full bg-gold/12 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.3] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [background-size:34px_34px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="shell relative py-14 sm:py-20 lg:py-24">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-[0.66rem] font-semibold tracking-[0.2em] text-cream/45 uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-gold">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li key={crumb.href} className="flex items-center gap-2">
                    <ChevronRight className="size-3 text-gold/50" aria-hidden />
                    {isLast ? (
                      <span aria-current="page" className="text-gold">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link href={crumb.href} className="transition-colors hover:text-gold">
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-[clamp(2.1rem,5.4vw,3.75rem)] leading-[1.03] font-medium tracking-[-0.02em] text-cream">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/60 sm:text-base">
            {description}
          </p>
        )}
        <div
          aria-hidden
          className="mt-8 h-px w-24 bg-gradient-to-r from-gold to-transparent"
        />
      </div>

      <div className="rule-gold" />
    </section>
  );
}
