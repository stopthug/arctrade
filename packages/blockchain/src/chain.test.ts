import { describe, expect, it } from "vitest";
import { NATIVE_TO_ERC20_SCALE, USDC_ERC20, ARC_TESTNET_CHAIN_ID, explorerTxUrl } from "./chain.js";

describe("Arc chain constants", () => {
  it("matches official testnet docs", () => {
    expect(ARC_TESTNET_CHAIN_ID).toBe(5042002);
    expect(USDC_ERC20).toBe("0x3600000000000000000000000000000000000000");
    expect(NATIVE_TO_ERC20_SCALE).toBe(10n ** 12n);
  });

  it("builds explorer urls", () => {
    expect(explorerTxUrl("0xabc")).toBe("https://testnet.arcscan.app/tx/0xabc");
  });
});
