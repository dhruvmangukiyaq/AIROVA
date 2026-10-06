import { z } from "zod";
import { productSchema } from "@/lib/validators";

export type VariantValue = { color: string; size: string; stock: number; sku: string };

/** Input shape for the form — `variants` is required here (RHF wants arrays). */
export type ProductValues = Omit<z.input<typeof productSchema>, "variants"> & {
  variants: VariantValue[];
};

export type ProductOutput = z.output<typeof productSchema>;

export interface ColorRow {
  name: string;
  hex: string;
}

/** Newline-separated text or a JSON string[] → plain list. */
export function parseList(raw: string | undefined): string[] {
  const value = raw?.trim();
  if (!value) return [];
  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === "string").map((v) => v.trim());
      }
    } catch {
      /* fall through */
    }
  }
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseColors(raw: string | undefined): ColorRow[] {
  const value = raw?.trim();
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (c): c is { name: string; hex?: string } =>
          !!c && typeof c === "object" && typeof (c as { name?: unknown }).name === "string",
      )
      .map((c) => ({ name: c.name, hex: typeof c.hex === "string" && c.hex ? c.hex : "#111111" }));
  } catch {
    return [];
  }
}

const slugInitials = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4) || "PROD";

const colourCode = (color: string) =>
  color.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3) || "COL";

/** Matches the seed's `AIV-XXXX-YYY-9` convention, plus a uniqueness suffix. */
export function makeSku(slug: string, color: string, size: string, taken: Iterable<string>): string {
  const base = `AIV-${slugInitials(slug)}-${colourCode(color)}-${size}`;
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
