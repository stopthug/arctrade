import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { loadConfig } from "@arctrade/config";
import { createLogger } from "@arctrade/logging";
import { prisma } from "@arctrade/database";
import { createArcPublicClient, getTransactionReceipt, USDC_ERC20, EURC, CIRBTC } from "@arctrade/blockchain";
import { MarketDataService, TradeEngine, QuoteService, createTradingProvider, recomputePosition } from "@arctrade/trading";
import { createWalletProvider } from "@arctrade/wallet";
import Decimal from "decimal.js";
import type { Address } from "viem";

const log = createLogger("worker");
const config = loadConfig();
const connection = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });
const client = createArcPublicClient();
const redis = connection;
const trading = createTradingProvider();
const quotes = new QuoteService(trading, redis);
const engine = new TradeEngine(trading, quotes, createWalletProvider());
const market = new MarketDataService(redis);

const txQueue = new Queue("tx-monitor", { connection });
const marketQueue = new Queue("market-data", { connection });
const portfolioQueue = new Queue("portfolio", { connection });
const notifyQueue = new Queue("notify", { connection });

new Worker(
  "tx-monitor",
  async (job) => {
    const { tradeId } = job.data as { tradeId: string };
    const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade?.transactionHash) return;
    if (trade.status === "CONFIRMED" || trade.status === "FAILED") return;
    const receipt = await getTransactionReceipt(client, trade.transactionHash as `0x${string}`);
    if (!receipt) return;
    await engine.markConfirmed(tradeId, receipt.status === "success", receipt.status === "success" ? undefined : "reverted");
    if (receipt.status === "success") {
      await notifyQueue.add("trade-confirmed", { tradeId }, { jobId: `n-ok-${tradeId}` });
    } else {
      await notifyQueue.add("trade-failed", { tradeId }, { jobId: `n-fail-${tradeId}` });
    }
  },
  { connection },
);

new Worker(
  "market-data",
  async () => {
    for (const address of [USDC_ERC20, EURC, CIRBTC] as Address[]) {
      const price = await market.getPrice(address);
      const token = await prisma.token.findFirst({ where: { address: { equals: address, mode: "insensitive" } } });
      if (token && price.priceUsd) {
        await prisma.priceSnapshot.create({
          data: {
            tokenId: token.id,
            price: price.priceUsd,
            source: price.source,
            volume24h: price.volume24h ?? undefined,
            liquidity: price.liquidity ?? undefined,
            marketCap: price.marketCap ?? undefined,
          },
        });
      }
    }
  },
  { connection },
);

new Worker(
  "portfolio",
  async () => {
    const positions = await prisma.position.findMany({ include: { token: true } });
    for (const p of positions) {
      const md = await market.getPrice(p.token.address as Address);
      if (md.priceUsd) {
        await recomputePosition(p.id, new Decimal(md.priceUsd));
      }
    }
  },
  { connection },
);

new Worker(
  "notify",
  async (job) => {
    const { tradeId } = job.data as { tradeId: string };
    const trade = await prisma.trade.findUnique({ where: { id: tradeId }, include: { user: true } });
    if (!trade) return;
    await prisma.auditLog.create({
      data: {
        userId: trade.userId,
        action: job.name === "trade-confirmed" ? "NOTIFY_TRADE_CONFIRMED" : "NOTIFY_TRADE_FAILED",
        metadata: { tradeId, hash: trade.transactionHash },
      },
    });
    log.info(
      { userId: trade.userId, tradeId, operation: job.name, status: trade.status },
      "notification recorded (Telegram push requires bot token in worker — queued for bot polling via last trade status)",
    );
  },
  { connection },
);

async function enqueuePending() {
  const pending = await prisma.trade.findMany({
    where: { status: { in: ["SUBMITTED", "PENDING"] }, transactionHash: { not: null } },
    take: 50,
  });
  for (const t of pending) {
    await prisma.trade.update({
      where: { id: t.id },
      data: { status: t.status === "SUBMITTED" ? "PENDING" : t.status },
    });
    await txQueue.add("check", { tradeId: t.id }, { jobId: `tx-${t.id}-${t.transactionHash}`, delay: 2000 });
  }
}

async function main() {
  await marketQueue.add("refresh", {}, { repeat: { every: 30_000 }, jobId: "md-repeat" });
  await portfolioQueue.add("mark", {}, { repeat: { every: 60_000 }, jobId: "pf-repeat" });
  setInterval(() => {
    enqueuePending().catch((err) => log.error({ err }, "enqueue failed"));
  }, 4000);
  log.info("workers started");
}

main().catch((err) => {
  log.error({ err }, "fatal");
  process.exit(1);
});
