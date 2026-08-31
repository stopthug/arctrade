export interface RedisLike {
  incr(key: string): Promise<number>;
  pexpire(key: string, ms: number): Promise<unknown>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export async function rateLimit(
  redis: RedisLike,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`;
  const count = await redis.incr(windowKey);
  if (count === 1) {
    await redis.pexpire(windowKey, windowMs);
  }
  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterMs: allowed ? 0 : windowMs - (now % windowMs),
  };
}

export const RATE_LIMITS = {
  telegramCommand: { limit: 30, windowMs: 60_000 },
  tokenSearch: { limit: 20, windowMs: 60_000 },
  price: { limit: 30, windowMs: 60_000 },
  quote: { limit: 10, windowMs: 60_000 },
  tradeCreate: { limit: 5, windowMs: 60_000 },
  auth: { limit: 10, windowMs: 60_000 },
  api: { limit: 120, windowMs: 60_000 },
} as const;
