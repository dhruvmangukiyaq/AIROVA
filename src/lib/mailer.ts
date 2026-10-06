import "server-only";
import { formatPrice, formatOrderDate } from "@/lib/format";
import { SITE } from "@/lib/site";

/**
 * Order confirmation email.
 *
 * No email SDK is bundled — the app ships with a delivery shim so it works
 * out of the box:
 *   1. `RESEND_API_KEY` set  → POSTs to the Resend HTTP API (recommended)
 *   2. otherwise             → renders and logs the message in dev, so the
 *                              flow can be inspected without an account
 * Swap this for SMTP/Nodemailer if you prefer the SMTP_* vars in `.env`.
 */

interface EmailOrder {
  number: string;
  email: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  paymentMethod: string;
  paymentStatus: string;
  placedAt: Date;
  addrName: string;
  addrLine1: string;
  addrLine2: string | null;
  addrCity: string;
  addrState: string;
  addrPincode: string;
  items: { name: string; color: string; size: string; qty: number; price: number }[];
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function renderOrderConfirmation(order: EmailOrder): { subject: string; html: string } {
  const subject = `Order ${order.number} confirmed — AIROVA FOOTWEAR`;

  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #e6e2da;">
          ${escapeHtml(item.name)}<br/>
          <span style="color:#6b675f;font-size:12px;">${escapeHtml(item.color)} · UK ${escapeHtml(item.size)} · Qty ${item.qty}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #e6e2da;font-variant-numeric:tabular-nums;">
          ${formatPrice(item.price * item.qty)}
        </td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#f7f5f0;font-family:Inter,Helvetica,Arial,sans-serif;color:#12110f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e6e2da;">
        <tr><td style="background:#0b0b0c;padding:24px 28px;">
          <p style="margin:0;color:#c8a45d;font-size:11px;letter-spacing:.24em;text-transform:uppercase;">${SITE.name}</p>
          <h1 style="margin:8px 0 0;color:#f7f5f0;font-size:24px;font-weight:500;">Order confirmed</h1>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;">Hi ${escapeHtml(order.addrName.split(" ")[0] || "there")},</p>
          <p style="margin:0 0 20px;color:#6b675f;line-height:1.6;">
            Thanks for shopping with us. We've received order
            <strong style="color:#12110f;">${escapeHtml(order.number)}</strong>
            placed on ${formatOrderDate(order.placedAt)}.
            ${order.paymentStatus === "PAID" ? "Your payment is confirmed." : "Please keep the exact amount ready for cash on delivery."}
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e6e2da;">
            <thead><tr>
              <th align="left" style="padding:12px 0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6b675f;">Item</th>
              <th align="right" style="padding:12px 0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6b675f;">Amount</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr><td style="padding-top:12px;color:#6b675f;">Subtotal</td><td align="right" style="padding-top:12px;font-variant-numeric:tabular-nums;">${formatPrice(order.subtotal)}</td></tr>
              ${order.discount > 0 ? `<tr><td style="color:#6b675f;">Discount</td><td align="right" style="font-variant-numeric:tabular-nums;">− ${formatPrice(order.discount)}</td></tr>` : ""}
              <tr><td style="color:#6b675f;">Shipping</td><td align="right" style="font-variant-numeric:tabular-nums;">${order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</td></tr>
              <tr><td style="padding-top:12px;font-weight:600;border-top:1px solid #e6e2da;">Total</td><td align="right" style="padding-top:12px;font-weight:600;border-top:1px solid #e6e2da;font-variant-numeric:tabular-nums;">${formatPrice(order.total)}</td></tr>
            </tfoot>
          </table>

          <h2 style="font-size:14px;margin:28px 0 6px;">Shipping to</h2>
          <p style="margin:0;color:#6b675f;line-height:1.6;">
            ${escapeHtml(order.addrName)}<br/>
            ${escapeHtml(order.addrLine1)}${order.addrLine2 ? `<br/>${escapeHtml(order.addrLine2)}` : ""}<br/>
            ${escapeHtml(order.addrCity)}, ${escapeHtml(order.addrState)} ${escapeHtml(order.addrPincode)}
          </p>

          <p style="margin:24px 0 0;">
            <a href="${SITE.url}/account/orders" style="display:inline-block;background:#c8a45d;color:#0b0b0c;padding:12px 22px;text-decoration:none;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;">Track your order</a>
          </p>
        </td></tr>
        <tr><td style="background:#0b0b0c;padding:20px 28px;color:#f7f5f0;font-size:12px;line-height:1.7;">
          ${SITE.legalName} · ${SITE.address.line1}, ${SITE.address.line2}<br/>
          Questions? Reply to this email or WhatsApp us on ${SITE.phone}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, html };
}

export async function sendOrderConfirmation(order: EmailOrder): Promise<void> {
  const { subject, html } = renderOrderConfirmation(order);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${SITE.name} <orders@airova.in>`;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [order.email],
          subject,
          html,
        }),
      });
      if (!res.ok) console.error("confirmation email failed", res.status, await res.text());
      return;
    } catch (error) {
      console.error("confirmation email error", error);
      return;
    }
  }

  // No provider configured — surface the message locally instead of failing the order.
  if (process.env.NODE_ENV !== "production") {
    console.info(`\n[email] To: ${order.email}\n[email] Subject: ${subject}\n[email] (${html.length} bytes of HTML — set RESEND_API_KEY to send for real)\n`);
  }
}
