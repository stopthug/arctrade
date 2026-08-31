import type { Hex } from "viem";
import { prisma } from "@arctrade/database";
import { loadConfig } from "@arctrade/config";
import { createLogger } from "@arctrade/logging";
import {
  createArcPublicClient,
  estimateEip1559Gas,
  getNativeBalance,
} from "@arctrade/blockchain";
import {
  nativeUsdcWeiToUsd,
  transition,
} from "@arctrade/security";
import {
  IdempotencyConflictError,
  InsufficientGasError,
  QuoteExpiredError,
  type Quote,
} from "@arctrade/types";
import type { WalletProvider } from "@arctrade/wallet";
import type { TradingProvider } from "./providers/provider-interface.js";
import { QuoteService } from "./quote-service.js";
import { applyConfirmedTrade } from "./portfolio.js";

const log = createLogger("trade-engine");

export class TradeEngine {
  constructor(
    private readonly provider: TradingProvider,
    private readonly quotes: QuoteService,
    private readonly wallets: WalletProvider,
  ) {}

  async createQuotedTrade(input: {
    userId: string;
    walletId: string;
    tradeRequestId: string;
    quote: Quote;
  }) {
    const existing = await prisma.trade.findUnique({
      where: { tradeRequestId: input.tradeRequestId },
    });
    if (existing) {
      throw new IdempotencyConflictError(input.tradeRequestId);
    }
    const serviceFee = input.quote.fees.find((f) => f.type === "service");
    const networkFee = input.quote.fees.find((f) => f.type === "network");
    return prisma.trade.create({
      data: {
        tradeRequestId: input.tradeRequestId,
        userId: input.userId,
        walletId: input.walletId,
        tokenIn: input.quote.tokenIn,
        tokenOut: input.quote.tokenOut,
        amountIn: input.quote.amountInFormatted,
        amountOut: input.quote.amountOutFormatted,
        minAmountOut: input.quote.minAmountOutFormatted,
        price: input.quote.price,
        slippage: (input.quote.slippageBps / 100).toFixed(2),
        fee: serviceFee?.amount ?? "0",
        serviceFeeBps: await this.serviceBps(),
        serviceFeeAmount: serviceFee?.amount ?? "0",
        networkFeeAmount: networkFee?.amountUsd ?? "unavailable",
        route: input.quote.route,
        quoteId: input.quote.quoteId,
        quoteExpiresAt: new Date(input.quote.expiresAt),
        status: "QUOTED",
        executionProtection: "standard",
      },
    });
  }

  async confirmAndExecute(input: {
    userId: string;
    walletId: string;
    tradeRequestId: string;
    quoteId: string;
  }) {
    const existing = await prisma.trade.findUnique({
      where: { tradeRequestId: input.tradeRequestId },
    });
    if (existing && ["SIGNING", "SUBMITTED", "PENDING", "CONFIRMED"].includes(existing.status)) {
      throw new IdempotencyConflictError(input.tradeRequestId);
    }

    let quote: Quote;
    try {
      quote = await this.quotes.getStored(input.quoteId);
    } catch (err) {
      if (err instanceof QuoteExpiredError && existing) {
        await prisma.trade.update({
          where: { id: existing.id },
          data: { status: "EXPIRED", errorCode: "QUOTE_EXPIRED", errorMessage: err.message },
        });
      }
      throw err;
    }

    const trade =
      existing ??
      (await this.createQuotedTrade({
        userId: input.userId,
        walletId: input.walletId,
        tradeRequestId: input.tradeRequestId,
        quote,
      }));

    await prisma.trade.update({
      where: { id: trade.id },
      data: { status: transition(trade.status === "CREATED" ? "CREATED" : "QUOTED", "CONFIRMING") },
    });

    const address = await this.wallets.getAddress(input.walletId);
    const client = createArcPublicClient();
    const nativeWei = await getNativeBalance(client, address);
    const gas = await estimateEip1559Gas(client, { account: address });
    const required = BigInt(gas.estimatedFeeRaw);
    if (nativeWei < required) {
      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: "FAILED",
          errorCode: "INSUFFICIENT_GAS",
          errorMessage: `Need ~${gas.estimatedFeeUsd} USDC for network fee.`,
        },
      });
      throw new InsufficientGasError(gas.estimatedFeeUsd);
    }

    await prisma.trade.update({
      where: { id: trade.id },
      data: { status: "SIGNING" },
    });

    const wallet = this.wallets;
    if (!wallet.withPrivateKey) {
      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: "FAILED",
          errorCode: "NO_SIGNER",
          errorMessage: "Configured wallet provider cannot sign swaps.",
        },
      });
      throw new Error("Configured wallet provider cannot sign swaps.");
    }

    try {
      const result = await this.provider.executeTransaction({
        quote,
        walletAddress: address,
        withPrivateKey: (fn) => wallet.withPrivateKey!(input.walletId, fn),
      });
      const hash = result.hash as Hex;
      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: "SUBMITTED",
          transactionHash: hash,
          submittedAt: new Date(),
        },
      });
      await prisma.transaction.create({
        data: {
          userId: input.userId,
          type: "SWAP",
          hash,
          status: "SUBMITTED",
          fromAddress: address,
          tokenAddress: quote.tokenOut,
          amount: quote.amountOutFormatted,
          fee: gas.estimatedFeeUsd,
        },
      });
      log.info({ tradeId: trade.id, transactionHash: hash, userId: input.userId }, "swap submitted");
      return { tradeId: trade.id, hash, explorerUrl: result.explorerUrl, quote };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Swap failed";
      await prisma.trade.update({
        where: { id: trade.id },
        data: { status: "FAILED", errorCode: "EXECUTE_FAILED", errorMessage: message },
      });
      throw err;
    }
  }

  async markConfirmed(tradeId: string, success: boolean, errorMessage?: string) {
    const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) return;
    if (success) {
      await prisma.trade.update({
        where: { id: tradeId },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });
      if (trade.transactionHash) {
        await prisma.transaction.updateMany({
          where: { hash: trade.transactionHash },
          data: { status: "CONFIRMED", confirmedAt: new Date() },
        });
      }
      await applyConfirmedTrade(trade);
    } else {
      await prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: "FAILED",
          errorCode: "CHAIN_REVERT",
          errorMessage: errorMessage ?? "Transaction reverted.",
        },
      });
      if (trade.transactionHash) {
        await prisma.transaction.updateMany({
          where: { hash: trade.transactionHash },
          data: { status: "FAILED", errorMessage: errorMessage },
        });
      }
    }
  }

  private async serviceBps() {
    const row = await prisma.feeConfig.findUnique({ where: { id: "default" } });
    return row?.tradingFeeBps ?? loadConfig().TRADING_FEE_BPS;
  }
}

export function formatInsufficientGas(requiredUsd: string): string {
  return [
    "❌ Insufficient network fee balance.",
    "",
    "You need approximately:",
    `${requiredUsd} USDC (native gas).`,
    "",
    `Max fee estimate: $${requiredUsd}`,
    `Native balance check used 18-decimal USDC wei (${nativeUsdcWeiToUsd(0n)} scale).`,
  ].join("\n");
}
