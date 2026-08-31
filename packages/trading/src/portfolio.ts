import Decimal from "decimal.js";
import { prisma } from "@arctrade/database";
import { loadConfig } from "@arctrade/config";
import { CIRBTC, EURC, USDC_ERC20, ARC_TESTNET_CHAIN_ID } from "@arctrade/blockchain";
import {
  averageConsume,
  fifoConsume,
  lifoConsume,
  positionTotals,
  unrealizedPnl,
  type Lot,
} from "@arctrade/security";
import { upsertToken } from "./market-data.js";

Decimal.set({ precision: 80, rounding: Decimal.ROUND_DOWN });

type Trade = {
  userId: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
};

function toLots(
  rows: { quantity: string; unitCostUsd: string }[],
): Lot[] {
  return rows.map((r) => ({
    quantity: new Decimal(r.quantity),
    unitCostUsd: new Decimal(r.unitCostUsd),
  }));
}

export async function applyConfirmedTrade(trade: Trade): Promise<void> {
  const chainId = loadConfig().ARC_CHAIN_ID || ARC_TESTNET_CHAIN_ID;
  const tokenIn = await upsertToken({
    chainId,
    address: trade.tokenIn,
    symbol: symbolGuess(trade.tokenIn),
    name: symbolGuess(trade.tokenIn),
    decimals: 6,
  });
  const tokenOut = await upsertToken({
    chainId,
    address: trade.tokenOut,
    symbol: symbolGuess(trade.tokenOut),
    name: symbolGuess(trade.tokenOut),
    decimals: 6,
  });

  const amountIn = new Decimal(trade.amountIn);
  const amountOut = new Decimal(trade.amountOut);
  const usdcIn = trade.tokenIn.toLowerCase() === USDC_ERC20.toLowerCase();
  const usdcOut = trade.tokenOut.toLowerCase() === USDC_ERC20.toLowerCase();

  if (usdcIn && !usdcOut) {
    const unitCost = amountOut.eq(0) ? new Decimal(0) : amountIn.div(amountOut);
    await addBuyLot(trade.userId, tokenOut.id, amountOut, unitCost);
  } else if (usdcOut && !usdcIn) {
    await consumeSell(trade.userId, tokenIn.id, amountIn, amountOut);
  } else {
    const unitCost = amountOut.eq(0) ? new Decimal(0) : amountIn.div(amountOut);
    await addBuyLot(trade.userId, tokenOut.id, amountOut, unitCost);
    await consumeSell(trade.userId, tokenIn.id, amountIn, amountIn);
  }
}

async function addBuyLot(userId: string, tokenId: string, quantity: Decimal, unitCostUsd: Decimal) {
  const position = await prisma.position.upsert({
    where: { userId_tokenId: { userId, tokenId } },
    create: {
      userId,
      tokenId,
      quantity: quantity.toString(),
      averageEntryPrice: unitCostUsd.toString(),
      realizedPnl: "0",
      unrealizedPnl: "0",
    },
    update: {},
  });
  await prisma.positionLot.create({
    data: {
      userId,
      positionId: position.id,
      quantity: quantity.toString(),
      unitCostUsd: unitCostUsd.toString(),
    },
  });
  await recomputePosition(position.id);
}

async function consumeSell(
  userId: string,
  tokenId: string,
  quantity: Decimal,
  proceedsUsd: Decimal,
) {
  const position = await prisma.position.findUnique({
    where: { userId_tokenId: { userId, tokenId } },
    include: { lots: { orderBy: { openedAt: "asc" } } },
  });
  if (!position) return;
  const lots = toLots(position.lots);
  const method = loadConfig().accountingMethod;
  const result =
    method === "LIFO"
      ? lifoConsume(lots, quantity, proceedsUsd)
      : method === "AVERAGE"
        ? averageConsume(lots, quantity, proceedsUsd)
        : fifoConsume(lots, quantity, proceedsUsd);

  await prisma.positionLot.deleteMany({ where: { positionId: position.id } });
  for (const lot of result.remainingLots) {
    await prisma.positionLot.create({
      data: {
        userId,
        positionId: position.id,
        quantity: lot.quantity.toString(),
        unitCostUsd: lot.unitCostUsd.toString(),
      },
    });
  }
  const realized = new Decimal(position.realizedPnl).add(result.realizedPnlUsd);
  await prisma.position.update({
    where: { id: position.id },
    data: { realizedPnl: realized.toString() },
  });
  await recomputePosition(position.id);
}

export async function recomputePosition(positionId: string, markUsd?: Decimal) {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { lots: true },
  });
  if (!position) return;
  const lots = toLots(position.lots);
  const totals = positionTotals(lots);
  const uPnl = markUsd ? unrealizedPnl(lots, markUsd) : new Decimal(position.unrealizedPnl);
  await prisma.position.update({
    where: { id: positionId },
    data: {
      quantity: totals.quantity.toString(),
      averageEntryPrice: totals.averageEntry.toString(),
      unrealizedPnl: uPnl.toString(),
    },
  });
}

function symbolGuess(address: string): string {
  const a = address.toLowerCase();
  if (a === USDC_ERC20.toLowerCase()) return "USDC";
  if (a === EURC.toLowerCase()) return "EURC";
  if (a === CIRBTC.toLowerCase()) return "cirBTC";
  return address.slice(0, 8);
}

export { toLots };
