"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { ArrowLeft, Loader2, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, GENDERS, productSchema } from "@/lib/validators";
import { discountPercent, formatPrice, slugify } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  CheckField,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { MicroLabel, Panel, PanelHeader } from "@/components/admin/panel";
import type { ActionResult } from "@/app/(admin)/schemas";
import { ImagePicker } from "./image-picker";
import { parseColors, parseList, type ColorRow, type ProductOutput, type ProductValues } from "./shared";
import { VariantsEditor } from "./variants-editor";

const GENDER_OPTIONS = GENDERS.map((g) => ({ value: g, label: g.charAt(0) + g.slice(1).toLowerCase() }));

export interface ProductFormProps {
  submit: (values: unknown) => Promise<ActionResult>;
  defaultValues: ProductValues;
  categories: { slug: string; name: string }[];
  collections: { slug: string; name: string }[];
  mode: "create" | "edit";
}

export function ProductForm({
  submit,
  defaultValues,
  categories,
  collections,
  mode,
}: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ProductValues, unknown, ProductOutput>({
    // `productSchema` makes `variants` optional (with a default); the form type
    // only requires it up-front so `useFieldArray` can bind to it.
    resolver: zodResolver(productSchema) as Resolver<ProductValues, unknown, ProductOutput>,
    defaultValues,
    mode: "onBlur",
  });

  const { setValue, setError, formState } = form;
  const nameValue = useWatch({ control: form.control, name: "name" });
  const imagesRaw = useWatch({ control: form.control, name: "images" });
  const colorsRaw = useWatch({ control: form.control, name: "colors" });
  const slugTouched = React.useRef(mode === "edit");
  const price = Number(useWatch({ control: form.control, name: "price" })) || 0;
  const mrp = Number(useWatch({ control: form.control, name: "mrp" })) || 0;
  const active = useWatch({ control: form.control, name: "active" });
  const featured = useWatch({ control: form.control, name: "featured" });
  const bestSeller = useWatch({ control: form.control, name: "bestSeller" });
  const newArrival = useWatch({ control: form.control, name: "newArrival" });
  const pct = discountPercent(price, mrp);

  const images = React.useMemo(() => parseList(imagesRaw), [imagesRaw]);
  const colors = React.useMemo(() => parseColors(colorsRaw), [colorsRaw]);
  const slugRegistration = form.register("slug");

  React.useEffect(() => {
    if (slugTouched.current) return;
    const next = slugify(nameValue ?? "");
    if (next && next !== form.getValues("slug")) {
      setValue("slug", next, { shouldDirty: true });
    }
  }, [nameValue, form, setValue]);

  const setImages = (next: string[]) => setValue("images", next.join("\n"), { shouldDirty: true });
  const setColors = (next: ColorRow[]) =>
    setValue("colors", JSON.stringify(next), { shouldDirty: true });

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    if (values.price > values.mrp) {
      setError("mrp", { message: "MRP must be at least the selling price" });
      return;
    }
    startTransition(async () => {
      const result = await submit(values);
      if (result.ok) {
        toast.success(result.message ?? "Product saved");
        router.push("/admin/products");
        router.refresh();
      } else {
        const message = result.error ?? "Could not save the product";
        setServerError(message);
        toast.error(message);
      }
    });
  });

  const categoryOptions = categories
    .filter((c) => (CATEGORIES as readonly string[]).includes(c.slug))
    .map((c) => ({ value: c.slug, label: c.name }));

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        {serverError ? (
          <p
            role="alert"
            className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-[#f0a49d]"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {serverError}
          </p>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="flex flex-col gap-6 xl:col-span-2">
            <Panel>
              <PanelHeader title="Details" hint="What shoppers see on the product page" />
              <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                <TextField
                  label="Product name"
                  required
                  className="sm:col-span-2"
                  placeholder="Aqua Water Edition Sports Shoe"
                  error={formState.errors.name?.message}
                  {...form.register("name")}
                />
                <TextField
                  label="URL slug"
                  required
                  hint="Auto-generated from the name until you edit it"
                  error={formState.errors.slug?.message}
                  {...slugRegistration}
                  onChange={(e) => {
                    slugTouched.current = true;
                    slugRegistration.onChange(e);
                  }}
                />
                <SelectField
                  label="Gender"
                  options={GENDER_OPTIONS}
                  error={formState.errors.gender?.message}
                  {...form.register("gender")}
                />
                <SelectField
                  label="Category"
                  required
                  options={categoryOptions}
                  error={formState.errors.categorySlug?.message}
                  {...form.register("categorySlug")}
                />
                <SelectField
                  label="Collection"
                  placeholder="No collection"
                  options={collections.map((c) => ({ value: c.slug, label: c.name }))}
                  error={formState.errors.collectionSlug?.message}
                  {...form.register("collectionSlug")}
                />
                <TextAreaField
                  label="Description"
                  required
                  rows={5}
                  className="sm:col-span-2"
                  hint="At least 20 characters — this sells the shoe."
                  error={formState.errors.description?.message}
                  {...form.register("description")}
                />
                <TextAreaField
                  label="Features"
                  rows={4}
                  className="sm:col-span-2"
                  hint="One per line, e.g. “Wave-moulded midsole”"
                  error={formState.errors.features?.message}
                  {...form.register("features")}
                />
                <TextField
                  label="Material"
                  className="sm:col-span-2"
                  placeholder="Breathable knit upper, EVA midsole"
                  error={formState.errors.material?.message}
                  {...form.register("material")}
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Variants & stock"
                hint="Sizes and colourways available to buy"
              />
              <VariantsEditor />
            </Panel>
          </div>

          <div className="flex flex-col gap-6">
            <Panel>
              <PanelHeader title="Pricing" hint="Prices in INR, taxes included" />
              <div className="grid gap-5 px-5 py-5">
                <NumberField
                  label="Selling price"
                  required
                  min={1}
                  error={formState.errors.price?.message}
                  {...form.register("price", { valueAsNumber: true })}
                />
                <NumberField
                  label="MRP"
                  required
                  min={1}
                  hint={
                    pct > 0 ? `${pct}% off · shows as ${formatPrice(price)}` : "No discount yet"
                  }
                  error={formState.errors.mrp?.message}
                  {...form.register("mrp", { valueAsNumber: true })}
                />
                <div className="border border-white/10 bg-white/[0.02] px-3 py-2.5">
                  <MicroLabel>Live preview</MicroLabel>
                  <p className="mt-1 text-sm text-cream tabular-nums">
                    {formatPrice(price)}
                    {pct > 0 ? (
                      <span className="ml-2 text-xs text-cream/40 line-through">
                        {formatPrice(mrp)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <TextField
                  label="Badge"
                  placeholder="New / Best Seller / Sale"
                  hint="Optional pill on the product card"
                  error={formState.errors.badge?.message}
                  {...form.register("badge")}
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Colours" hint="Name + hex, shown as swatches" />
              <div className="flex flex-col gap-3 px-5 py-5">
                <TextField
                  label="Primary colour name"
                  required
                  error={formState.errors.colorName?.message}
                  {...form.register("colorName")}
                />

                {colors.map((color, index) => (
                  <div key={`${color.name}-${index}`} className="flex items-end gap-2">
                    <TextField
                      label={index === 0 ? "Swatch name" : "Name"}
                      className="flex-1"
                      value={color.name}
                      onChange={(e) => {
                        const next = [...colors];
                        next[index] = { ...next[index], name: e.target.value };
                        setColors(next);
                      }}
                    />
                    <label className="flex flex-col gap-2">
                      <span className="text-sm text-cream/75">Hex</span>
                      <span className="flex h-9 items-center gap-2 border border-white/12 bg-white/[0.03] px-2">
                        <input
                          type="color"
                          aria-label={`Colour ${color.name || index + 1} hex`}
                          value={color.hex}
                          onChange={(e) => {
                            const next = [...colors];
                            next[index] = { ...next[index], hex: e.target.value };
                            setColors(next);
                          }}
                          className="size-5 cursor-pointer border-0 bg-transparent p-0"
                        />
                        <input
                          type="text"
                          aria-label={`Hex value for ${color.name || `colour ${index + 1}`}`}
                          value={color.hex}
                          onChange={(e) => {
                            const next = [...colors];
                            next[index] = { ...next[index], hex: e.target.value };
                            setColors(next);
                          }}
                          className="w-20 bg-transparent font-mono text-xs text-cream outline-none"
                        />
                      </span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove colour ${color.name || index + 1}`}
                      className="text-cream/45 hover:text-[#e78a82]"
                      onClick={() => setColors(colors.filter((_, i) => i !== index))}
                    >
                      ×
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="gold-outline"
                  size="sm"
                  onClick={() => setColors([...colors, { name: "", hex: "#111111" }])}
                >
                  Add colour
                </Button>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Gallery" hint="First image is the card cover" />
              <div className="px-5 py-5">
                <ImagePicker images={images} onChange={setImages} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Visibility" hint="Where this product shows up" />
              <div className="grid gap-3 px-5 py-5">
                <CheckField
                  label="Active"
                  hint="Turn off to keep it as a draft"
                  checked={active}
                  onCheckedChange={(v) => setValue("active", v, { shouldDirty: true })}
                />
                <CheckField
                  label="Featured"
                  hint="Homepage rail"
                  checked={featured}
                  onCheckedChange={(v) => setValue("featured", v, { shouldDirty: true })}
                />
                <CheckField
                  label="Best seller"
                  checked={bestSeller}
                  onCheckedChange={(v) => setValue("bestSeller", v, { shouldDirty: true })}
                />
                <CheckField
                  label="New arrival"
                  checked={newArrival}
                  onCheckedChange={(v) => setValue("newArrival", v, { shouldDirty: true })}
                />
              </div>
            </Panel>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-line pt-5">
          <Button asChild variant="ghost" size="sm" type="button">
            <Link href="/admin/products">
              <ArrowLeft className="size-4" aria-hidden />
              Back to products
            </Link>
          </Button>
          <Button type="submit" variant="gold" size="lg" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden />
                {mode === "create" ? "Create product" : "Save changes"}
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
