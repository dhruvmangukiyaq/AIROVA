import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkoutSchema, cartItemSchema } from "@/lib/validators";
import { computeSummary, checkPincode } from "@/lib/commerce";
import type { CartLine } from "@/lib/types";
import { resolveCoupon, COUPON_FAILURE_MESSAGE } from "@/lib/coupon";
import { getSession, getClientIp } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { razorpayKeys } from "@/lib/razorpay";
import { sendOrderConfirmation } from "@/lib/mailer";

export const runtime = "nodejs";

const bodySchema = z.object({
  items: z.array(cartItemSchema).min(1, "Your bag is empty").max(20),
  checkout: checkoutSchema,
});

function todayCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `AIV-${y}${m}${d}`;
}

async function nextOrderNumber(): Promise<string> {
  const prefix = todayCode();
  const latest = await db.order.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const sequence = latest ? Number(latest.number.split("-")[2] ?? 0) + 1 : 1;
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "checkout"), 8, 60_000);
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "Too many checkout attempts — wait a minute." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json(
      { ok: false, error: issue?.message ?? "Check your details.", field: issue?.path.join(".") },
      { status: 400 },
    );
  }

  const { items, checkout } = parsed.data;

  // Serviceability + COD eligibility are decided server-side.
  const pin = checkPincode(checkout.address.pincode);
  if (!pin.serviceable) {
    return Response.json(
      { ok: false, error: "We don't deliver to that pincode yet.", field: "address.pincode" },
      { status: 422 },
    );
  }
  if (checkout.paymentMethod === "COD" && !pin.cod) {
    return Response.json(
      { ok: false, error: "Cash on delivery isn't available for this pincode — pay online instead." },
      { status: 422 },
    );
  }

  /* --------------------------- price the bag --------------------------- */

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({
    where: { id: { in: productIds }, active: true },
    select: { id: true, name: true, slug: true, price: true, mrp: true, images: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const lines: CartLine[] = [];
  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      return Response.json(
        { ok: false, error: "One of the items in your bag is no longer available." },
        { status: 409 },
      );
    }
    const images = JSON.parse(product.images || "[]") as string[];
    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0] ?? "",
      color: item.color,
      size: item.size,
      price: product.price,
      mrp: product.mrp,
      qty: item.qty,
    });
  }

  /* ------------------------------ coupon ------------------------------- */

  let coupon = null;
  if (checkout.couponCode) {
    const outcome = await resolveCoupon(checkout.couponCode, lines.reduce((s, l) => s + l.price * l.qty, 0));
    if (!outcome.ok || !outcome.coupon) {
      return Response.json(
        { ok: false, error: COUPON_FAILURE_MESSAGE[outcome.reason ?? "not_found"] },
        { status: 422 },
      );
    }
    coupon = outcome.coupon;
  }

  // In production, a Razorpay order can only be paid if the merchant keys are
  // configured — refuse up front rather than leaving an unpayable PENDING order.
  if (
    checkout.paymentMethod === "RAZORPAY" &&
    !razorpayKeys().configured &&
    process.env.NODE_ENV === "production"
  ) {
    return Response.json(
      { ok: false, error: "Online payments are not configured yet. Please choose Cash on Delivery." },
      { status: 503 },
    );
  }

  const summary = computeSummary(lines, coupon, checkout.shipping, checkout.paymentMethod === "COD");

  /* ------------------------ reserve stock + order ---------------------- */

  try {
    const result = await db.$transaction(async (tx) => {
      // Reserve stock atomically — `updateMany` with a `stock >= qty` guard.
      for (const item of items) {
        const variant = await tx.variant.findUnique({
          where: { productId_color_size: { productId: item.productId, color: item.color, size: item.size } },
          select: { id: true, stock: true },
        });
        if (!variant) {
          throw new Error(`SIZE_UNAVAILABLE:${item.size}`);
        }
        if (variant.stock < item.qty) {
          throw new Error(variant.stock === 0 ? `OUT_OF_STOCK:${item.size}` : `LOW_STOCK:${item.size}`);
        }
      }

      for (const item of items) {
        const updated = await tx.variant.updateMany({
          where: {
            productId: item.productId,
            color: item.color,
            size: item.size,
            stock: { gte: item.qty },
          },
          data: { stock: { decrement: item.qty } },
        });
        if (updated.count === 0) throw new Error(`OUT_OF_STOCK:${item.size}`);
      }

      const number = await nextOrderNumber();
      const session = await getSession();

      const order = await tx.order.create({
        data: {
          number,
          userId: session?.id ?? null,
          email: checkout.email,
          phone: checkout.phone,
          status: "PLACED",
          paymentMethod: checkout.paymentMethod,
          paymentStatus: checkout.paymentMethod === "COD" ? "COD_PENDING" : "PENDING",
          subtotal: summary.subtotal,
          // `discount` is the money actually taken off `subtotal` (coupon only),
          // so every view can show subtotal − discount + shipping = total.
          discount: summary.couponDiscount,
          shipping: summary.shipping,
          total: summary.total,
          couponCode: coupon?.code ?? null,
          addrName: checkout.address.name,
          addrPhone: checkout.address.phone,
          addrLine1: checkout.address.line1,
          addrLine2: checkout.address.line2 || null,
          addrCity: checkout.address.city,
          addrState: checkout.address.state,
          addrPincode: checkout.address.pincode,
          note: checkout.note ?? null,
          items: {
            create: lines.map((line) => ({
              productId: line.productId,
              name: line.name,
              slug: line.slug,
              image: line.image,
              color: line.color,
              size: line.size,
              price: line.price,
              mrp: line.mrp,
              qty: line.qty,
            })),
          },
        },
      });

      if (coupon) {
        await tx.coupon.update({ where: { code: coupon.code }, data: { usedCount: { increment: 1 } } });
      }

      return order;
    });

    // Confirmation email — never blocks the order if the provider is down.
    const confirmed = await db.order.findUnique({
      where: { id: result.id },
      include: { items: true },
    });
    if (confirmed) await sendOrderConfirmation(confirmed);

    return Response.json({
      ok: true,
      orderId: result.id,
      orderNumber: result.number,
      amount: result.total,
      currency: "INR",
      paymentMethod: checkout.paymentMethod,
      paymentStatus: result.paymentStatus,
      // Simulation mode keeps local checkout testable without Razorpay keys.
      simulate: checkout.paymentMethod === "RAZORPAY" && !razorpayKeys().configured,
      keyId: razorpayKeys().configured ? razorpayKeys().keyId : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("OUT_OF_STOCK:")) {
      return Response.json(
        { ok: false, error: `UK ${message.split(":")[1]} just sold out. Update your bag.` },
        { status: 409 },
      );
    }
    if (message.startsWith("LOW_STOCK:")) {
      return Response.json(
        { ok: false, error: `Not enough stock left for UK ${message.split(":")[1]}.` },
        { status: 409 },
      );
    }
    if (message.startsWith("SIZE_UNAVAILABLE:")) {
      return Response.json(
        { ok: false, error: `UK ${message.split(":")[1]} isn't available in that colour.` },
        { status: 409 },
      );
    }
    console.error("checkout failed", error);
    return Response.json({ ok: false, error: "We couldn't place the order. Try again." }, { status: 500 });
  }
}
