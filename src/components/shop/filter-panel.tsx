"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { STORE } from "@/lib/commerce";
import { CATEGORIES } from "@/lib/validators";
import { formatPrice } from "@/lib/format";
import type { ShopParams } from "@/lib/shop-params";
import { useShopNavigation } from "@/components/shop/use-shop-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FilterOptions {
  colors: string[];
  collections: { name: string; slug: string; count: number }[];
  sizes: string[];
}

const CATEGORY_LABEL: Record<string, string> = {
  sports: "Sports shoes",
  sneakers: "Sneakers",
  loafers: "Loafers",
};

const GENDER_OPTIONS: { value: ShopParams["gender"][number]; label: string }[] = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "UNISEX", label: "Unisex" },
];

function Fieldset({
  legend,
  children,
  defaultOpen = true,
}: {
  legend: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-[0.68rem] font-semibold tracking-[0.2em] text-ink uppercase"
      >
        {legend}
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground transition-transform", !open && "-rotate-90")}
        />
      </button>
      {open && <div className="mt-4 flex flex-col gap-2.5">{children}</div>}
    </div>
  );
}

function ToggleRow({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 text-sm text-ink/80 transition-colors hover:text-ink">
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center border transition-colors",
          checked ? "border-gold bg-gold text-ink" : "border-line bg-paper group-hover:border-ink/40",
        )}
        aria-hidden
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span className="flex-1">{label}</span>
      {hint != null && <span className="text-xs text-muted-foreground tabular-nums">{hint}</span>}
    </label>
  );
}

/** Shared filter body — rendered in the desktop sidebar and the mobile sheet. */
export function FilterPanel({
  params,
  options,
  className,
}: {
  params: ShopParams;
  options: FilterOptions;
  className?: string;
}) {
  const { update } = useShopNavigation(params);
  const [min, setMin] = useState(params.minPrice?.toString() ?? "");
  const [max, setMax] = useState(params.maxPrice?.toString() ?? "");

  const toggleValue = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const applyPrice = () => {
    const minPrice = min ? Math.max(0, Number(min)) : undefined;
    const maxPrice = max ? Math.max(0, Number(max)) : undefined;
    if (Number.isNaN(minPrice ?? 0) || Number.isNaN(maxPrice ?? 0)) return;
    update({ minPrice, maxPrice });
  };

  return (
    <div className={cn("text-sm", className)}>
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <h2 className="text-[0.7rem] font-semibold tracking-[0.24em] text-ink uppercase">
          Filters
        </h2>
        <button
          type="button"
          onClick={() => {
            setMin("");
            setMax("");
            update({
              gender: [],
              category: [],
              collection: [],
              color: [],
              size: [],
              minPrice: undefined,
              maxPrice: undefined,
              q: "",
            });
          }}
          className="text-[0.65rem] tracking-[0.14em] text-gold-deep uppercase underline-offset-4 hover:underline"
        >
          Clear all
        </button>
      </div>

      <Fieldset legend="Shop for">
        {GENDER_OPTIONS.map((g) => (
          <ToggleRow
            key={g.value}
            label={g.label}
            checked={params.gender.includes(g.value)}
            onChange={() => update({ gender: toggleValue(params.gender, g.value) })}
          />
        ))}
      </Fieldset>

      <Fieldset legend="Category">
        {CATEGORIES.map((c) => (
          <ToggleRow
            key={c}
            label={CATEGORY_LABEL[c] ?? c}
            checked={params.category.includes(c)}
            onChange={() => update({ category: toggleValue(params.category, c) })}
          />
        ))}
      </Fieldset>

      <Fieldset legend="Collection">
        {options.collections.map((c) => (
          <ToggleRow
            key={c.slug}
            label={c.name}
            hint={String(c.count)}
            checked={params.collection.includes(c.slug)}
            onChange={() => update({ collection: toggleValue(params.collection, c.slug) })}
          />
        ))}
      </Fieldset>

      <Fieldset legend="Colour" defaultOpen={false}>
        {options.colors.map((color) => (
          <ToggleRow
            key={color}
            label={color}
            checked={params.color.includes(color)}
            onChange={() => update({ color: toggleValue(params.color, color) })}
          />
        ))}
      </Fieldset>

      <Fieldset legend="Size">
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => {
            const active = params.size.includes(size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={active}
                onClick={() => update({ size: toggleValue(params.size, size) })}
                className={cn(
                  "grid h-9 min-w-10 place-items-center border px-2 text-xs font-medium tabular-nums transition-colors",
                  active
                    ? "border-ink bg-ink text-cream"
                    : "border-line bg-paper text-ink hover:border-ink/50",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">UK/India sizing</p>
      </Fieldset>

      <Fieldset legend="Price">
        <div className="flex items-center gap-2">
          <Label htmlFor="price-min" className="sr-only">
            Minimum price
          </Label>
          <Input
            id="price-min"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={String(STORE.minPrice)}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            className="h-10 rounded-none tabular-nums"
          />
          <span className="text-muted-foreground">—</span>
          <Label htmlFor="price-max" className="sr-only">
            Maximum price
          </Label>
          <Input
            id="price-max"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={String(STORE.maxPrice)}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            className="h-10 rounded-none tabular-nums"
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setMin("1999");
              setMax("2999");
              update({ minPrice: 1999, maxPrice: 2999 });
            }}
          >
            {formatPrice(1999)}–{formatPrice(2999)}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => {
              setMin("3000");
              setMax("4499");
              update({ minPrice: 3000, maxPrice: 4499 });
            }}
          >
            {formatPrice(3000)}+
          </Button>
        </div>
      </Fieldset>
    </div>
  );
}
