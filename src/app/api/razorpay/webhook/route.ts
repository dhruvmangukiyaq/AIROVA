import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

/**
 * Razorpay webhook — the source of truth for payment state. The client-side
 * verify call is a UX convenience; this is what reconciles missed callbacks.
 */
export async function POST(request: NextRequest) {
  const ip = await getClientIp();
  const limit = rateLimit(clientKey(ip, "rzp-webhook"), 60, 60_000);
  if (!limit.ok) return new Response("rate limited", { status: 429 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    return new Response("invalid signature", { status: 400 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return Response.json({ received: true });

  const order = await db.order.findFirst({ where: { paymentId: payment.order_id } });
  if (!order) return Response.json({ received: true, note: "unknown order" });

  if (event.event === "payment.captured" || payment.status === "captured") {
    if (order.paymentStatus !== "PAID") {
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", paymentId: payment.id ?? order.paymentId },
      });
    }
  }

  if (event.event === "payment.failed") {
    await db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
  }

  return Response.json({ received: true });
}
