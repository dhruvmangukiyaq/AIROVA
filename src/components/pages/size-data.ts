/**
 * Single source of truth for the size guide: the chart, the finder and the
 * fit notes all read from here so they can never drift apart.
 *
 * `cm` is the recommended foot length (heel to toe) and already includes the
 * ~1 cm of room every AIROVA last is built with.
 */
export interface SizeRow {
  uk: string;
  cm: number;
  eu: string;
  usMen: string;
  usWomen: string;
}

export const SIZE_ROWS: SizeRow[] = [
  { uk: "5", cm: 23.5, eu: "38", usMen: "6", usWomen: "7.5" },
  { uk: "6", cm: 24.4, eu: "39", usMen: "7", usWomen: "8.5" },
  { uk: "7", cm: 25.2, eu: "41", usMen: "8", usWomen: "9.5" },
  { uk: "8", cm: 26.0, eu: "42", usMen: "9", usWomen: "10.5" },
  { uk: "9", cm: 26.9, eu: "43", usMen: "10", usWomen: "11.5" },
  { uk: "10", cm: 27.7, eu: "44", usMen: "11", usWomen: "12.5" },
  { uk: "11", cm: 28.6, eu: "45", usMen: "12", usWomen: "13.5" },
];

export type Unit = "in" | "cm";

export function formatLength(cm: number, unit: Unit): string {
  if (unit === "cm") return `${cm.toFixed(1)} cm`;
  return `${(cm / 2.54).toFixed(1)} in`;
}

export type SizeMatch =
  | { status: "match"; size: string; cm: number }
  | { status: "below-range" }
  | { status: "above-range"; longest: number };

/** Recommend the smallest stocked size that still fits the measured foot. */
export function recommendSize(lengthCm: number): SizeMatch | null {
  if (!Number.isFinite(lengthCm) || lengthCm <= 0) return null;
  const match = SIZE_ROWS.find((row) => row.cm >= lengthCm);
  if (match) return { status: "match", size: match.uk, cm: match.cm };
  const longest = SIZE_ROWS[SIZE_ROWS.length - 1].cm;
  if (lengthCm > longest + 1) return { status: "above-range", longest };
  return { status: "match", size: SIZE_ROWS[SIZE_ROWS.length - 1].uk, cm: longest };
}
