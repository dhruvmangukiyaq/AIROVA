"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/admin/panel";

/**
 * Admin error boundary — a failed query or action should never blank the
 * control room. Shows what happened and offers a retry.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Panel className="max-w-lg">
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center border border-destructive/40 bg-destructive/10 text-[#e78a82]">
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-cream">
              Something went wrong in the control room
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-cream/50">
              The request failed unexpectedly. Retrying usually resolves it —
              if it keeps happening, check the server logs.
            </p>
            {error.digest ? (
              <p className="mt-2 font-mono text-[0.62rem] text-cream/35">
                ref {error.digest}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="gold" size="sm" onClick={reset}>
            <RefreshCw className="size-3.5" aria-hidden />
            Try again
          </Button>
        </div>
      </Panel>
    </div>
  );
}
