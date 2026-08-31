import type { Address, Hex } from "viem";
import type { GasEstimate, Quote, QuoteRequest } from "@arctrade/types";

export interface SwapRoute {
  provider: string;
  label: string;
  tokenIn: Address;
  tokenOut: Address;
}

export interface BuiltTransaction {
  to: Address;
  data: Hex;
  value: bigint;
  quoteId: string;
}

export interface ExecuteRequest {
  quote: Quote;
  walletAddress: Address;
  /** Called by adapters that need a private key in-process (Circle Swap Kit). */
  withPrivateKey: <T>(fn: (privateKey: Hex) => Promise<T>) => Promise<T>;
}

export interface ExecuteResult {
  hash: Hex;
  explorerUrl: string;
  estimatedAmountOut?: string;
}

export interface TradingProvider {
  readonly name: string;
  getQuote(request: QuoteRequest): Promise<Quote>;
  getRoutes(tokenIn: Address, tokenOut: Address): Promise<SwapRoute[]>;
  buildTransaction(quote: Quote): Promise<BuiltTransaction>;
  estimateGas(quote: Quote, from: Address): Promise<GasEstimate>;
  executeTransaction(request: ExecuteRequest): Promise<ExecuteResult>;
  getTransactionStatus(hash: Hex): Promise<"pending" | "success" | "reverted" | "unknown">;
  healthy(): Promise<boolean>;
}
