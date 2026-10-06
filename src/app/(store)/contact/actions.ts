"use server";

import { headers } from "next/headers";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { contactSchema, sanitizeText, type ContactInput } from "@/lib/validators";

/**
 * Server action behind the contact form: re-validates the payload, applies a
 * fixed-window rate limit per visitor, sanitises free text and hands it off.
 */
export async function submitContact(
  input: ContactInput,
): Promise<{ ok: boolean; message: string }> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Please check the form and try again." };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const limit = rateLimit(clientKey(ip, "contact"), 4, 60_000);
  if (!limit.ok) {
    return {
      ok: false,
      message: `Too many messages from this device — try again in ${limit.retryAfter} seconds.`,
    };
  }

  const payload = {
    name: sanitizeText(parsed.data.name),
    email: parsed.data.email,
    phone: parsed.data.phone ? sanitizeText(parsed.data.phone) : null,
    subject: sanitizeText(parsed.data.subject),
    message: sanitizeText(parsed.data.message),
    receivedAt: new Date().toISOString(),
  };

  // Email provider hook: pass `payload` to Resend / SES / an SMTP transport here.
  // No provider is wired up yet, so it is logged for now.
  console.info("[contact]", payload);

  return {
    ok: true,
    message: "Thanks — your message is with us. We reply within one business day.",
  };
}
