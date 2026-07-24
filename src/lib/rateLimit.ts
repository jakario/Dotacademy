import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback
const memoryCache = new Map<string, { count: number; reset: number }>();

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute by default
    analytics: true,
  });
}

export async function checkRateLimit(identifier: string, limit: number = 20, windowMs: number = 60000) {
  if (ratelimit) {
    const { success, limit: max, reset, remaining } = await ratelimit.limit(identifier);
    return { success, remaining, reset };
  } else {
    // In-memory fallback
    const now = Date.now();
    const record = memoryCache.get(identifier);
    if (!record || now > record.reset) {
      memoryCache.set(identifier, { count: 1, reset: now + windowMs });
      return { success: true, remaining: limit - 1, reset: now + windowMs };
    }
    if (record.count >= limit) {
      return { success: false, remaining: 0, reset: record.reset };
    }
    record.count++;
    return { success: true, remaining: limit - record.count, reset: record.reset };
  }
}
