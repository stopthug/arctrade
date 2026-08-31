import { describe, expect, it } from "vitest";

describe("database package", () => {
  it("exports prisma client constructor surface", async () => {
    const mod = await import("./index.js");
    expect(mod.prisma).toBeDefined();
  });
});
