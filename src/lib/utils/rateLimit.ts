/**
 * In-memory sliding window rate limiter.
 * Not shared across serverless instances — suitable for single-process or edge runtime.
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed within the window */
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup every 60s to prevent memory leaks
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, 60_000);
  // Allow process to exit without waiting for cleanup
  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }
}

export function rateLimit(
  key: string,
  { windowMs, max }: RateLimitOptions
): RateLimitResult {
  ensureCleanup(windowMs);

  const now = Date.now();
  const entry = store.get(key) || { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= max) {
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return { success: true, remaining: max - entry.timestamps.length };
}
