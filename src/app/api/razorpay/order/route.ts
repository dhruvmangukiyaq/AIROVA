import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";
import { getRazorpay, razorpayKeys } from "@/lib/razorpay";

export const runtime = "nodejs";

const bodySchema = z.object({ orderId: z.string().min(1) });

/** Creates the Razorpay order that the checkout.js widget pays against. */
export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "rzp-order"), 20, 60_000);
  if (!limit.ok) {
    return Response.json({ ok: false, error: "Too many attempts." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Missing order reference." }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return Response.json({ ok: false, error: "Order not found." }, { status: 404 });
  if (order.paymentMethod !== "RAZORPAY") {
    return Response.json({ ok: false, error: "This order isn't set to pay online." }, { status: 409 });
  }
  if (order.paymentStatus === "PAID") {
    return Response.json({ ok: false, error: "This order is already paid." }, { status: 409 });
  }

  const { configured, keyId } = razorpayKeys();
  const razorpay = getRazorpay();

  if (!razorpay || !configured) {
    // Local/dev fallback: no merchant keys, so the widget is skipped entirely
    // and the client uses the labelled simulation path instead. In production
    // there is nothing to simulate against, so fail with a clear message.
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { ok: false, error: "Online payments are not configured yet. Please choose Cash on Delivery." },
        { status: 503 },
      );
    }
    return Response.json({
      ok: true,
      simulate: true,
      orderId: order.id,
      orderNumber: order.number,
      amount: order.total,
      currency: "INR",
      keyId: null,
    });
  }

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: order.total * 100,
      currency: "INR",
      receipt: order.number,
      notes: { airovaOrder: order.number },
    });

    // Keep the Razorpay order id on the record so the webhook can find it.
    await db.order.update({ where: { id: order.id }, data: { paymentId: rzpOrder.id } });

    return Response.json({
      ok: true,
      simulate: false,
      orderId: order.id,
      orderNumber: order.number,
      amount: order.total,
      currency: "INR",
      keyId,
      rzpOrderId: rzpOrder.id,
    });
  } catch (error) {
    console.error("razorpay order failed", error);
    return Response.json(
      { ok: false, error: "Could not start the payment. Try Cash on Delivery." },
      { status: 502 },
    );
  }
}
