import { describe, expect, it } from "vitest";
import { TradingUnavailableError } from "@arctrade/types";
import { UnavailableTradingProvider } from "./providers/unavailable.js";
import { minReceived } from "@arctrade/security";

describe("quote validation", () => {
  it("rejects missing provider quotes", async () => {
    const p = new UnavailableTradingProvider();
    await expect(
      p.getQuote({
        userId: "u",
        walletAddress: "0x3600000000000000000000000000000000000000",
        tokenIn: "0x3600000000000000000000000000000000000000",
        tokenOut: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
        amountInRaw: "1000000",
        slippageBps: 50,
        tradeRequestId: "abc",
      }),
    ).rejects.toBeInstanceOf(TradingUnavailableError);
  });

  it("computes min received from slippage", () => {
    expect(minReceived(59523n, 50).toString()).toBe("59225");
  });
});
