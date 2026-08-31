export interface RedisSetLike {
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
}

const UPDATE_TTL_SECONDS = 60 * 10;

export async function claimTelegramUpdate(redis: RedisSetLike, updateId: number): Promise<boolean> {
  const key = `tg:update:${updateId}`;
  const ok = await redis.set(key, "1", "EX", UPDATE_TTL_SECONDS, "NX");
  return ok === "OK";
}

export async function claimIdempotencyKey(
  redis: RedisSetLike,
  key: string,
  ttlSeconds = 86_400,
): Promise<boolean> {
  const ok = await redis.set(`idemp:${key}`, "1", "EX", ttlSeconds, "NX");
  return ok === "OK";
}
