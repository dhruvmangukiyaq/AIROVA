"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  getClientIp,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { loginSchema, orderStatusSchema, productSchema } from "@/lib/validators";
import { slugify } from "@/lib/format";
import { DEFAULT_SITE_SETTINGS, writeSiteSettings } from "@/lib/content";
import {
  adminCouponSchema,
  categorySchema,
  collectionSchema,
  type ActionResult,
  type LoginState,
} from "@/app/(admin)/schemas";

/* ------------------------------ helpers ------------------------------ */

function zodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Please check the highlighted fields.";
  return issue.path.length
    ? `${issue.path.map(String).join(" · ")}: ${issue.message}`
    : issue.message;
}

function dbError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  if (code === "P2002") return "That value is already taken — try a different one.";
  if (code === "P2003") return "A referenced record no longer exists.";
  if (code === "P2025") return "Record not found.";
  return "Could not save the change. Please try again.";
}

const idArg = (id: unknown): string | null =>
  typeof id === "string" && id.length > 0 ? id : null;

/** Newline- or JSON-separated list → string[]. */
function parseList(value: string | undefined): string[] {
  const raw = value?.trim();
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === "string").map((v) => v.trim());
      }
    } catch {
      /* fall through to newline parsing */
    }
  }
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const normalizeFeatures = (value: string | undefined) =>
  JSON.stringify(parseList(value).slice(0, 12));

const normalizeImages = (value: string | undefined) =>
  JSON.stringify(parseList(value).filter((src) => src.startsWith("/images/")).slice(0, 12));

const normalizeColors = (value: string | undefined): string => {
  const raw = value?.trim();
  if (!raw) return "[]";
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return "[]";
    return JSON.stringify(
      parsed
        .filter(
          (c): c is { name: string; hex?: string } =>
            !!c && typeof c === "object" && typeof (c as { name?: unknown }).name === "string",
        )
        .slice(0, 12)
        .map((c) => ({
          name: c.name.slice(0, 40),
          hex: typeof c.hex === "string" && c.hex ? c.hex : "#111111",
        })),
    );
  } catch {
    return "[]";
  }
};

interface VariantRow {
  color: string;
  size: string;
  stock: number;
  sku: string;
}

/** Duplicates inside the submitted set — the DB would reject them anyway. */
function variantProblem(variants: VariantRow[]): string | null {
  const skus = new Set<string>();
  const colourSize = new Set<string>();
  for (const v of variants) {
    const sku = v.sku.trim().toUpperCase();
    const key = `${v.color.trim().toLowerCase()}::${v.size}`;
    if (!sku) return "Every variant row needs a SKU.";
    if (skus.has(sku)) return `Duplicate SKU in the table: ${sku}`;
    if (colourSize.has(key)) return `Duplicate size UK ${v.size} for ${v.color}.`;
    skus.add(sku);
    colourSize.add(key);
  }
  return null;
}

async function skuCollision(skus: string[], excludeProductId?: string): Promise<string | null> {
  if (skus.length === 0) return null;
  const rows = await db.variant.findMany({
    where: { sku: { in: skus }, ...(excludeProductId ? { productId: { not: excludeProductId } } : {}) },
    select: { sku: true },
  });
  return rows.length ? `SKU already in use: ${rows.map((r) => r.sku).join(", ")}` : null;
}

function refreshStorefront() {
  revalidatePath("/", "layout");
}

/* -------------------------------- auth -------------------------------- */

export async function loginAdmin(
  _prev: LoginState | null,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "admin-login"), 6, 60_000);
  if (!limit.ok) {
    return { error: `Too many attempts — wait ${limit.retryAfter}s and try again.` };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });
  if (!parsed.success) return { error: zodError(parsed.error) };

  try {
    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user?.passwordHash || user.role !== "ADMIN") {
      return { error: "Email or password is incorrect." };
    }
    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) return { error: "Email or password is incorrect." };

    await createSession(
      { id: user.id, email: user.email, name: user.name, role: "ADMIN" },
      parsed.data.remember ?? true,
    );
  } catch {
    return { error: "Could not sign you in right now. Try again." };
  }

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------ products ------------------------------ */

export async function createProduct(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  const d = parsed.data;

  const clash = await db.product.findUnique({ where: { slug: d.slug }, select: { id: true } });
  if (clash) return { ok: false, error: "Another product already uses that slug." };

  const problem = variantProblem(d.variants);
  if (problem) return { ok: false, error: problem };

  const collision = await skuCollision(d.variants.map((v) => v.sku));
  if (collision) return { ok: false, error: collision };

  try {
    const product = await db.product.create({
      data: {
        name: d.name,
        slug: d.slug,
        gender: d.gender,
        categorySlug: d.categorySlug,
        collectionSlug: d.collectionSlug || null,
        description: d.description,
        material: d.material || null,
        features: normalizeFeatures(d.features),
        price: d.price,
        mrp: d.mrp,
        colorName: d.colorName,
        colors: normalizeColors(d.colors),
        images: normalizeImages(d.images),
        badge: d.badge || null,
        featured: d.featured,
        bestSeller: d.bestSeller,
        newArrival: d.newArrival,
        active: d.active,
        variants: {
          create: d.variants.map((v) => ({
            color: v.color.trim(),
            size: v.size,
            stock: v.stock,
            sku: v.sku.trim().toUpperCase(),
          })),
        },
      },
    });
    refreshStorefront();
    return { ok: true, id: product.id, message: "Product created." };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const productId = idArg(id);
  if (!productId) return { ok: false, error: "Missing product id." };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  const d = parsed.data;

  const existing = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!existing) return { ok: false, error: "Product not found." };

  const slugClash = await db.product.findUnique({ where: { slug: d.slug }, select: { id: true } });
  if (slugClash && slugClash.id !== productId) {
    return { ok: false, error: "Another product already uses that slug." };
  }

  const problem = variantProblem(d.variants);
  if (problem) return { ok: false, error: problem };

  const collision = await skuCollision(
    d.variants.map((v) => v.sku),
    productId,
  );
  if (collision) return { ok: false, error: collision };

  try {
    const ops: Prisma.PrismaPromise<unknown>[] = [
      db.product.update({
        where: { id: productId },
        data: {
          name: d.name,
          slug: d.slug,
          gender: d.gender,
          categorySlug: d.categorySlug,
          collectionSlug: d.collectionSlug || null,
          description: d.description,
          material: d.material || null,
          features: normalizeFeatures(d.features),
          price: d.price,
          mrp: d.mrp,
          colorName: d.colorName,
          colors: normalizeColors(d.colors),
          images: normalizeImages(d.images),
          badge: d.badge || null,
          featured: d.featured,
          bestSeller: d.bestSeller,
          newArrival: d.newArrival,
          active: d.active,
        },
      }),
      db.variant.deleteMany({ where: { productId } }),
    ];
    if (d.variants.length) {
      ops.push(
        db.variant.createMany({
          data: d.variants.map((v) => ({
            productId,
            color: v.color.trim(),
            size: v.size,
            stock: v.stock,
            sku: v.sku.trim().toUpperCase(),
          })),
        }),
      );
    }
    await db.$transaction(ops);
    refreshStorefront();
    return { ok: true, id: productId, message: "Product updated." };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  const productId = idArg(id);
  if (!productId) return { ok: false, error: "Missing product id." };

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, _count: { select: { orderItems: true } } },
  });
  if (!product) return { ok: false, error: "Product not found." };

  try {
    // Products with order history must survive for receipts — draft them instead.
    if (product._count.orderItems > 0) {
      await db.product.update({ where: { id: productId }, data: { active: false } });
      refreshStorefront();
      return {
        ok: true,
        message: `"${product.name}" has order history, so it was set to Draft instead of deleted.`,
      };
    }
    await db.product.delete({ where: { id: productId } });
    refreshStorefront();
    return { ok: true, message: "Product deleted." };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function updateProductStatus(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin();
  const productId = idArg(id);
  if (!productId) return { ok: false, error: "Missing product id." };
  if (typeof active !== "boolean") return { ok: false, error: "Invalid status." };

  try {
    await db.product.update({ where: { id: productId }, data: { active } });
    refreshStorefront();
    return { ok: true, message: active ? "Product is live." : "Product moved to draft." };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

/* -------------------------------- orders ------------------------------- */

export async function updateOrderStatus(orderId: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idArg(orderId);
  if (!id) return { ok: false, error: "Missing order id." };

  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "order-status"), 40, 60_000);
  if (!limit.ok) return { ok: false, error: "Too many updates — wait a moment." };

  const parsed = orderStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Unknown order status." };

  try {
    const order = await db.order.update({ where: { id }, data: { status: parsed.data } });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin");
    return { ok: true, message: `Order ${order.number} is now ${parsed.data.toLowerCase()}.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function markOrderPaid(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idArg(orderId);
  if (!id) return { ok: false, error: "Missing order id." };

  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "order-paid"), 40, 60_000);
  if (!limit.ok) return { ok: false, error: "Too many updates — wait a moment." };

  try {
    const order = await db.order.update({ where: { id }, data: { paymentStatus: "PAID" } });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin");
    return { ok: true, message: `${order.number} marked as paid.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

/* ------------------------------ customers ----------------------------- */

export async function toggleCustomerRole(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = idArg(userId);
  if (!id) return { ok: false, error: "Missing customer id." };
  if (id === admin.id) return { ok: false, error: "You cannot change your own role." };

  try {
    const user = await db.user.findUnique({ where: { id }, select: { name: true, role: true } });
    if (!user) return { ok: false, error: "Customer not found." };
    const role = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    await db.user.update({ where: { id }, data: { role } });
    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${id}`);
    return {
      ok: true,
      message: `${user.name} is now ${role === "ADMIN" ? "an admin" : "a customer"}.`,
    };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

/* -------------------------------- coupons ------------------------------ */

export async function saveCoupon(input: unknown, id?: string): Promise<ActionResult> {
  await requireAdmin();
  const couponId = id ? idArg(id) : null;
  if (id && !couponId) return { ok: false, error: "Missing coupon id." };

  const parsed = adminCouponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  const d = parsed.data;

  let expiresAt: Date | null = null;
  if (d.expiresAt) {
    expiresAt = new Date(d.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      return { ok: false, error: "Expiry must be a valid date." };
    }
  }

  const clash = await db.coupon.findUnique({ where: { code: d.code }, select: { id: true } });
  if (clash && clash.id !== couponId) {
    return { ok: false, error: `Coupon ${d.code} already exists.` };
  }

  const data = {
    code: d.code,
    description: d.description || null,
    type: d.type,
    value: d.value,
    minOrder: d.minOrder,
    maxDiscount: d.maxDiscount ?? null,
    active: d.active,
    expiresAt,
    usageLimit: d.usageLimit ?? null,
  };

  try {
    const coupon = couponId
      ? await db.coupon.update({ where: { id: couponId }, data })
      : await db.coupon.create({ data });
    revalidatePath("/admin/coupons");
    return { ok: true, id: coupon.id, message: `Coupon ${coupon.code} saved.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  await requireAdmin();
  const couponId = idArg(id);
  if (!couponId) return { ok: false, error: "Missing coupon id." };
  try {
    const coupon = await db.coupon.delete({ where: { id: couponId } });
    revalidatePath("/admin/coupons");
    return { ok: true, message: `Coupon ${coupon.code} deleted.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function toggleCouponActive(id: string): Promise<ActionResult> {
  await requireAdmin();
  const couponId = idArg(id);
  if (!couponId) return { ok: false, error: "Missing coupon id." };
  try {
    const current = await db.coupon.findUnique({ where: { id: couponId }, select: { active: true } });
    if (!current) return { ok: false, error: "Coupon not found." };
    await db.coupon.update({ where: { id: couponId }, data: { active: !current.active } });
    revalidatePath("/admin/coupons");
    return { ok: true, message: current.active ? "Coupon deactivated." : "Coupon activated." };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

/* -------------------------------- reviews ------------------------------ */

export async function setReviewStatus(reviewId: string, status: string): Promise<ActionResult> {
  await requireAdmin();
  const id = idArg(reviewId);
  if (!id) return { ok: false, error: "Missing review id." };

  const parsed = z.enum(["published", "pending", "rejected"]).safeParse(status);
  if (!parsed.success) return { ok: false, error: "Unknown review status." };

  try {
    const review = await db.review.update({
      where: { id },
      data: { status: parsed.data },
      select: { product: { select: { slug: true } } },
    });
    revalidatePath("/admin/reviews");
    revalidatePath(`/product/${review.product.slug}`);
    return { ok: true, message: `Review ${parsed.data}.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

/* -------------------------------- content ------------------------------ */

export async function saveSiteSettings(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const settings = await writeSiteSettings(input);
    revalidatePath("/", "layout");
    revalidatePath("/admin/content");
    return {
      ok: true,
      message: `Homepage saved — ${settings.promoBanners.length} banners, ${settings.faq.length} FAQs.`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) return { ok: false, error: zodError(error) };
    return { ok: false, error: "Could not write src/content/site-settings.json." };
  }
}

export async function resetSiteSettings(): Promise<ActionResult> {
  await requireAdmin();
  try {
    await writeSiteSettings(DEFAULT_SITE_SETTINGS);
    revalidatePath("/", "layout");
    revalidatePath("/admin/content");
    return { ok: true, message: "Homepage content reset to the AIROVA defaults." };
  } catch {
    return { ok: false, error: "Could not reset the settings file." };
  }
}

/* ---------------------------- collections ----------------------------- */

export async function saveCollection(input: unknown, id?: string): Promise<ActionResult> {
  await requireAdmin();
  const collectionId = id ? idArg(id) : null;
  if (id && !collectionId) return { ok: false, error: "Missing collection id." };

  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  const d = parsed.data;
  const slug = d.slug || slugify(d.name);
  if (!slug) return { ok: false, error: "Could not derive a slug from that name." };

  const slugClash = await db.collection.findUnique({ where: { slug }, select: { id: true } });
  if (slugClash && slugClash.id !== collectionId) {
    return { ok: false, error: `Slug "${slug}" is already used by another collection.` };
  }
  const nameClash = await db.collection.findUnique({
    where: { name: d.name },
    select: { id: true },
  });
  if (nameClash && nameClash.id !== collectionId) {
    return { ok: false, error: `Collection "${d.name}" already exists.` };
  }

  const data = {
    name: d.name,
    slug,
    tagline: d.tagline || null,
    story: d.story || null,
    image: d.image || null,
    sortOrder: d.sortOrder,
    active: d.active,
  };

  try {
    const collection = collectionId
      ? await db.collection.update({ where: { id: collectionId }, data })
      : await db.collection.create({ data });
    refreshStorefront();
    return { ok: true, id: collection.id, message: `Collection ${collection.name} saved.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  await requireAdmin();
  const collectionId = idArg(id);
  if (!collectionId) return { ok: false, error: "Missing collection id." };
  try {
    const collection = await db.collection.findUnique({
      where: { id: collectionId },
      select: { name: true, _count: { select: { products: true } } },
    });
    if (!collection) return { ok: false, error: "Collection not found." };
    await db.collection.delete({ where: { id: collectionId } });
    refreshStorefront();
    return {
      ok: true,
      message:
        collection._count.products > 0
          ? `${collection.name} deleted — ${collection._count.products} product(s) are now uncategorised.`
          : `${collection.name} deleted.`,
    };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

/* ----------------------------- categories ----------------------------- */

export async function saveCategory(input: unknown, id?: string): Promise<ActionResult> {
  await requireAdmin();
  const categoryId = id ? idArg(id) : null;
  if (id && !categoryId) return { ok: false, error: "Missing category id." };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  const d = parsed.data;
  const slug = d.slug || slugify(d.name);
  if (!slug) return { ok: false, error: "Could not derive a slug from that name." };

  const slugClash = await db.category.findUnique({ where: { slug }, select: { id: true } });
  if (slugClash && slugClash.id !== categoryId) {
    return { ok: false, error: `Slug "${slug}" is already used by another category.` };
  }
  const nameClash = await db.category.findUnique({ where: { name: d.name }, select: { id: true } });
  if (nameClash && nameClash.id !== categoryId) {
    return { ok: false, error: `Category "${d.name}" already exists.` };
  }

  const data = {
    name: d.name,
    slug,
    description: d.description || null,
    image: d.image || null,
    active: d.active,
  };

  try {
    const category = categoryId
      ? await db.category.update({ where: { id: categoryId }, data })
      : await db.category.create({ data });
    refreshStorefront();
    return { ok: true, id: category.id, message: `Category ${category.name} saved.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const categoryId = idArg(id);
  if (!categoryId) return { ok: false, error: "Missing category id." };

  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: { name: true, _count: { select: { products: true } } },
  });
  if (!category) return { ok: false, error: "Category not found." };
  if (category._count.products > 0) {
    return {
      ok: false,
      error: `${category.name} still has ${category._count.products} product(s) — move them first, or set the category inactive.`,
    };
  }

  try {
    await db.category.delete({ where: { id: categoryId } });
    refreshStorefront();
    return { ok: true, message: `${category.name} deleted.` };
  } catch (error) {
    return { ok: false, error: dbError(error) };
  }
}
