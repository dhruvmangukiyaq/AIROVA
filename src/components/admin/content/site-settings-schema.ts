import { z } from "zod";

/**
 * Pure schema for homepage content — no `node:` imports, so it is safe to
 * bundle into client components (the admin editor validates with it) as well
 * as server code. `src/lib/content.ts` re-exports these for persistence.
 */

export const bannerSchema = z.object({
  label: z.string().trim().min(1).max(40),
  href: z.string().trim().min(1).max(200),
});

export const testimonialSchema = z.object({
  quote: z.string().trim().min(4).max(400),
  name: z.string().trim().min(1).max(60),
  location: z.string().trim().max(60).default(""),
  rating: z.number().int().min(1).max(5),
});

export const faqSchema = z.object({
  q: z.string().trim().min(2).max(160),
  a: z.string().trim().min(2).max(600),
});

export const siteSettingsSchema = z.object({
  announcement: z.string().trim().max(240),
  hero: z.object({
    eyebrow: z.string().trim().max(80),
    title: z.string().trim().min(2).max(80),
    subtitle: z.string().trim().max(320),
    ctaLabel: z.string().trim().max(40),
    ctaHref: z.string().trim().max(200),
    image: z.string().trim().max(240),
  }),
  promoBanners: z.array(bannerSchema).max(8),
  testimonials: z.array(testimonialSchema).max(6),
  faq: z.array(faqSchema).max(12),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
