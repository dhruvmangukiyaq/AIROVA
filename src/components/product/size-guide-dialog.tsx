"use client";

import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** UK/India → foot length → EU/US. Matches the fuller chart on /size-guide. */
const SIZE_TABLE: { uk: string; cm: number; eu: string; us: string }[] = [
  { uk: "5", cm: 24.1, eu: "38", us: "6" },
  { uk: "6", cm: 24.8, eu: "39", us: "7" },
  { uk: "7", cm: 25.4, eu: "41", us: "8" },
  { uk: "8", cm: 26.0, eu: "42", us: "9" },
  { uk: "9", cm: 26.7, eu: "43", us: "10" },
  { uk: "10", cm: 27.3, eu: "44.5", us: "11" },
  { uk: "11", cm: 28.0, eu: "46", us: "12" },
];

export function SizeGuideDialog({ triggerVariant = "ghost" }: { triggerVariant?: "ghost" | "outline" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="xs" className="px-0 tracking-[0.14em]">
          <Ruler />
          Size guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <p className="eyebrow">Find your fit</p>
          <DialogTitle className="text-2xl">Size guide</DialogTitle>
          <DialogDescription>
            All AIROVA styles are cut in UK/India sizing and run true to size. Measure your foot
            at the end of the day for the most accurate reading.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <caption className="sr-only">AIROVA size conversion chart</caption>
            <thead>
              <tr className="border-b border-ink text-[0.65rem] tracking-[0.16em] uppercase">
                <th scope="col" className="py-3 text-left font-semibold">UK / India</th>
                <th scope="col" className="py-3 text-left font-semibold">Foot length</th>
                <th scope="col" className="py-3 text-left font-semibold">EU</th>
                <th scope="col" className="py-3 text-left font-semibold">US</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_TABLE.map((row) => (
                <tr key={row.uk} className="border-b border-line">
                  <th scope="row" className="py-3 text-left font-semibold tabular-nums">{row.uk}</th>
                  <td className="py-3 text-muted-foreground tabular-nums">{row.cm} cm</td>
                  <td className="py-3 text-muted-foreground tabular-nums">{row.eu}</td>
                  <td className="py-3 text-muted-foreground tabular-nums">{row.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold">How to measure</h4>
            <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>1. Place your heel against a wall on a sheet of paper.</li>
              <li>2. Mark the tip of your longest toe.</li>
              <li>3. Measure the distance in centimetres.</li>
              <li>4. Match it to the chart — if you&apos;re between sizes, size up.</li>
            </ol>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Still unsure?</h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Our fit team answers on WhatsApp in minutes, and size exchanges are free within
              7 days of delivery.
            </p>
            <a
              href="https://wa.me/919999999999?text=Hi%20AIROVA!%20I%20need%20help%20picking%20a%20size."
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline mt-3 inline-block text-xs font-semibold tracking-[0.12em] text-gold-deep uppercase"
            >
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
