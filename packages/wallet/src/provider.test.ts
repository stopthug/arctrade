import { describe, expect, it } from "vitest";
import type { WalletProvider } from "./provider.js";

describe("WalletProvider contract", () => {
  it("declares the required methods", () => {
    const methods: (keyof WalletProvider)[] = [
      "createWallet",
      "getAddress",
      "getBalance",
      "signTransaction",
      "sendTransaction",
      "getTransaction",
      "estimateGas",
    ];
    expect(methods).toHaveLength(7);
  });
});
