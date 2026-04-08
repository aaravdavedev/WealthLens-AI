/**
 * WealthLens AI — API Rate Limiter
 * Sliding-window counter per IP address.
 * Default: 20 requests per 60-second window.
 */

interface WindowRecord {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowRecord>();

// Clean up old entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store) {
      if (now - record.windowStart > 120_000) store.delete(key);
    }
  }, 300_000);
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds until window resets
}

export function rateLimit(
  ip: string,
  maxRequests = 20,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now - record.windowStart >= windowMs) {
    // New window
    store.set(ip, { count: 1, windowStart: now });
    return { ok: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  record.count++;
  const retryAfter = Math.ceil((windowMs - (now - record.windowStart)) / 1000);

  if (record.count > maxRequests) {
    return { ok: false, remaining: 0, retryAfter };
  }

  return { ok: true, remaining: maxRequests - record.count, retryAfter: 0 };
}

/** Extract client IP from Next.js request */
export function getClientIp(req: import("next/server").NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}
