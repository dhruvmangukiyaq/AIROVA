"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { whatsappLink } from "@/lib/commerce";
import { cn } from "cn";
import { FAQ_CATEGORIES } from "./faq-data";

/** Searchable, filterable FAQ browser: category chips + grouped accordions. */
export function FaqAccordion() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("all");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_CATEGORIES.filter((c) => active === "all" || c.id === active)
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [query, active]);

  const matches = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      {/* search + category filters */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="faq-search" className="sr-only">
            Search the FAQ
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search — returns, UPI, sizing…"
            className="h-11 rounded-none border-line bg-paper pr-10 pl-9 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-ink"
            >
              <X className="size-4" aria-hidden />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {[{ id: "all", label: "All questions" }, ...FAQ_CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={active === c.id}
              onClick={() => setActive(c.id)}
              className={cn(
                "border px-4 py-2.5 text-[0.66rem] font-semibold tracking-[0.16em] uppercase transition-colors",
                active === c.id
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-paper text-muted-foreground hover:border-gold hover:text-ink",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase" aria-live="polite">
        {matches} {matches === 1 ? "answer" : "answers"}
        {query ? ` for “${query.trim()}”` : ""}
      </p>

      {/* grouped answers */}
      {groups.length > 0 ? (
        <div className="mt-8 space-y-12">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`faq-${group.id}`}>
              <h2 id={`faq-${group.id}`} className="text-2xl text-ink sm:text-3xl">
                {group.label}
              </h2>
              <Accordion type="multiple" className="mt-5 border-t border-line">
                {group.items.map((item, i) => (
                  <AccordionItem
                    key={`${group.id}-${i}`}
                    value={`${group.id}-${i}`}
                    className="border-line"
                  >
                    <AccordionTrigger className="rounded-none py-5 pr-2 text-left text-base leading-snug font-medium text-ink hover:no-underline sm:text-lg">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground sm:text-[0.93rem]">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-line bg-bone px-6 py-10 text-center">
          <p className="font-display text-xl text-ink">Nothing matched that search.</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Try a different word, or ask us directly — a real person replies within minutes,
            10am–7pm, Mon–Sat.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink("Hi AIROVA! I have a question that isn't on the FAQ page.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1f9d55] px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-[#178346]"
            >
              <MessageCircle className="size-4" aria-hidden /> WhatsApp us
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-line bg-paper px-5 py-3 text-[0.7rem] font-semibold tracking-[0.18em] text-ink uppercase transition-colors hover:border-gold"
            >
              Send a message
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
