export const TRADE_STATUSES = [
  "CREATED",
  "QUOTED",
  "CONFIRMING",
  "SIGNING",
  "SUBMITTED",
  "PENDING",
  "CONFIRMED",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type TradeStatus = (typeof TRADE_STATUSES)[number];

export const TERMINAL_TRADE_STATUSES: readonly TradeStatus[] = [
  "CONFIRMED",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
];

export const TOKEN_POLICIES = ["STRICT", "VERIFIED_ONLY", "WARN_UNVERIFIED"] as const;
export type TokenPolicy = (typeof TOKEN_POLICIES)[number];

export const ACCOUNTING_METHODS = ["FIFO", "LIFO", "AVERAGE"] as const;
export type AccountingMethod = (typeof ACCOUNTING_METHODS)[number];

export const WALLET_PROVIDERS = [
  "LOCAL_ENCRYPTED",
  "MPC",
  "EMBEDDED",
  "SMART_ACCOUNT",
  "EXTERNAL",
] as const;
export type WalletProviderType = (typeof WALLET_PROVIDERS)[number];

export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export interface TokenAmount {
  tokenAddress: Address | "native";
  symbol: string;
  decimals: number;
  raw: string;
  formatted: string;
}

export interface GasEstimate {
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  estimatedFeeRaw: string;
  estimatedFeeUsd: string;
  nativeSymbol: "USDC";
}

export interface QuoteRequest {
  userId: string;
  walletAddress: Address;
  tokenIn: Address;
  tokenOut: Address;
  amountInRaw: string;
  slippageBps: number;
  tradeRequestId: string;
}

export interface QuoteFee {
  type: "network" | "provider" | "service";
  tokenSymbol: string;
  amount: string;
  amountUsd: string;
}

export interface Quote {
  quoteId: string;
  provider: string;
  tokenIn: Address;
  tokenOut: Address;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  tokenInDecimals: number;
  tokenOutDecimals: number;
  amountInRaw: string;
  amountInFormatted: string;
  amountOutRaw: string;
  amountOutFormatted: string;
  minAmountOutRaw: string;
  minAmountOutFormatted: string;
  price: string;
  priceUsdIn: string | null;
  priceUsdOut: string | null;
  priceImpactBps: number | null;
  slippageBps: number;
  route: string;
  fees: QuoteFee[];
  expiresAt: string;
  executionProtection: "standard";
  raw: unknown;
}

export class TradingUnavailableError extends Error {
  readonly code = "TRADING_UNAVAILABLE" as const;

  constructor(message = "Trading for this pair is currently unavailable.") {
    super(message);
    this.name = "TradingUnavailableError";
  }
}

export class QuoteExpiredError extends Error {
  readonly code = "QUOTE_EXPIRED" as const;

  constructor(message = "This quote expired.") {
    super(message);
    this.name = "QuoteExpiredError";
  }
}

export class InsufficientGasError extends Error {
  readonly code = "INSUFFICIENT_GAS" as const;
  constructor(
    readonly requiredFormatted: string,
    message?: string,
  ) {
    super(message ?? `Insufficient network fee balance. You need approximately ${requiredFormatted} USDC.`);
    this.name = "InsufficientGasError";
  }
}

export class IdempotencyConflictError extends Error {
  readonly code = "IDEMPOTENCY_CONFLICT" as const;
  constructor(readonly tradeRequestId: string) {
    super("This trade request was already submitted.");
    this.name = "IdempotencyConflictError";
  }
}
