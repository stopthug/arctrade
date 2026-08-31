import { applyBps, rawToDecimal } from "./money.js";

export interface FeeBreakdownInput {
  notionalRaw: bigint;
  notionalDecimals: number;
  serviceFeeBps: number;
  networkFeeUsd: string;
  providerFeeUsd: string;
}

export interface FeeBreakdown {
  serviceFeeRaw: bigint;
  serviceFeeFormatted: string;
  serviceFeeUsd: string;
  networkFeeUsd: string;
  providerFeeUsd: string;
  serviceFeeBps: number;
}

export function calculateServiceFee(notionalRaw: bigint, bps: number): bigint {
  if (bps < 0) throw new Error("Fee bps must be >= 0");
  return applyBps(notionalRaw, bps);
}

export function calculateFeeBreakdown(input: FeeBreakdownInput): FeeBreakdown {
  const serviceFeeRaw = calculateServiceFee(input.notionalRaw, input.serviceFeeBps);
  const formatted = rawToDecimal(serviceFeeRaw, input.notionalDecimals).toFixed(6);
  return {
    serviceFeeRaw,
    serviceFeeFormatted: formatted,
    serviceFeeUsd: formatted,
    networkFeeUsd: input.networkFeeUsd,
    providerFeeUsd: input.providerFeeUsd,
    serviceFeeBps: input.serviceFeeBps,
  };
}
