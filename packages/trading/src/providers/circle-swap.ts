import { randomUUID } from "node:crypto";
import type { Address, Hex } from "viem";
import { loadConfig } from "@arctrade/config";
import { explorerTxUrl, EURC, USDC_ERC20, CIRBTC } from "@arctrade/blockchain";
import {
  formatAmount,
  minReceived,
  normalizeAddress,
  parseAmount,
  priceFromAmounts,
} from "@arctrade/security";
import {
  TradingUnavailableError,
  type GasEstimate,
  type Quote,
  type QuoteRequest,
} from "@arctrade/types";
import type { ExecuteRequest, ExecuteResult, SwapRoute, TradingProvider } from "./provider-interface.js";

const ALIAS_BY_ADDRESS: Record<string, "USDC" | "EURC" | "cirBTC"> = {
  [USDC_ERC20.toLowerCase()]: "USDC",
  [EURC.toLowerCase()]: "EURC",
  [CIRBTC.toLowerCase()]: "cirBTC",
};

const ADDRESS_BY_ALIAS = {
  USDC: USDC_ERC20,
  EURC,
  cirBTC: CIRBTC,
} as const;

const DECIMALS: Record<string, number> = {
  USDC: 6,
  EURC: 6,
  cirBTC: 8,
};

function aliasFor(address: Address): "USDC" | "EURC" | "cirBTC" | null {
  return ALIAS_BY_ADDRESS[address.toLowerCase()] ?? null;
}

/**
 * Circle Swap Kit adapter for Arc Testnet.
 * Official pairs: USDC, EURC, cirBTC.
 * https://docs.arc.io/app-kit/swap
 */
export class CircleSwapProvider implements TradingProvider {
  readonly name = "circle-swap";

  async getQuote(request: QuoteRequest): Promise<Quote> {
    const tokenIn = aliasFor(normalizeAddress(request.tokenIn));
    const tokenOut = aliasFor(normalizeAddress(request.tokenOut));
    if (!tokenIn || !tokenOut || tokenIn === tokenOut) {
      throw new TradingUnavailableError();
    }

    const inDecimals = DECIMALS[tokenIn] ?? 6;
    const amountInFormatted = formatAmount(BigInt(request.amountInRaw), inDecimals);
    const config = loadConfig();
    const expiresAt = new Date(Date.now() + config.QUOTE_TTL_SECONDS * 1000).toISOString();

    try {
      const estimate = await this.callEstimate({
        tokenIn,
        tokenOut,
        amountIn: amountInFormatted,
        slippageBps: request.slippageBps,
        fromAddress: request.walletAddress,
      });

      const outDecimals = DECIMALS[tokenOut] ?? 6;
      const amountOutFormatted =
        typeof estimate.estimatedOutput === "object" && estimate.estimatedOutput?.amount
          ? String(estimate.estimatedOutput.amount)
          : String(estimate.estimatedOutput ?? "");
      if (!amountOutFormatted) {
        throw new TradingUnavailableError();
      }
      const amountOutRaw = parseAmount(amountOutFormatted, outDecimals);
      const stop =
        typeof estimate.stopLimit === "object" && estimate.stopLimit?.amount
          ? String(estimate.stopLimit.amount)
          : undefined;
      const minOutRaw = stop
        ? parseAmount(stop, outDecimals)
        : minReceived(amountOutRaw, request.slippageBps);

      const providerFee =
        Array.isArray(estimate.fees)
          ? estimate.fees.find((f: { type?: string }) => f.type === "provider")
          : undefined;
      const gasFee =
        Array.isArray(estimate.fees)
          ? estimate.fees.find((f: { type?: string }) => f.type === "gas")
          : undefined;

      const price = priceFromAmounts(
        BigInt(request.amountInRaw),
        inDecimals,
        amountOutRaw,
        outDecimals,
      ).toString();

      return {
        quoteId: randomUUID(),
        provider: this.name,
        tokenIn: ADDRESS_BY_ALIAS[tokenIn],
        tokenOut: ADDRESS_BY_ALIAS[tokenOut],
        tokenInSymbol: tokenIn,
        tokenOutSymbol: tokenOut,
        tokenInDecimals: inDecimals,
        tokenOutDecimals: outDecimals,
        amountInRaw: request.amountInRaw,
        amountInFormatted,
        amountOutRaw: amountOutRaw.toString(),
        amountOutFormatted,
        minAmountOutRaw: minOutRaw.toString(),
        minAmountOutFormatted: formatAmount(minOutRaw, outDecimals),
        price,
        priceUsdIn: tokenIn === "USDC" ? "1" : null,
        priceUsdOut: tokenOut === "USDC" ? "1" : null,
        priceImpactBps: null,
        slippageBps: request.slippageBps,
        route: "Circle Swap Kit · Arc Testnet",
        fees: [
          {
            type: "network",
            tokenSymbol: "USDC",
            amount: gasFee?.amount ? String(gasFee.amount) : "unknown",
            amountUsd: gasFee?.amount ? String(gasFee.amount) : "unavailable",
          },
          {
            type: "provider",
            tokenSymbol: providerFee?.token ? String(providerFee.token) : tokenIn,
            amount: providerFee?.amount ? String(providerFee.amount) : "0",
            amountUsd: providerFee?.amount ? String(providerFee.amount) : "0",
          },
        ],
        expiresAt,
        executionProtection: "standard",
        raw: estimate,
      };
    } catch (err) {
      if (err instanceof TradingUnavailableError) throw err;
      throw new TradingUnavailableError();
    }
  }

  async getRoutes(tokenIn: Address, tokenOut: Address): Promise<SwapRoute[]> {
    const a = aliasFor(normalizeAddress(tokenIn));
    const b = aliasFor(normalizeAddress(tokenOut));
    if (!a || !b || a === b) return [];
    return [{ provider: this.name, label: `${a} → ${b}`, tokenIn, tokenOut }];
  }

  async buildTransaction(quote: Quote) {
    return {
      to: quote.tokenOut,
      data: "0x" as Hex,
      value: 0n,
      quoteId: quote.quoteId,
    };
  }

  async estimateGas(_quote: Quote, _from: Address): Promise<GasEstimate> {
    return {
      gasLimit: "0",
      maxFeePerGas: "0",
      maxPriorityFeePerGas: "0",
      estimatedFeeRaw: "0",
      estimatedFeeUsd: "unavailable",
      nativeSymbol: "USDC",
    };
  }

  async executeTransaction(request: ExecuteRequest): Promise<ExecuteResult> {
    const tokenIn = aliasFor(request.quote.tokenIn);
    const tokenOut = aliasFor(request.quote.tokenOut);
    if (!tokenIn || !tokenOut) throw new TradingUnavailableError();

    const result = await request.withPrivateKey(async (privateKey) => {
      return this.callSwap({
        privateKey,
        tokenIn,
        tokenOut,
        amountIn: request.quote.amountInFormatted,
        slippageBps: request.quote.slippageBps,
      });
    });

    const hash = result.txHash as Hex | undefined;
    if (!hash) throw new TradingUnavailableError("Swap submitted without a transaction hash.");
    return {
      hash,
      explorerUrl: result.explorerUrl ?? explorerTxUrl(hash),
      estimatedAmountOut:
        result.amountOut != null ? String(result.amountOut) : request.quote.amountOutFormatted,
    };
  }

  async getTransactionStatus(_hash: Hex) {
    return "unknown" as const;
  }

  async healthy(): Promise<boolean> {
    try {
      await this.loadKit();
      return true;
    } catch {
      return false;
    }
  }

  private async loadKit() {
    const swapMod = await import("@circle-fin/swap-kit");
    const adapterMod = await import("@circle-fin/adapter-viem-v2");
    return { swapMod, adapterMod };
  }

  private async callEstimate(params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    slippageBps: number;
    fromAddress: Address;
  }) {
    const { swapMod, adapterMod } = await this.loadKit();
    const createAdapter =
      adapterMod.createViemAdapterFromPrivateKey ??
      adapterMod.createAdapterFromPrivateKey;
    if (!createAdapter || !swapMod.SwapKit) {
      throw new TradingUnavailableError();
    }
    const config = loadConfig();
    const dummyKey =
      "0x0000000000000000000000000000000000000000000000000000000000000001" as Hex;
    const adapter = createAdapter({ privateKey: dummyKey });
    const kit = new swapMod.SwapKit();
    return kit.estimate({
      from: { adapter, chain: "Arc_Testnet" },
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      config: {
        kitKey: config.CIRCLE_KIT_KEY || undefined,
        slippageBps: params.slippageBps,
      },
    });
  }

  private async callSwap(params: {
    privateKey: Hex;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    slippageBps: number;
  }) {
    const { swapMod, adapterMod } = await this.loadKit();
    const createAdapter =
      adapterMod.createViemAdapterFromPrivateKey ??
      adapterMod.createAdapterFromPrivateKey;
    if (!createAdapter || !swapMod.SwapKit) {
      throw new TradingUnavailableError();
    }
    const config = loadConfig();
    const adapter = createAdapter({ privateKey: params.privateKey });
    const kit = new swapMod.SwapKit();
    return kit.swap({
      from: { adapter, chain: "Arc_Testnet" },
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      config: {
        kitKey: config.CIRCLE_KIT_KEY || undefined,
        slippageBps: params.slippageBps,
      },
    });
  }
}
