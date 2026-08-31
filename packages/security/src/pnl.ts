import Decimal from "decimal.js";

export type Lot = {
  quantity: Decimal;
  unitCostUsd: Decimal;
};

export type ConsumeResult = {
  remainingLots: Lot[];
  realizedPnlUsd: Decimal;
  costBasisConsumed: Decimal;
  quantityConsumed: Decimal;
};

function consumeInOrder(lots: Lot[], quantity: Decimal): ConsumeResult {
  if (quantity.lte(0)) throw new Error("Sell quantity must be positive.");
  let remaining = quantity;
  let cost = new Decimal(0);
  const next: Lot[] = [];
  for (const lot of lots) {
    if (remaining.lte(0)) {
      next.push(lot);
      continue;
    }
    if (lot.quantity.lte(remaining)) {
      cost = cost.add(lot.quantity.mul(lot.unitCostUsd));
      remaining = remaining.sub(lot.quantity);
    } else {
      cost = cost.add(remaining.mul(lot.unitCostUsd));
      next.push({ quantity: lot.quantity.sub(remaining), unitCostUsd: lot.unitCostUsd });
      remaining = new Decimal(0);
    }
  }
  if (remaining.gt(0)) {
    throw new Error("Insufficient position quantity.");
  }
  return {
    remainingLots: next,
    realizedPnlUsd: new Decimal(0),
    costBasisConsumed: cost,
    quantityConsumed: quantity,
  };
}

export function fifoConsume(lots: Lot[], quantity: Decimal, proceedsUsd: Decimal): ConsumeResult {
  const r = consumeInOrder(lots, quantity);
  return { ...r, realizedPnlUsd: proceedsUsd.sub(r.costBasisConsumed) };
}

export function lifoConsume(lots: Lot[], quantity: Decimal, proceedsUsd: Decimal): ConsumeResult {
  const r = consumeInOrder([...lots].reverse(), quantity);
  return {
    ...r,
    remainingLots: [...r.remainingLots].reverse(),
    realizedPnlUsd: proceedsUsd.sub(r.costBasisConsumed),
  };
}

export function averageConsume(lots: Lot[], quantity: Decimal, proceedsUsd: Decimal): ConsumeResult {
  const totalQty = lots.reduce((s, l) => s.add(l.quantity), new Decimal(0));
  const totalCost = lots.reduce((s, l) => s.add(l.quantity.mul(l.unitCostUsd)), new Decimal(0));
  if (quantity.gt(totalQty)) throw new Error("Insufficient position quantity.");
  const avg = totalQty.eq(0) ? new Decimal(0) : totalCost.div(totalQty);
  const cost = quantity.mul(avg);
  const remainingQty = totalQty.sub(quantity);
  return {
    remainingLots: remainingQty.gt(0) ? [{ quantity: remainingQty, unitCostUsd: avg }] : [],
    realizedPnlUsd: proceedsUsd.sub(cost),
    costBasisConsumed: cost,
    quantityConsumed: quantity,
  };
}

export function unrealizedPnl(lots: Lot[], markPriceUsd: Decimal): Decimal {
  return lots.reduce((s, l) => s.add(l.quantity.mul(markPriceUsd.sub(l.unitCostUsd))), new Decimal(0));
}

export function positionTotals(lots: Lot[]) {
  const quantity = lots.reduce((s, l) => s.add(l.quantity), new Decimal(0));
  const cost = lots.reduce((s, l) => s.add(l.quantity.mul(l.unitCostUsd)), new Decimal(0));
  const averageEntry = quantity.eq(0) ? new Decimal(0) : cost.div(quantity);
  return { quantity, costBasis: cost, averageEntry };
}
