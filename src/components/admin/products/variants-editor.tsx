"use client";

import * as React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { SIZES } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { CONTROL_CLASS } from "@/components/admin/fields";
import { MicroLabel } from "@/components/admin/panel";
import { makeSku, type ProductValues } from "./shared";

/**
 * Variant matrix: colour × UK size × stock. Rows live inside the product form
 * (`react-hook-form` context) so they submit together with the product.
 */
export function VariantsEditor({ emptyHint }: { emptyHint?: string }) {
  const { control, register, getValues, setValue } =
    useFormContext<ProductValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const [bulkColour, setBulkColour] = React.useState("");

  const slug = useWatch({ control, name: "slug" }) || "product";
  const colourName = useWatch({ control, name: "colorName" }) || "Black";
  const targetColour = bulkColour.trim() || colourName;
  const rows = useWatch({ control, name: "variants" }) ?? [];

  const addRow = () => {
    const rows = getValues("variants") ?? [];
    const usedSizes = new Set(
      rows
        .filter((r) => r.color.toLowerCase() === targetColour.toLowerCase())
        .map((r) => r.size),
    );
    const size = SIZES.find((s) => !usedSizes.has(s)) ?? SIZES[0];
    append({
      color: targetColour,
      size,
      stock: 0,
      sku: makeSku(slug, targetColour, size, rows.map((r) => r.sku)),
    });
  };

  const fillAllSizes = () => {
    const rows = [...(getValues("variants") ?? [])];
    const existing = new Set(
      rows
        .filter((r) => r.color.toLowerCase() === targetColour.toLowerCase())
        .map((r) => r.size),
    );
    for (const size of SIZES) {
      if (existing.has(size)) continue;
      rows.push({
        color: targetColour,
        size,
        stock: 0,
        sku: makeSku(slug, targetColour, size, rows.map((r) => r.sku)),
      });
    }
    setValue("variants", rows, { shouldDirty: true });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 border-b border-ink-line px-5 py-4">
        <div className="min-w-0 flex-1">
          <MicroLabel>
            Variants · {fields.length} row{fields.length === 1 ? "" : "s"}
          </MicroLabel>
          <p className="mt-1 text-xs text-cream/45">
            One row per colour and size. SKUs follow the AIROVA convention and stay unique.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] tracking-[0.16em] text-cream/40 uppercase">Colour</span>
            <input
              type="text"
              value={bulkColour}
              onChange={(e) => setBulkColour(e.target.value)}
              placeholder={colourName}
              aria-label="Colour for new variant rows"
              className={`${CONTROL_CLASS} h-8 w-36 border px-2.5 text-sm`}
            />
          </label>
          <Button type="button" variant="gold-outline" size="sm" onClick={fillAllSizes}>
            <Wand2 className="size-3.5" aria-hidden />
            Fill UK 5–11
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-3.5" aria-hidden />
            Add row
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-cream/40">
          {emptyHint ?? "No variants yet — add a row or fill UK 5–11 for this colour."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left text-[0.62rem] tracking-[0.16em] text-cream/40 uppercase">
                <th scope="col" className="px-5 py-2.5 font-semibold">
                  Colour
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Size
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  Stock
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">
                  SKU
                </th>
                <th scope="col" className="px-5 py-2.5 text-right font-semibold">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-ink-line/70 last:border-0">
                  <td className="px-5 py-2">
                    <input
                      type="text"
                      aria-label={`Colour for row ${index + 1}`}
                      className={`${CONTROL_CLASS} h-8 w-full border px-2.5 text-sm`}
                      {...register(`variants.${index}.color`)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={`Size for row ${index + 1}`}
                      className={`${CONTROL_CLASS} h-8 w-20 border px-2 text-sm`}
                      style={{ colorScheme: "dark" }}
                      {...register(`variants.${index}.size`)}
                    >
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          UK {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      max={9999}
                      aria-label={`Stock for row ${index + 1}`}
                      className={`${CONTROL_CLASS} h-8 w-24 border px-2.5 text-sm tabular-nums`}
                      {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      aria-label={`SKU for row ${index + 1}`}
                      className={`${CONTROL_CLASS} h-8 w-full border px-2.5 font-mono text-xs`}
                      {...register(`variants.${index}.sku`)}
                    />
                  </td>
                  <td className="px-5 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(index)}
                      aria-label={`Remove row ${index + 1} (${rows[index]?.color ?? "variant"} UK ${rows[index]?.size ?? ""})`}
                      className="text-cream/45 hover:text-[#e78a82]"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
