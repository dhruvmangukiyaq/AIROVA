import "server-only";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay is optional in local dev. When the keys are missing the checkout
 * falls back to a clearly-labelled simulation mode so the full order flow can
 * be exercised without a merchant account.
 */
export function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  const configured = Boolean(keyId && keySecret);
  return { keyId, keySecret, webhookSecret, configured };
}

export function isLive(): boolean {
  return razorpayKeys().configured && process.env.NODE_ENV === "production";
}

export function getRazorpay(): Razorpay | null {
  const { keyId, keySecret, configured } = razorpayKeys();
  if (!configured) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** `order_id|payment_id` → hex HMAC, which Razorpay sends as the signature. */
export function signatureFor(orderId: string, paymentId: string): string {
  const { keySecret } = razorpayKeys();
  return createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const expected = signatureFor(orderId, paymentId);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/** Webhooks are signed with the webhook secret, not the key secret. */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const { webhookSecret } = razorpayKeys();
  if (!webhookSecret || !signature) return false;
  const expected = createHmac("sha256", webhookSecret).update(body).digest("hex");
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function paymentIdFor(orderId: string): string {
  return `pay_sim_${orderId.slice(-12).toLowerCase()}`;
}
