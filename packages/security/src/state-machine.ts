import { TRADE_STATUSES, type TradeStatus } from "@arctrade/types";

const TRANSITIONS: Record<TradeStatus, readonly TradeStatus[]> = {
  CREATED: ["QUOTED", "CANCELLED", "FAILED"],
  QUOTED: ["CONFIRMING", "EXPIRED", "CANCELLED", "FAILED"],
  CONFIRMING: ["SIGNING", "CANCELLED", "EXPIRED", "FAILED"],
  SIGNING: ["SUBMITTED", "FAILED", "CANCELLED"],
  SUBMITTED: ["PENDING", "CONFIRMED", "FAILED"],
  PENDING: ["CONFIRMED", "FAILED"],
  CONFIRMED: [],
  FAILED: [],
  EXPIRED: ["QUOTED"],
  CANCELLED: [],
};

export function canTransition(from: TradeStatus, to: TradeStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(from: TradeStatus, to: TradeStatus): TradeStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal trade transition ${from} → ${to}`);
  }
  return to;
}

export function isTerminal(status: TradeStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function isTradeStatus(value: string): value is TradeStatus {
  return (TRADE_STATUSES as readonly string[]).includes(value);
}

/** A transaction hash is never sufficient for CONFIRMED. */
export function statusAfterHash(current: TradeStatus): TradeStatus {
  if (current === "SIGNING" || current === "CONFIRMING") return transition(current === "CONFIRMING" ? "CONFIRMING" : "SIGNING", "SUBMITTED");
  if (current === "SUBMITTED") return "PENDING";
  return current;
}

export function statusAfterReceipt(success: boolean): TradeStatus {
  return success ? "CONFIRMED" : "FAILED";
}
