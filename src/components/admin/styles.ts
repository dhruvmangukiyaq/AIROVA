import type { CSSProperties } from "react";

/** Shared control styling for admin forms — safe to import from server and client. */
export const CONTROL_CLASS =
  "rounded-none border-white/12 bg-white/[0.03] text-cream placeholder:text-cream/30 dark:bg-input/30";

export const SELECT_CLASS =
  `${CONTROL_CLASS} h-9 w-full appearance-none border px-3 pr-8 text-sm outline-none focus-visible:border-gold/60`;

export const SELECT_STYLE: CSSProperties = {
  colorScheme: "dark",
  backgroundImage:
    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c8a45d' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.5rem center",
  backgroundSize: "1rem",
};
