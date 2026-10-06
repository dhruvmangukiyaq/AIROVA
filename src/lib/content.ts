import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  siteSettingsSchema,
  type SiteSettings,
} from "@/components/admin/content/site-settings-schema";

export { siteSettingsSchema };
export type { SiteSettings };

/**
 * Homepage content (announcement, hero, promo banners, testimonials, FAQ)
 * lives in a JSON file rather than the database — the Prisma schema has no
 * CMS table and is frozen. Admin edits go through `writeSiteSettings`.
 *
 * The zod schema itself lives in `src/components/admin/content/` so the admin
 * editor can bundle it client-side without pulling `node:fs` into the browser.
 */

const SETTINGS_FILE = path.join(process.cwd(), "src", "content", "site-settings.json");

/** Written to disk on first read if the file is ever missing. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcement:
    "Free shipping over ₹2,999 · Cash on delivery across India · 7-day easy returns",
  hero: {
    eyebrow: "Elements Edition · 2026",
    title: "Step Into Style.",
    subtitle:
      "Sports shoes, sneakers and loafers engineered for Indian streets and Indian weather. Four elements. One standard of craft.",
    ctaLabel: "Shop men",
    ctaHref: "/shop?gender=men",
    image: "/images/products/aqua-water-edition-sports-shoe-1.webp",
  },
  promoBanners: [
    { label: "Shop Men", href: "/shop?gender=men" },
    { label: "Shop Women", href: "/shop?gender=women" },
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Best Sellers", href: "/shop?sort=popular" },
    { label: "Collections", href: "/collections" },
  ],
  testimonials: [
    {
      quote:
        "Wore the Aqua through three weeks of Mumbai rain. Grip is genuinely different — no sliding on wet platform tiles.",
      name: "Rohit S.",
      location: "Mumbai",
      rating: 5,
    },
    {
      quote:
        "Packaging felt like a ₹8k shoe. The Flare gets stopped on the street — people literally ask where they're from.",
      name: "Sneha R.",
      location: "Bengaluru",
      rating: 5,
    },
    {
      quote:
        "Third order now. Sizing is consistent across the loafers and sneakers, which is rare for an Indian brand.",
      name: "Imran Q.",
      location: "Hyderabad",
      rating: 4,
    },
  ],
  faq: [
    {
      q: "How long does delivery take?",
      a: "Metro cities get 2–3 working days, the rest of India 4–7. Every order ships with a tracking link on WhatsApp.",
    },
    {
      q: "What is the returns policy?",
      a: "7 days from delivery, unworn with the original box. We arrange a free pickup for returns anywhere in India.",
    },
    {
      q: "Do you offer cash on delivery?",
      a: "Yes — COD is available across India with no advance payment. A small COD handling fee may apply at checkout.",
    },
    {
      q: "How do I pick my size?",
      a: "AIROVA runs true to size on UK/India fittings. If you are between sizes, go up — and check the size guide on any product page.",
    },
  ],
};

/** Reads the settings file, creating it from the defaults when absent. */
export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await readFile(SETTINGS_FILE, "utf8");
    const parsed = siteSettingsSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch {
    /* missing or corrupt file — fall through and rewrite the defaults */
  }
  await writeSiteSettings(DEFAULT_SITE_SETTINGS);
  return DEFAULT_SITE_SETTINGS;
}

/** Validates and persists the settings file. */
export async function writeSiteSettings(input: unknown): Promise<SiteSettings> {
  const settings = siteSettingsSchema.parse(input);
  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await writeFile(SETTINGS_FILE, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return settings;
}
