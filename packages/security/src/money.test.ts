import { describe, expect, it } from "vitest";
import { getAddress } from "viem";
import {
  assertChecksumAddress,
  isValidEvmAddress,
  parseAmount,
  formatAmount,
  minReceived,
  applyBps,
  fifoConsume,
  lifoConsume,
  calculateServiceFee,
  canTransition,
  transition,
  statusAfterReceipt,
  isHighSlippage,
  assertSlippageBps,
  encryptSecret,
  decryptSecret,
  parseEncryptionKey,
  Decimal,
} from "./index.js";

describe("address validation", () => {
  it("accepts valid addresses", () => {
    expect(isValidEvmAddress("0x3600000000000000000000000000000000000000")).toBe(true);
  });

  it("rejects garbage", () => {
    expect(isValidEvmAddress("not-an-address")).toBe(false);
    expect(isValidEvmAddress("0x123")).toBe(false);
  });

  it("accepts checksummed addresses and rejects invalid ones", () => {
    const checksummed = getAddress("0x89b50855aa3be2f677cd6303cec089b5f319d72a");
    expect(assertChecksumAddress(checksummed)).toBe(checksummed);
    expect(() => assertChecksumAddress("0x89")).toThrow();
  });
});

describe("amount parsing", () => {
  it("parses human amounts to raw", () => {
    expect(parseAmount("25", 6)).toBe(25_000_000n);
    expect(parseAmount("25.5", 6)).toBe(25_500_000n);
  });

  it("rejects extra decimals and negatives", () => {
    expect(() => parseAmount("1.1234567", 6)).toThrow();
    expect(() => parseAmount("-1", 6)).toThrow();
    expect(() => parseAmount("abc", 6)).toThrow();
  });

  it("formats without float", () => {
    expect(formatAmount(25_000_000n, 6)).toBe("25");
    expect(formatAmount(1n, 6)).toBe("0.000001");
  });
});

describe("slippage and min received", () => {
  it("applies slippage down", () => {
    expect(minReceived(10000n, 50)).toBe(9950n);
    expect(minReceived(10000n, 0)).toBe(10000n);
  });

  it("warns on high slippage and enforces max", () => {
    expect(isHighSlippage(500)).toBe(true);
    expect(isHighSlippage(50)).toBe(false);
    expect(() => assertSlippageBps(600, 500)).toThrow();
    assertSlippageBps(50, 500);
  });
});

describe("fees", () => {
  it("calculates bps on notional", () => {
    expect(calculateServiceFee(25_000_000n, 5)).toBe(12_500n);
    expect(applyBps(10_000n, 100)).toBe(100n);
  });
});

describe("FIFO accounting", () => {
  it("realizes P&L in lot order", () => {
    const lots = [
      { quantity: new Decimal("100"), unitCostUsd: new Decimal("1") },
      { quantity: new Decimal("100"), unitCostUsd: new Decimal("2") },
    ];
    const r = fifoConsume(lots, new Decimal("150"), new Decimal("300"));
    expect(r.costBasisConsumed.toString()).toBe("200");
    expect(r.realizedPnlUsd.toString()).toBe("100");
    expect(r.remainingLots).toHaveLength(1);
    expect(r.remainingLots[0]?.quantity.toString()).toBe("50");
  });

  it("LIFO consumes from the end", () => {
    const lots = [
      { quantity: new Decimal("100"), unitCostUsd: new Decimal("1") },
      { quantity: new Decimal("100"), unitCostUsd: new Decimal("2") },
    ];
    const r = lifoConsume(lots, new Decimal("50"), new Decimal("120"));
    expect(r.costBasisConsumed.toString()).toBe("100");
    expect(r.realizedPnlUsd.toString()).toBe("20");
  });
});

describe("trade state machine", () => {
  it("allows the happy path", () => {
    let s = transition("CREATED", "QUOTED");
    s = transition(s, "CONFIRMING");
    s = transition(s, "SIGNING");
    s = transition(s, "SUBMITTED");
    s = transition(s, "PENDING");
    s = transition(s, "CONFIRMED");
    expect(s).toBe("CONFIRMED");
    expect(canTransition("CONFIRMED", "FAILED")).toBe(false);
  });

  it("does not confirm from a hash alone", () => {
    expect(canTransition("SUBMITTED", "CONFIRMED")).toBe(true);
    expect(canTransition("SIGNING", "CONFIRMED")).toBe(false);
    expect(statusAfterReceipt(true)).toBe("CONFIRMED");
    expect(statusAfterReceipt(false)).toBe("FAILED");
  });

  it("rejects illegal transitions", () => {
    expect(() => transition("CREATED", "CONFIRMED")).toThrow();
  });
});

describe("encryption", () => {
  it("round-trips secrets with AAD binding", () => {
    const key = parseEncryptionKey("11".repeat(32));
    const payload = encryptSecret("0xabc", key, "wallet-1|1");
    expect(decryptSecret(payload, key, "wallet-1|1")).toBe("0xabc");
    expect(() => decryptSecret(payload, key, "wallet-2|1")).toThrow();
    expect(payload.ciphertext).not.toContain("0xabc");
  });
});
