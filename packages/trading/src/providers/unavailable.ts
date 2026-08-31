import type { Address, Hex } from "viem";
import { TradingUnavailableError, type GasEstimate, type Quote, type QuoteRequest } from "@arctrade/types";
import type { ExecuteRequest, ExecuteResult, SwapRoute, TradingProvider, BuiltTransaction } from "./provider-interface.js";

export class UnavailableTradingProvider implements TradingProvider {
  readonly name = "unavailable";

  async getQuote(_request: QuoteRequest): Promise<Quote> {
    throw new TradingUnavailableError();
  }

  async getRoutes(_tokenIn: Address, _tokenOut: Address): Promise<SwapRoute[]> {
    return [];
  }

  async buildTransaction(_quote: Quote): Promise<BuiltTransaction> {
    throw new TradingUnavailableError();
  }

  async estimateGas(_quote: Quote, _from: Address): Promise<GasEstimate> {
    throw new TradingUnavailableError();
  }

  async executeTransaction(_request: ExecuteRequest): Promise<ExecuteResult> {
    throw new TradingUnavailableError();
  }

  async getTransactionStatus(_hash: Hex) {
    return "unknown" as const;
  }

  async healthy() {
    return true;
  }
}
