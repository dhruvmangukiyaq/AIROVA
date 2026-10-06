# AIROVA FOOTWEAR

**Step Into Style** — a production-ready e-commerce storefront + admin panel for a premium
Indian footwear brand.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Framer Motion ·
Prisma + SQLite · Razorpay

---

## 1. Run it locally

```bash
npm install
npx prisma db push      # create prisma/dev.db from the schema
npx tsx prisma/seed.ts  # seed 15 products, reviews, coupons, demo orders
npm run dev             # http://localhost:3000
```

Or in one go:

```bash
npm run db:reset   # db push --force-reset && seed
npm run dev
```

> Prisma is pinned to **v6** on purpose. Prisma 8 is still an RC and its CLI no longer ships
> `prisma generate` / `prisma db push`. Do not upgrade the `prisma` package without re-reading
> the release notes.

### Demo logins

| Role     | Email                | Password      | Lands on     |
| -------- | -------------------- | ------------- | ------------ |
| Customer | `customer@airova.in` | `Customer@123`| `/account`   |
| Admin    | `admin@airova.in`    | `Admin@123`   | `/admin`     |

Admin is also reachable from the footer link **Admin** (`/admin`).

---

## 2. Environment variables

Copy `.env.example` → `.env` (a working `.env` ships with the repo for local dev).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Prisma datasource. Local: `file:./dev.db`. Prod: your Postgres connection string. |
| `AUTH_SECRET` | ✅ prod | Signs the session JWT. Must be ≥16 chars. Generate: `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | ✅ prod | Canonical URL used by metadata, sitemap, JSON-LD. e.g. `https://airova.example` |
| `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD` | – | Default `2999` (rupees). |
| `NEXT_PUBLIC_SHIPPING_FEE` | – | Default `99`. |
| `NEXT_PUBLIC_EXPRESS_SHIPPING_FEE` | – | Default `199`. |
| `NEXT_PUBLIC_COD_FEE` | – | Default `0`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | – | Digits only, with country code. Default `919999999999`. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | – | Profile URL used in the footer/social band. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | – | Leave **empty** to run checkout in simulation mode. |
| `RAZORPAY_WEBHOOK_SECRET` | – | Verifies `/api/razorpay/webhook` signatures. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | – | Google Analytics 4 — tag is not rendered until set. |
| `NEXT_PUBLIC_META_PIXEL_ID` | – | Meta Pixel — tag is not rendered until set. |
| `RESEND_API_KEY` | – | Sends the order confirmation email. Empty → the rendered email is logged to the dev console instead. |
| `EMAIL_FROM` | – | From header, e.g. `AIROVA FOOTWEAR <orders@airova.in>` |

**Nothing secret is hard-coded.** Every key comes from `process.env`; the Razorpay key id is
even masked in the admin Settings screen.

### Razorpay: live vs. simulation

- **Keys empty (default)** → `POST /api/checkout` returns `simulate: true`, the payment step
  shows a clearly-labelled *TEST MODE* dialog, and `/api/razorpay/verify` marks the order paid.
  Simulation only exists outside production: when `NODE_ENV === "production"` an online
  payment is refused **before** the order is written (`503` — "Online payments are not
  configured yet"), so a live deploy without keys can never collect an unpayable order.
- **Keys set** → a real Razorpay order is created, `checkout.js` opens, the signature is
  verified server-side with `HMAC-SHA256(order_id|payment_id)`, and the webhook
  (`/api/razorpay/webhook`) reconciles missed callbacks.
- **COD** → order is created with `paymentStatus: COD_PENDING` and goes straight to
  `/checkout/success`. COD is auto-disabled for pincodes where it isn't serviceable.

---

## 3. Project structure

```
prisma/
  schema.prisma          Product, Variant, Order, OrderItem, User, Address, Coupon, Review, Wishlist…
  seed.ts                15 products + galleries, 105 variants, reviews, coupons, demo orders
scripts/
  image-manifest.json    source photo → product slug → generated webp/card/thumb paths
public/images/
  products/              *.webp (1600px), *-card.webp (800×800), *-thumb.webp (240px)
  brand/                 logo lockup, transparent logo, monogram, 192px icon
src/
  app/
    (store)/             storefront: home, shop, product, cart, checkout, collections, content pages
    (admin)/             dark-themed admin: dashboard, products, orders, customers, coupons, content
    api/                 search, coupon, newsletter, review, pincode, checkout, razorpay/*
    sitemap.ts robots.ts site.webmanifest error.tsx not-found.tsx
  components/            layout, product, cart, checkout, shop, home, admin, ui (shadcn)
  lib/                   db, auth, catalog, commerce, coupon, razorpay, validators, rate-limit, site
  store/                 cart + wishlist React contexts (localStorage-backed)
  proxy.ts               security headers + /admin route guard (Next 16's middleware)
```

Route groups: `(store)` is light with ink bands, `(admin)` renders inside a `.dark` wrapper.
Design tokens live in `src/app/globals.css`.

---

## 4. Adding a product

### From the admin panel

1. Sign in at `/admin/login` → **Products → Add product**.
2. Fill name, slug (auto-generated), gender, category, collection, description, material,
   features (one per line), price, MRP, colour, badges.
3. **Images** — the picker lists everything already in `public/images/products/`. Paste
   newline-separated paths, primary image first. Each image needs its `-card.webp` twin for
   square cards; if you upload your own, generate both.
4. **Variants** — add a row per size (`UK 5`–`11`) with stock and SKU, or use
   *Generate all sizes* to fill them in one click.
5. Save. The storefront is revalidated immediately (`revalidatePath("/", "layout")`).

### From code / CSV

Edit `prisma/seed.ts` (or write a one-off script) and re-run:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

`Product` fields of note: `price`/`mrp` are integers in rupees; `images`, `colors` and
`features` are **JSON stored in a `String` column** (SQLite has no JSON type) and parsed by
`toProductDTO()` in `src/lib/catalog.ts`.

### Adding photos

`scripts/image-manifest.json` records how each `WhatsApp Image …` was classified. For a new
photo: drop it in `public/images/products/<slug>-<n>.webp`, then also create
`<slug>-<n>-card.webp` (800×800, `object-fit: contain` on `#f7f7f6`) and
`<slug>-<n>-thumb.webp` (240px). Never stretch an image to fill the square.

---

## 5. Where to change things

| What | Where |
| --- | --- |
| Prices / MRP | `prisma/seed.ts` (initial), or Admin → Products |
| Free-shipping threshold & shipping fees | `.env` → `NEXT_PUBLIC_*SHIPPING*` |
| Pincodes / COD eligibility | `checkPincode()` in `src/lib/commerce.ts` (swap for a courier API) |
| Currencies, address, GSTIN, social links | `src/lib/site.ts` (`SITE`) |
| Coupons (logic) | `src/lib/coupon.ts` + `computeSummary()` in `src/lib/commerce.ts` |
| Navbar / footer links | `src/lib/site.ts` (`NAV`, `FOOTER_LINKS`) |
| Colours, fonts, spacing | `src/app/globals.css` (`@theme` tokens) |
| Admin theme (dark) | `.dark` block in `src/app/globals.css` |
| Homepage copy / testimonials / banners | Admin → Content (writes `src/content/site-settings.json`) |
| Rate limits | `src/lib/rate-limit.ts` (in-memory → swap for Upstash/KV on Vercel) |
| SEO titles & descriptions | each route's `export const metadata`, plus `src/app/sitemap.ts` |
| Analytics IDs | `.env` → `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID` |

---

## 6. Deploy to Vercel

### a. Switch SQLite → Postgres (required — Vercel functions are ephemeral)

1. Create a Supabase / Neon / Vercel Postgres database.
2. `prisma/schema.prisma` → change the datasource provider:

   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
   }
   ```

3. Push the schema and seed once:

   ```bash
   DATABASE_URL="postgres://…" npx prisma db push
   DATABASE_URL="postgres://…" npx tsx prisma/seed.ts
   ```

### b. Deploy

```bash
npm i -g vercel
vercel link
vercel env pull .env.production
vercel --prod
```

Or push to GitHub and import the repo in the Vercel dashboard.

### c. Environment on Vercel

Set every row from [§2](#2-environment-variables) in **Project → Settings → Environment
Variables**, especially:

- `DATABASE_URL` (Postgres, pooled)
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL` = your real domain
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`

Then point the Razorpay webhook at `https://<domain>/api/razorpay/webhook` (events:
`payment.captured`, `payment.failed`).

### d. Checklist before going live

- [ ] `AUTH_SECRET` rotated away from the dev fallback
- [ ] Razorpay keys set → simulation mode disabled automatically in production
- [ ] `NEXT_PUBLIC_SITE_URL` correct → sitemap/canonicals/JSON-LD resolve
- [ ] GA4 / Meta Pixel IDs filled in (tags stay dormant otherwise)
- [ ] `npx tsc --noEmit` and `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] Test the loop: browse → filter → PDP → add to bag → coupon → checkout → payment →
      `/admin` → advance order status → customer sees it under Account → Orders

---

## 7. Placeholder pricing

All prices in this repo are **placeholders** so the store looks real out of the box:

| Group | Selling price | MRP |
| --- | --- | --- |
| Elements collections (Aqua / Flare / Aero / Cinder) | ₹3,999 – ₹4,499 | ₹6,499 – ₹6,999 |
| Loafers | ₹2,199 – ₹2,299 | ₹3,499 – ₹3,699 |
| Low-top sneakers | ₹1,999 – ₹2,099 | ₹3,299 – ₹3,499 |

To change them: edit the price/MRP literals in **`prisma/seed.ts`** and re-run
`npx tsx prisma/seed.ts` (or set them per product in **Admin → Products**). The discount %,
cart maths, coupons and order totals are all derived from those two integers, so nothing else
needs touching. `STORE.minPrice` / `STORE.maxPrice` in `src/lib/commerce.ts` only control the
placeholder hints in the price filter.

---

## 8. Quality notes

- **SEO** — per-route metadata + canonicals, Open Graph/Twitter cards, `sitemap.xml`,
  `robots.txt`, `site.webmanifest`, and `Product` / `Order` / `CollectionPage` / `ShoeStore`
  JSON-LD. Clean URLs, no `?id=` routes.
- **Accessibility** — one `<h1>` per page, labelled controls, `aria-invalid` + `role="alert"`
  on form errors, keyboard-operable dialogs/drawers/accordions, visible gold focus ring,
  descriptive `alt` text, `prefers-reduced-motion` guards.
- **Validation** — every write path runs through zod (`src/lib/validators.ts`), client **and**
  server; prices are always recomputed server-side and never trusted from the browser.
- **Security** — HttpOnly `SameSite=Lax` session cookie (JWT via `jose`), bcrypt cost 12,
  rate limiting on search / coupon / newsletter / contact / checkout / payment routes,
  input sanitisation, CSP-ish security headers and a `/admin` guard in `src/proxy.ts`.
- **Performance** — `next/image` everywhere with explicit `sizes`, WebP + AVIF, generated
  square card/thumb variants, `loading="eager"` + `fetchPriority` only above the fold,
  route-level `loading.tsx` skeletons, immutable cache for `/images`.
