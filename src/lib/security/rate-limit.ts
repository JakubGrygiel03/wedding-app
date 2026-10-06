type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 2000;

function pruneBuckets(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
    if (buckets.size < MAX_BUCKETS / 2) return;
  }

  const overflow = buckets.size - MAX_BUCKETS;
  if (overflow <= 0) return;

  const keys = buckets.keys();
  for (let i = 0; i < overflow; i += 1) {
    const next = keys.next();
    if (next.done) break;
    buckets.delete(next.value);
  }
}

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  pruneBuckets(now);

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true };
}

export const RATE_LIMITS = {
  adminLogin: { limit: 5, windowMs: 15 * 60 * 1000 },
  adminPassword: { limit: 5, windowMs: 15 * 60 * 1000 },
  rsvpSubmit: { limit: 8, windowMs: 10 * 60 * 1000 },
} as const;
