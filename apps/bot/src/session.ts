export interface BotSession {
  flow?: "buy" | "sell" | "swap" | "price" | "custom_amount" | "custom_slippage" | "watch";
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: string;
  quoteId?: string;
  tradeRequestId?: string;
  pendingUnverified?: string;
  pendingHighSlippage?: number;
  lastAction?: string;
}
