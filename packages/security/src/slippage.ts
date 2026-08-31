export function assertSlippageBps(bps: number, maxBps: number): void {
  if (!Number.isInteger(bps) || bps < 0) {
    throw new Error("Slippage must be a non-negative integer in basis points.");
  }
  if (bps > maxBps) {
    throw new Error(`Slippage exceeds maximum of ${maxBps / 100}%.`);
  }
}

export function isHighSlippage(bps: number, warnAtBps = 300): boolean {
  return bps >= warnAtBps;
}

export const SLIPPAGE_PRESETS_BPS = [10, 50, 100] as const;
