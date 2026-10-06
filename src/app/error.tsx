"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/** Route-level error boundary — keeps a bad page from blanking the whole app. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where you would report to Sentry/GA4.
    if (process.env.NODE_ENV === "production") {
      console.error("[airova]", error.digest ?? error.message);
    }
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <p className="eyebrow">Something broke</p>
      <h1 className="text-4xl">We hit a snag</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        That&apos;s on us, not you. Try again — if it keeps happening, message us on WhatsApp and
        we&apos;ll sort it out.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 border border-ink bg-ink px-7 py-3.5 text-[0.74rem] font-semibold tracking-[0.16em] text-cream uppercase transition-colors hover:bg-ink-soft"
      >
        <RotateCcw className="size-4" />
        Try again
      </button>
    </div>
  );
}
