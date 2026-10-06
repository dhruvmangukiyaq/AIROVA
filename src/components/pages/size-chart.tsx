"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "cn";
import { SIZE_ROWS, formatLength, type Unit } from "./size-data";

/** UK (India) size chart with an inches ↔ centimetres toggle. */
export function SizeChart() {
  const [unit, setUnit] = useState<Unit>("cm");

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <p className="eyebrow">Foot length by size</p>
        <div
          role="group"
          aria-label="Measurement unit"
          className="flex border border-line bg-paper"
        >
          {(
            [
              { value: "cm", label: "Centimetres" },
              { value: "in", label: "Inches" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={unit === opt.value}
              onClick={() => setUnit(opt.value)}
              className={cn(
                "px-4 py-2 text-[0.66rem] font-semibold tracking-[0.16em] uppercase transition-colors",
                unit === opt.value
                  ? "bg-ink text-cream"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <TableCaption className="text-left">
          AIROVA sizes are UK (India) sizing. Foot length already includes about 1 cm of room,
          so use your bare heel-to-toe measurement. US sizes are shown for men and women.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">UK (IN)</TableHead>
            <TableHead scope="col">Foot length</TableHead>
            <TableHead scope="col">EU</TableHead>
            <TableHead scope="col">US men</TableHead>
            <TableHead scope="col">US women</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SIZE_ROWS.map((row) => (
            <TableRow key={row.uk}>
              <TableCell className="font-semibold text-ink">UK {row.uk}</TableCell>
              <TableCell className="tabular-nums">{formatLength(row.cm, unit)}</TableCell>
              <TableCell className="tabular-nums">{row.eu}</TableCell>
              <TableCell className="tabular-nums">{row.usMen}</TableCell>
              <TableCell className="tabular-nums">{row.usWomen}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
