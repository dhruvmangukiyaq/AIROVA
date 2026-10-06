"use client";

import * as React from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  siteSettingsSchema,
  type SiteSettings,
} from "@/components/admin/content/site-settings-schema";
import { resetSiteSettings, saveSiteSettings } from "@/app/(admin)/actions";
import { MicroLabel, Panel, PanelHeader } from "@/components/admin/panel";
import {
  NumberField,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { ConfirmButton } from "@/components/admin/confirm-button";

type SettingsValues = z.input<typeof siteSettingsSchema>;
type SettingsOutput = z.output<typeof siteSettingsSchema>;

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [pending, startTransition] = React.useTransition();

  const form = useForm<SettingsValues, unknown, SettingsOutput>({
    resolver: zodResolver(siteSettingsSchema) as Resolver<
      SettingsValues,
      unknown,
      SettingsOutput
    >,
    defaultValues: initial,
    mode: "onBlur",
  });

  const banners = useFieldArray({ control: form.control, name: "promoBanners" });
  const testimonials = useFieldArray({
    control: form.control,
    name: "testimonials",
  });
  const faq = useFieldArray({ control: form.control, name: "faq" });

  const errors = form.formState.errors;

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await saveSiteSettings(values);
      if (result.ok) toast.success(result.message ?? "Homepage saved");
      else toast.error(result.error ?? "Could not save the homepage");
    });
  });

  const onReset = () => {
    startTransition(async () => {
      const result = await resetSiteSettings();
      if (result.ok) {
        toast.success(result.message ?? "Homepage reset");
        window.location.reload();
      } else {
        toast.error(result.error ?? "Could not reset the homepage");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Panel>
        <PanelHeader
          title="Announcement bar"
          hint="Single line shown above the header on every page"
        />
        <div className="px-5 py-5">
          <TextAreaField
            label="Message"
            rows={2}
            error={errors.announcement?.message}
            {...form.register("announcement")}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Hero"
          hint="First screen of the storefront"
        />
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <TextField
            label="Eyebrow"
            error={errors.hero?.eyebrow?.message}
            {...form.register("hero.eyebrow")}
          />
          <TextField
            label="Title"
            required
            error={errors.hero?.title?.message}
            {...form.register("hero.title")}
          />
          <TextAreaField
            label="Subtitle"
            className="sm:col-span-2"
            rows={2}
            error={errors.hero?.subtitle?.message}
            {...form.register("hero.subtitle")}
          />
          <TextField
            label="CTA label"
            error={errors.hero?.ctaLabel?.message}
            {...form.register("hero.ctaLabel")}
          />
          <TextField
            label="CTA link"
            hint="Internal path, e.g. /shop?gender=men"
            error={errors.hero?.ctaHref?.message}
            {...form.register("hero.ctaHref")}
          />
          <TextField
            label="Hero image"
            className="sm:col-span-2"
            hint="Public path to an image in /public"
            error={errors.hero?.image?.message}
            {...form.register("hero.image")}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Promo banners"
          hint={`${banners.fields.length} of 8 — the marquee strip under the header`}
          action={
            <Button
              type="button"
              variant="gold-outline"
              size="xs"
              disabled={banners.fields.length >= 8}
              onClick={() =>
                banners.append({ label: "New link", href: "/shop" })
              }
            >
              <Plus className="size-3" aria-hidden />
              Add banner
            </Button>
          }
        />
        <ul className="divide-y divide-ink-line">
          {banners.fields.map((field, index) => (
            <li
              key={field.id}
              className="flex flex-wrap items-end gap-3 px-5 py-4"
            >
              <span className="w-6 shrink-0 pt-6 font-mono text-[0.62rem] text-cream/35 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <TextField
                label="Label"
                className="min-w-40 flex-1"
                error={errors.promoBanners?.[index]?.label?.message}
                {...form.register(`promoBanners.${index}.label`)}
              />
              <TextField
                label="Link"
                className="min-w-52 flex-[2]"
                error={errors.promoBanners?.[index]?.href?.message}
                {...form.register(`promoBanners.${index}.href`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mb-0.5 text-cream/40 hover:text-destructive"
                aria-label={`Remove banner ${index + 1}`}
                onClick={() => banners.remove(index)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
        {banners.fields.length === 0 ? (
          <p className="px-5 py-5 text-sm text-cream/45">
            No banners — the strip will be hidden on the storefront.
          </p>
        ) : null}
      </Panel>

      <Panel>
        <PanelHeader
          title="Testimonials"
          hint={`${testimonials.fields.length} of 6 — shown in the social proof section`}
          action={
            <Button
              type="button"
              variant="gold-outline"
              size="xs"
              disabled={testimonials.fields.length >= 6}
              onClick={() =>
                testimonials.append({
                  quote: "",
                  name: "",
                  location: "",
                  rating: 5,
                })
              }
            >
              <Plus className="size-3" aria-hidden />
              Add testimonial
            </Button>
          }
        />
        <div className="flex flex-col gap-5 px-5 py-5">
          {testimonials.fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-ink-line bg-white/[0.015] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <MicroLabel>Quote {index + 1}</MicroLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-cream/40 hover:text-destructive"
                  aria-label={`Remove testimonial ${index + 1}`}
                  onClick={() => testimonials.remove(index)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <TextAreaField
                  label="Quote"
                  className="sm:col-span-3"
                  rows={2}
                  error={errors.testimonials?.[index]?.quote?.message}
                  {...form.register(`testimonials.${index}.quote`)}
                />
                <TextField
                  label="Name"
                  error={errors.testimonials?.[index]?.name?.message}
                  {...form.register(`testimonials.${index}.name`)}
                />
                <TextField
                  label="Location"
                  error={errors.testimonials?.[index]?.location?.message}
                  {...form.register(`testimonials.${index}.location`)}
                />
                <NumberField
                  label="Rating (1–5)"
                  min={1}
                  max={5}
                  error={errors.testimonials?.[index]?.rating?.message}
                  {...form.register(`testimonials.${index}.rating`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
          ))}
          {testimonials.fields.length === 0 ? (
            <p className="text-sm text-cream/45">
              No testimonials — the section will be hidden.
            </p>
          ) : null}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="FAQ"
          hint={`${faq.fields.length} of 12 — accordion on the homepage`}
          action={
            <Button
              type="button"
              variant="gold-outline"
              size="xs"
              disabled={faq.fields.length >= 12}
              onClick={() => faq.append({ q: "", a: "" })}
            >
              <Plus className="size-3" aria-hidden />
              Add question
            </Button>
          }
        />
        <div className="flex flex-col gap-5 px-5 py-5">
          {faq.fields.map((field, index) => (
            <div key={field.id} className="border border-ink-line bg-white/[0.015] p-4">
              <div className="mb-3 flex items-center justify-between">
                <MicroLabel>Question {index + 1}</MicroLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-cream/40 hover:text-destructive"
                  aria-label={`Remove question ${index + 1}`}
                  onClick={() => faq.remove(index)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              <div className="grid gap-4">
                <TextField
                  label="Question"
                  error={errors.faq?.[index]?.q?.message}
                  {...form.register(`faq.${index}.q`)}
                />
                <TextAreaField
                  label="Answer"
                  rows={2}
                  error={errors.faq?.[index]?.a?.message}
                  {...form.register(`faq.${index}.a`)}
                />
              </div>
            </div>
          ))}
          {faq.fields.length === 0 ? (
            <p className="text-sm text-cream/45">
              No questions — the FAQ section will be hidden.
            </p>
          ) : null}
        </div>
      </Panel>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border border-ink-line bg-[#131317]/95 px-5 py-4 backdrop-blur">
        <MicroLabel>Writes to src/content/site-settings.json</MicroLabel>
        <div className="flex items-center gap-2">
          <ConfirmButton
            title="Reset homepage content?"
            description="Every banner, hero line, testimonial and FAQ returns to the AIROVA defaults. Custom edits are lost."
            confirmLabel="Reset content"
            variant="outline"
            onConfirm={onReset}
            disabled={pending}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </ConfirmButton>
          <Button type="submit" variant="gold" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            Save homepage
          </Button>
        </div>
      </div>
    </form>
  );
}
