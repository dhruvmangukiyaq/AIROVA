import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";
import { paymentIdFor, razorpayKeys, verifyPaymentSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

async function markPaid(orderId: string, paymentId: string) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID", paymentId, status: "PLACED" },
    select: { number: true, paymentStatus: true },
  });
  return order;
}

/** Confirms a Razorpay payment and flips the order to PAID. */
export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "rzp-verify"), 20, 60_000);
  if (!limit.ok) return Response.json({ ok: false, error: "Too many attempts." }, { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Malformed payment response." }, { status: 400 });
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return Response.json({ ok: false, error: "Order not found." }, { status: 404 });
  if (order.paymentStatus === "PAID") {
    return Response.json({ ok: true, orderNumber: order.number, paymentStatus: "PAID" });
  }

  const { configured } = razorpayKeys();

  if (configured) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return Response.json({ ok: false, error: "Missing payment confirmation." }, { status: 400 });
    }
    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      await db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
      return Response.json({ ok: false, error: "Payment signature verification failed." }, { status: 400 });
    }
    const updated = await markPaid(order.id, razorpayPaymentId);
    return Response.json({ ok: true, orderNumber: updated.number, paymentStatus: "PAID" });
  }

  // Simulation mode — only ever allowed outside production.
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false, error: "Payments are not configured." }, { status: 503 });
  }
  const updated = await markPaid(order.id, razorpayPaymentId ?? paymentIdFor(order.id));
  return Response.json({
    ok: true,
    orderNumber: updated.number,
    paymentStatus: "PAID",
    simulated: true,
  });
}
