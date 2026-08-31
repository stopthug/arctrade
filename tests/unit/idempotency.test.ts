import { describe, expect, it } from "vitest";
import { claimIdempotencyKey } from "@arctrade/security";

class MemoryRedis {
  store = new Map<string, string>();
  async set(key: string, value: string, ...args: unknown[]) {
    const nx = args.includes("NX");
    if (nx && this.store.has(key)) return null;
    this.store.set(key, value);
    return "OK";
  }
}

describe("idempotency", () => {
  it("claims a key only once", async () => {
    const redis = new MemoryRedis();
    const first = await claimIdempotencyKey(redis as never, "trade-1");
    const second = await claimIdempotencyKey(redis as never, "trade-1");
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
