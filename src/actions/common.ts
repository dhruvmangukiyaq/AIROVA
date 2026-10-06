import "server-only";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getClientIp, getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import type { SessionUser } from "@/lib/types";
import type { ActionState } from "@/actions/state";

/**
 * Server-only helpers shared by the account actions and pages.
 *
 * Deliberately *not* a `"use server"` module: pages import these too, and a
 * `"use server"` file may only export async functions — so helpers such as
 * `safeNext` could not live there. The browser-facing contract itself lives
 * in `./state`, which stays importable from client components.
 */

/**
 * Fixed-window limit keyed by client IP + action. Returns the error state to
 * hand back when the caller is going too fast, otherwise `null`.
 */
export async function guardRateLimit(action: string, limit = 8): Promise<ActionState | null> {
  const ip = await getClientIp();
  const result = rateLimit(clientKey(ip, action), limit, 60_000);
  if (result.ok) return null;
  return {
    ok: false,
    error: `Too many attempts. Try again in ${result.retryAfter} second${result.retryAfter === 1 ? "" : "s"}.`,
  };
}

/** Zod v4 issues → `{ field: ["message"] }` so forms can render inline errors. */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/**
 * Only same-origin absolute paths survive `?next=`, so a crafted
 * `?next=//evil.com` can never bounce a customer off-site.
 */
export function safeNext(
  value: string | string[] | undefined,
  fallback = "/account",
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw === "/account/login" || raw === "/account/register") return fallback;
  return raw;
}

/**
 * Route guard for every `/account/**` page.
 *
 * The account layout cannot tell which child it is rendering —
 * `/account/login` shares it — so the redirect (with an accurate `?next=`)
 * lives with the page instead of the layout.
 */
export async function requireAccount(next: string): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return session;
}

/** `+91 98765 43210` / `919876543210` → `9876543210`. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/**
 * Recomputes `product.rating` / `product.reviewCount` from published reviews —
 * called after every review insert or delete so the catalogue never drifts
 * from what shoppers can actually read.
 */
export async function recomputeProductRating(productId: string): Promise<void> {
  const published = await db.review.findMany({
    where: { productId, status: "published" },
    select: { rating: true },
  });
  const count = published.length;
  const avg = count ? published.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  await db.product.update({
    where: { id: productId },
    data: { rating: Math.round(avg * 10) / 10, reviewCount: count },
  });
}
