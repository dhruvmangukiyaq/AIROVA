/**
 * Fixed-window in-memory rate limiter.
 *
 * Suitable for a single serverless instance / local dev. On Vercel with
 * multiple concurrent lambdas, swap the Map for Upstash Redis or Vercel KV —
 * `hit()` is the only function that needs a different store.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: Math.ceil(windowMs / 1000) };
  }

  bucket.count += 1;
  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfter };
}

/** Best-effort client IP for rate-limit keys. */
export function clientKey(
  ip: string | null | undefined,
  action: string,
): string {
  return `${action}:${ip ?? "anon"}`;
}
