"use client";

import { useState } from "react";
import { ArrowRight, MessageCircle, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { whatsappLink } from "@/lib/commerce";
import { cn } from "cn";
import { formatLength, recommendSize, type SizeMatch, type Unit } from "./size-data";

/** Measure once, get a size: the finder sits right under the chart. */
export function SizeFinder() {
  const [raw, setRaw] = useState("");
  const [unit, setUnit] = useState<Unit>("cm");
  const [match, setMatch] = useState<SizeMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(raw);
    if (!raw.trim() || !Number.isFinite(value) || value <= 0) {
      setMatch(null);
      setError("Enter your heel-to-toe foot length as a number.");
      return;
    }
    const lengthCm = unit === "cm" ? value : value * 2.54;
    if (lengthCm < 18 || lengthCm > 34) {
      setMatch(null);
      setError("That length looks off — check the measurement and try again.");
      return;
    }
    setError(null);
    setMatch(recommendSize(lengthCm));
  };

  return (
    <form
      onSubmit={submit}
      className="border border-line bg-paper p-6 sm:p-8"
      aria-labelledby="size-finder-heading"
    >
      <p className="eyebrow">Find my size</p>
      <h3 id="size-finder-heading" className="mt-3 text-2xl text-ink">
        Type your foot length
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Measure heel to toe on a wall, in the socks you usually wear, then enter it below.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="foot-length" className="text-[0.68rem] tracking-[0.2em] uppercase">
            Foot length ({unit === "cm" ? "cm" : "inches"})
          </Label>
          <Input
            id="foot-length"
            name="foot-length"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder={unit === "cm" ? "e.g. 26.0" : "e.g. 10.2"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "foot-length-error" : "foot-length-hint"}
            className="mt-2 h-11 rounded-none border-line bg-background text-base"
          />
        </div>

        <div role="group" aria-label="Measurement unit" className="flex border border-line">
          {(
            [
              { value: "cm", label: "cm" },
              { value: "in", label: "in" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={unit === opt.value}
              onClick={() => setUnit(opt.value)}
              className={cn(
                "h-11 px-5 text-[0.7rem] font-semibold tracking-[0.16em] uppercase transition-colors",
                unit === opt.value ? "bg-ink text-cream" : "text-muted-foreground hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Button type="submit" variant="gold" className="h-11 px-7">
          Get my size
          <ArrowRight data-icon="inline-end" className="size-4" />
        </Button>
      </div>

      <p id="foot-length-hint" className="mt-3 text-[0.72rem] text-muted-foreground">
        Measure both feet and use the larger one.
      </p>

      <div aria-live="polite">
        {error && (
          <p id="foot-length-error" className="mt-4 border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!error && match?.status === "match" && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border border-gold/50 bg-gold/10 px-5 py-4">
            <div className="flex items-center gap-4">
              <Ruler className="size-5 text-gold-deep" aria-hidden />
              <div>
                <p className="text-[0.66rem] tracking-[0.2em] text-gold-deep uppercase">
                  We recommend
                </p>
                <p className="font-display text-2xl text-ink">UK {match.size}</p>
              </div>
            </div>
            <p className="max-w-xs text-[0.78rem] leading-relaxed text-muted-foreground">
              Fits a foot up to {formatLength(match.cm, unit)}. Between sizes? Size up.
            </p>
          </div>
        )}

        {!error && match?.status === "above-range" && (
          <div className="mt-6 border border-line bg-bone px-5 py-4">
            <p className="text-sm text-ink">
              Your foot ({formatLength(match.longest, unit)}+) is larger than our biggest stock
              size, UK 11.
            </p>
            <a
              href={whatsappLink("Hi AIROVA! I'm outside the UK 5–11 size range — can you help?")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.16em] text-gold-deep uppercase link-underline"
            >
              <MessageCircle className="size-3.5" aria-hidden />
              Ask us on WhatsApp
            </a>
          </div>
        )}
      </div>
    </form>
  );
}
