import { loadConfig } from "@arctrade/config";
import { prisma } from "@arctrade/database";
import { calculateFeeBreakdown } from "@arctrade/security";
import type { Quote } from "@arctrade/types";

export class FeeService {
  async getTradingFeeBps(): Promise<number> {
    const row = await prisma.feeConfig.findUnique({ where: { id: "default" } });
    if (row) return row.tradingFeeBps;
    return loadConfig().TRADING_FEE_BPS;
  }

  async getReferralRewardBps(): Promise<number> {
    const row = await prisma.feeConfig.findUnique({ where: { id: "default" } });
    return row?.referralRewardBps ?? 0;
  }

  applyToQuote(quote: Quote, serviceFeeBps: number): Quote {
    const breakdown = calculateFeeBreakdown({
      notionalRaw: BigInt(quote.amountInRaw),
      notionalDecimals: quote.tokenInDecimals,
      serviceFeeBps,
      networkFeeUsd: quote.fees.find((f) => f.type === "network")?.amountUsd ?? "unavailable",
      providerFeeUsd: quote.fees.find((f) => f.type === "provider")?.amountUsd ?? "0",
    });
    return {
      ...quote,
      fees: [
        ...quote.fees.filter((f) => f.type !== "service"),
        {
          type: "service",
          tokenSymbol: quote.tokenInSymbol,
          amount: breakdown.serviceFeeFormatted,
          amountUsd: breakdown.serviceFeeUsd,
        },
      ],
    };
  }
}

export const feeService = new FeeService();
