"use client";

import { MotionConfig } from "framer-motion";

/**
 * Scoped reduced-motion guard for the static pages.
 *
 * `Reveal` relies on framer-motion, which by default animates transforms
 * regardless of the OS setting — wrapping a page in
 * `reducedMotion="user"` makes reveal animations collapse to a plain opacity
 * fade (and skip the translate) whenever the visitor asks for less motion.
 */
export function MotionScope({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
