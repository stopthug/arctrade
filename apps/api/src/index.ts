import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import Redis from "ioredis";
import { loadConfig } from "@arctrade/config";
import { createLogger } from "@arctrade/logging";
import { prisma } from "@arctrade/database";
import {
  createArcPublicClient,
  rpcHealthy,
  validateTokenAddress,
  USDC_ERC20,
  EURC,
  CIRBTC,
  getErc20Balance,
  getErc20Metadata,
} from "@arctrade/blockchain";
import { RATE_LIMITS, formatAmount, rateLimit, createTradeRequestId } from "@arctrade/security";
import {
  MarketDataService,
  QuoteService,
  TradeEngine,
  createTradingProvider,
  getTrending,
  upsertToken,
} from "@arctrade/trading";
import { createWalletProvider } from "@arctrade/wallet";
import type { Address } from "viem";

const log = createLogger("api");
const config = loadConfig();
const redis = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });
const client = createArcPublicClient();
const wallets = createWalletProvider();
const trading = createTradingProvider();
const quotes = new QuoteService(trading, redis);
const engine = new TradeEngine(trading, quotes, wallets);
const market = new MarketDataService(redis);

const app = new Hono();

app.use("*", honoLogger());
app.use(
  "*",
  cors({
    origin: config.NEXT_PUBLIC_APP_URL,
    credentials: true,
  }),
);

app.use("/v1/*", async (c, next) => {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  const rl = await rateLimit(redis, `api:${ip}`, RATE_LIMITS.api.limit, RATE_LIMITS.api.windowMs);
  if (!rl.allowed) return c.json({ error: "rate_limited" }, 429);
  await next();
});

function adminOk(c: { req: { header: (n: string) => string | undefined } }) {
  const key = c.req.header("x-admin-key");
  return Boolean(config.ADMIN_API_KEY) && key === config.ADMIN_API_KEY;
}

app.get("/health", (c) => c.json({ ok: true, service: "arctrade-api" }));

app.get("/ready", async (c) => {
  const checks: Record<string, boolean> = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }
  try {
    checks.redis = (await redis.ping()) === "PONG";
  } catch {
    checks.redis = false;
  }
  checks.rpc = await rpcHealthy(client);
  checks.tradingProvider = await trading.healthy();
  const ready = Object.values(checks).every(Boolean);
  return c.json({ ready, checks }, ready ? 200 : 503);
});

app.get("/v1/tokens/catalog", async (c) => {
  const tokens = await prisma.token.findMany({ where: { chainId: config.ARC_CHAIN_ID }, orderBy: { symbol: "asc" } });
  return c.json({ tokens });
});

app.get("/v1/tokens/search", async (c) => {
  const q = (c.req.query("q") ?? "").trim();
  const ip = c.req.header("x-forwarded-for") ?? "local";
  const rl = await rateLimit(redis, `search:${ip}`, RATE_LIMITS.tokenSearch.limit, RATE_LIMITS.tokenSearch.windowMs);
  if (!rl.allowed) return c.json({ error: "rate_limited" }, 429);
  if (!q) return c.json({ tokens: [] });
  const tokens = await prisma.token.findMany({
    where: {
      chainId: config.ARC_CHAIN_ID,
      OR: [
        { symbol: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 20,
  });
  return c.json({ tokens });
});

app.get("/v1/tokens/:address", async (c) => {
  const address = c.req.param("address") as Address;
  try {
    const validated = await validateTokenAddress(client, address, {
      verifiedAddresses: new Set([USDC_ERC20, EURC, CIRBTC].map((a) => a.toLowerCase())),
      policy: "WARN_UNVERIFIED",
    });
    const token = await upsertToken({
      chainId: config.ARC_CHAIN_ID,
      address: validated.address,
      symbol: validated.symbol,
      name: validated.name,
      decimals: validated.decimals,
      verified: validated.verified,
    });
    const price = await market.getPrice(validated.address);
    return c.json({ token, price, warning: validated.warning ?? null });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "invalid_token" }, 400);
  }
});

app.get("/v1/tokens/:address/price", async (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  const rl = await rateLimit(redis, `price:${ip}`, RATE_LIMITS.price.limit, RATE_LIMITS.price.windowMs);
  if (!rl.allowed) return c.json({ error: "rate_limited" }, 429);
  const price = await market.getPrice(c.req.param("address") as Address);
  return c.json({ price });
});

app.get("/v1/trending", async (c) => c.json(await getTrending()));

app.get("/v1/network", (c) =>
  c.json({
    name: "Arc Testnet",
    chainId: config.ARC_CHAIN_ID,
    rpc: config.ARC_RPC_URL,
    explorer: config.ARC_EXPLORER_URL,
    nativeGas: "USDC",
    executionProtection: "standard",
    usdc: config.USDC_CONTRACT_ADDRESS,
    eurc: config.EURC_CONTRACT_ADDRESS,
    cirbtc: config.CIRBTC_CONTRACT_ADDRESS,
  }),
);

app.post("/v1/quotes", async (c) => {
  const body = await c.req.json<{
    userId: string;
    walletId: string;
    tokenIn: Address;
    tokenOut: Address;
    amountIn: string;
    slippageBps?: number;
  }>();
  const rl = await rateLimit(redis, `quote:${body.userId}`, RATE_LIMITS.quote.limit, RATE_LIMITS.quote.windowMs);
  if (!rl.allowed) return c.json({ error: "rate_limited" }, 429);
  try {
    const address = await wallets.getAddress(body.walletId);
    const meta = await getErc20Metadata(client, body.tokenIn);
    const amountInRaw = (await import("@arctrade/security")).parseAmount(body.amountIn, meta.decimals).toString();
    const quote = await quotes.getQuote({
      userId: body.userId,
      walletAddress: address,
      tokenIn: body.tokenIn,
      tokenOut: body.tokenOut,
      amountInRaw,
      slippageBps: body.slippageBps ?? 50,
      tradeRequestId: createTradeRequestId(),
    });
    return c.json({ quote });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "quote_failed" }, 400);
  }
});

app.post("/v1/trades", async (c) => {
  const body = await c.req.json<{
    userId: string;
    walletId: string;
    quoteId: string;
    tradeRequestId?: string;
  }>();
  const rl = await rateLimit(redis, `trade:${body.userId}`, RATE_LIMITS.tradeCreate.limit, RATE_LIMITS.tradeCreate.windowMs);
  if (!rl.allowed) return c.json({ error: "rate_limited" }, 429);
  try {
    const result = await engine.confirmAndExecute({
      userId: body.userId,
      walletId: body.walletId,
      quoteId: body.quoteId,
      tradeRequestId: body.tradeRequestId ?? createTradeRequestId(),
    });
    return c.json({ ok: true, ...result });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "trade_failed" }, 400);
  }
});

app.get("/v1/users/:telegramId/overview", async (c) => {
  const user = await prisma.user.findUnique({
    where: { telegramId: c.req.param("telegramId") },
    include: {
      wallets: { select: { id: true, address: true, provider: true, status: true, network: true } },
      trades: { orderBy: { createdAt: "desc" }, take: 20 },
      positions: { include: { token: true } },
      watchlist: { include: { token: true } },
    },
  });
  if (!user) return c.json({ error: "not_found" }, 404);
  const wallet = user.wallets[0];
  let balances: unknown[] = [];
  if (wallet) {
    const tokens = [USDC_ERC20, EURC, CIRBTC] as Address[];
    balances = await Promise.all(
      tokens.map(async (token) => {
        try {
          const raw = await getErc20Balance(client, token, wallet.address as Address);
          const meta = await getErc20Metadata(client, token);
          return { ...meta, address: token, raw: raw.toString(), formatted: formatAmount(raw, meta.decimals) };
        } catch {
          return { address: token, error: "rpc_error" };
        }
      }),
    );
  }
  return c.json({
    user: {
      id: user.id,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      referralCode: user.referralCode,
      slippageBps: user.slippageBps,
      status: user.status,
    },
    wallets: user.wallets,
    balances,
    trades: user.trades,
    positions: user.positions,
    watchlist: user.watchlist,
  });
});

app.get("/v1/admin/metrics", async (c) => {
  if (!adminOk(c)) return c.json({ error: "unauthorized" }, 401);
  const now = new Date();
  const day = new Date(now.getTime() - 86400000);
  const week = new Date(now.getTime() - 7 * 86400000);
  const month = new Date(now.getTime() - 30 * 86400000);
  const [totalUsers, dau, wau, mau, trades, confirmed, failed] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastSeenAt: { gte: day } } }),
    prisma.user.count({ where: { lastSeenAt: { gte: week } } }),
    prisma.user.count({ where: { lastSeenAt: { gte: month } } }),
    prisma.trade.count(),
    prisma.trade.count({ where: { status: "CONFIRMED" } }),
    prisma.trade.count({ where: { status: "FAILED" } }),
  ]);
  const volumeRows = await prisma.trade.findMany({
    where: { status: "CONFIRMED", tokenIn: { equals: USDC_ERC20, mode: "insensitive" } },
    select: { amountIn: true, fee: true },
  });
  const volume = volumeRows.reduce((s, r) => s + Number(r.amountIn), 0);
  const fees = volumeRows.reduce((s, r) => s + Number(r.fee), 0);
  return c.json({
    totalUsers,
    dau,
    wau,
    mau,
    trades,
    confirmed,
    failed,
    volumeUsdc: volume,
    revenueFees: fees,
  });
});

app.get("/v1/admin/users", async (c) => {
  if (!adminOk(c)) return c.json({ error: "unauthorized" }, 401);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      telegramId: true,
      telegramUsername: true,
      status: true,
      createdAt: true,
      lastSeenAt: true,
      wallets: { select: { address: true, provider: true, status: true } },
    },
  });
  return c.json({ users });
});

app.post("/v1/admin/users/:id/disable", async (c) => {
  if (!adminOk(c)) return c.json({ error: "unauthorized" }, 401);
  await prisma.user.update({ where: { id: c.req.param("id") }, data: { status: "DISABLED" } });
  return c.json({ ok: true });
});

app.patch("/v1/admin/tokens/:id", async (c) => {
  if (!adminOk(c)) return c.json({ error: "unauthorized" }, 401);
  const body = await c.req.json<{ verified?: boolean }>();
  const token = await prisma.token.update({ where: { id: c.req.param("id") }, data: { verified: body.verified } });
  return c.json({ token });
});

app.patch("/v1/admin/fees", async (c) => {
  if (!adminOk(c)) return c.json({ error: "unauthorized" }, 401);
  const body = await c.req.json<{ tradingFeeBps?: number; referralRewardBps?: number }>();
  const row = await prisma.feeConfig.upsert({
    where: { id: "default" },
    create: { id: "default", ...body },
    update: body,
  });
  return c.json({ feeConfig: row });
});

const port = config.API_PORT;
log.info({ port }, "api listening");
serve({ fetch: app.fetch, port });

export { app };
