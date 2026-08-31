import Decimal from "decimal.js";

Decimal.set({ precision: 80, rounding: Decimal.ROUND_DOWN });

export { Decimal };

export function parseAmount(input: string, decimals: number): bigint {
  const trimmed = input.trim().replace(/,/g, "");
  if (!trimmed || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Invalid amount.");
  }
  const d = new Decimal(trimmed);
  if (d.isNegative()) throw new Error("Amount must be positive.");
  const scaled = d.mul(new Decimal(10).pow(decimals));
  if (!scaled.isInteger()) {
    throw new Error(`Amount exceeds ${decimals} decimal places.`);
  }
  return BigInt(scaled.toFixed(0));
}

export function formatAmount(raw: bigint, decimals: number, maxFrac = 6): string {
  const d = new Decimal(raw.toString()).div(new Decimal(10).pow(decimals));
  const fixed = d.toFixed(Math.min(maxFrac, decimals), Decimal.ROUND_DOWN);
  return trimTrailingZeros(fixed);
}

export function trimTrailingZeros(value: string): string {
  if (!value.includes(".")) return value;
  return value.replace(/\.?0+$/, "") || "0";
}

export function rawToDecimal(raw: bigint | string, decimals: number): Decimal {
  return new Decimal(raw.toString()).div(new Decimal(10).pow(decimals));
}

export function decimalToRaw(amount: Decimal, decimals: number): bigint {
  const scaled = amount.mul(new Decimal(10).pow(decimals));
  if (!scaled.isInteger()) {
    return BigInt(scaled.toFixed(0, Decimal.ROUND_DOWN));
  }
  return BigInt(scaled.toFixed(0));
}

export function mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error("Division by zero.");
  return (a * b) / denominator;
}

export function applyBpsDown(amount: bigint, bps: number): bigint {
  if (bps < 0) throw new Error("bps must be >= 0");
  return (amount * BigInt(10_000 - bps)) / 10_000n;
}

export function applyBps(amount: bigint, bps: number): bigint {
  if (bps < 0) throw new Error("bps must be >= 0");
  return (amount * BigInt(bps)) / 10_000n;
}

export function minReceived(amountOut: bigint, slippageBps: number): bigint {
  return applyBpsDown(amountOut, slippageBps);
}

export function priceFromAmounts(
  amountIn: bigint,
  inDecimals: number,
  amountOut: bigint,
  outDecimals: number,
): Decimal {
  if (amountIn === 0n) throw new Error("amountIn is zero");
  const inn = rawToDecimal(amountIn, inDecimals);
  const out = rawToDecimal(amountOut, outDecimals);
  return out.div(inn);
}

export function usdFromUsdcRaw(raw: bigint, decimals = 6): string {
  return rawToDecimal(raw, decimals).toFixed(6, Decimal.ROUND_HALF_UP);
}

export function nativeUsdcWeiToUsd(wei: bigint): string {
  return rawToDecimal(wei, 18).toFixed(8, Decimal.ROUND_HALF_UP);
}

export function cmpDecimal(a: string, b: string): number {
  return new Decimal(a).cmp(new Decimal(b));
}
