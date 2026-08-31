import { Bot, Context, InlineKeyboard, session, type SessionFlavor } from "grammy";
import Redis from "ioredis";
import { loadConfig } from "@arctrade/config";
import { createLogger } from "@arctrade/logging";
import { getOrCreateUser, prisma, requireActiveUser } from "@arctrade/database";
import {
  CIRBTC,
  EURC,
  USDC_ERC20,
  createArcPublicClient,
  explorerTxUrl,
  getErc20Balance,
  getErc20Metadata,
  validateTokenAddress,
} from "@arctrade/blockchain";
import {
  RATE_LIMITS,
  claimTelegramUpdate,
  createTradeRequestId,
  formatAmount,
  isHighSlippage,
  isValidEvmAddress,
  parseAmount,
  rateLimit,
} from "@arctrade/security";
import {
  MarketDataService,
  QuoteService,
  TradeEngine,
  createTradingProvider,
  getTrending,
  upsertToken,
} from "@arctrade/trading";
import { QuoteExpiredError, TradingUnavailableError } from "@arctrade/types";
import { createWalletProvider } from "@arctrade/wallet";
import type { Address } from "viem";
import type { BotSession } from "./session.js";
import {
  afterSubmitKeyboard,
  buyAmountKeyboard,
  cancelKeyboard,
  confirmTradeKeyboard,
  expiredQuoteKeyboard,
  highSlippageKeyboard,
  mainMenu,
  sellPctKeyboard,
  slippageKeyboard,
  startMessage,
  tokenActionsKeyboard,
  unverifiedKeyboard,
} from "./keyboards.js";

type AppContext = Context & SessionFlavor<BotSession>;

const log = createLogger("bot");

function redisFromUrl(url: string) {
  return new Redis(url, { maxRetriesPerRequest: null });
}

function knownTokens() {
  const c = loadConfig();
  return [
    { symbol: "USDC", address: c.USDC_CONTRACT_ADDRESS as Address },
    { symbol: "EURC", address: c.EURC_CONTRACT_ADDRESS as Address },
    { symbol: "cirBTC", address: c.CIRBTC_CONTRACT_ADDRESS as Address },
  ];
}

function tokenPickKeyboard(prefix: string) {
  const kb = new InlineKeyboard();
  for (const t of knownTokens()) {
    kb.text(t.symbol, `${prefix}:${t.address}`).row();
  }
  kb.text("Search token", `${prefix}:search`).text("❌ Cancel", "flow:cancel");
  return kb;
}

function formatQuoteCard(title: string, q: import("@arctrade/types").Quote): string {
  const impact = q.priceImpactBps == null ? "Unavailable (provider did not report)" : `${(q.priceImpactBps / 100).toFixed(2)}%`;
  const net = q.fees.find((f) => f.type === "network");
  const svc = q.fees.find((f) => f.type === "service");
  const prov = q.fees.find((f) => f.type === "provider");
  return [
    title,
    "",
    `Spend: ${q.amountInFormatted} ${q.tokenInSymbol}`,
    `Receive: ~${q.amountOutFormatted} ${q.tokenOutSymbol}`,
    `Minimum received: ${q.minAmountOutFormatted} ${q.tokenOutSymbol}`,
    `Price: ${q.price}`,
    `Price impact: ${impact}`,
    `Slippage: ${(q.slippageBps / 100).toFixed(2)}%`,
    `Network: Arc Testnet`,
    `Network fee: ${net?.amountUsd ?? "unavailable"}`,
    `ArcTrade fee: ${svc?.amountUsd ?? "0"} ${svc?.tokenSymbol ?? ""}`,
    `Provider fee: ${prov?.amount ?? "0"}`,
    `Route: ${q.route}`,
    `Execution: Standard transaction execution.`,
    "",
    "Confirm only if these amounts are acceptable.",
  ].join("\n");
}

async function main() {
  const config = loadConfig();
  if (!config.TELEGRAM_BOT_TOKEN) {
    log.warn("TELEGRAM_BOT_TOKEN missing — bot not started");
    return;
  }

  const redis = redisFromUrl(config.REDIS_URL);
  const wallets = createWalletProvider();
  const trading = createTradingProvider();
  const quotes = new QuoteService(trading, redis);
  const engine = new TradeEngine(trading, quotes, wallets);
  const market = new MarketDataService(redis);
  const client = createArcPublicClient();

  const verified = new Set(
    [USDC_ERC20, EURC, CIRBTC].map((a) => a.toLowerCase()),
  );

  const bot = new Bot<AppContext>(config.TELEGRAM_BOT_TOKEN);
  bot.use(session({ initial: (): BotSession => ({}) }));

  bot.use(async (ctx, next) => {
    if (ctx.update.update_id && !(await claimTelegramUpdate(redis, ctx.update.update_id))) {
      return;
    }
    const fromId = ctx.from?.id?.toString();
    if (fromId) {
      const rl = await rateLimit(
        redis,
        `tg:${fromId}`,
        RATE_LIMITS.telegramCommand.limit,
        RATE_LIMITS.telegramCommand.windowMs,
      );
      if (!rl.allowed) {
        await ctx.reply("Too many requests. Please wait a moment.");
        return;
      }
    }
    await next();
  });

  async function ensureUser(ctx: AppContext, startPayload?: string) {
    if (!ctx.from) throw new Error("No Telegram user.");
    const user = await getOrCreateUser({
      telegramId: ctx.from.id.toString(),
      telegramUsername: ctx.from.username,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      startPayload,
    });
    if (user.status !== "ACTIVE") throw new Error("This account is disabled.");
    const wallet = await wallets.createWallet(user.id);
    return { user, wallet };
  }

  async function replyError(ctx: AppContext, err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    log.error({ err }, "handler error");
    await ctx.reply(message);
  }

  bot.command("start", async (ctx) => {
    try {
      const payload = ctx.match?.toString() || undefined;
      await ensureUser(ctx, payload);
      await ctx.reply(startMessage(), { reply_markup: mainMenu() });
    } catch (err) {
      await replyError(ctx, err);
    }
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Commands",
        "/start /buy /sell /swap /balance /portfolio /positions",
        "/price /trending /watchlist /history /settings /referral /help",
        "",
        "Trading uses Circle Swap Kit on Arc Testnet (USDC, EURC, cirBTC).",
        "Unsupported pairs: Trading for this pair is currently unavailable.",
      ].join("\n"),
      { reply_markup: mainMenu() },
    );
  });

  async function showBalance(ctx: AppContext) {
    const { user, wallet } = await ensureUser(ctx);
    const address = wallet.address as Address;
    const lines = ["Balance", "", `Wallet: ${address}`, ""];
    for (const t of knownTokens()) {
      try {
        const raw = await getErc20Balance(client, t.address, address);
        const meta = await getErc20Metadata(client, t.address);
        lines.push(`${meta.symbol}: ${formatAmount(raw, meta.decimals)}`);
      } catch {
        lines.push(`${t.symbol}: unavailable (RPC error)`);
      }
    }
    lines.push("", "Native gas is USDC. Use the ERC-20 USDC interface for application balances.");
    await ctx.reply(lines.join("\n"), { reply_markup: mainMenu() });
    void user;
  }

  async function showPortfolio(ctx: AppContext) {
    const { user, wallet } = await ensureUser(ctx);
    const address = wallet.address as Address;
    const rows: { symbol: string; usd: string | null; formatted: string }[] = [];
    let total = 0;
    let priced = true;
    for (const t of knownTokens()) {
      try {
        const raw = await getErc20Balance(client, t.address, address);
        const meta = await getErc20Metadata(client, t.address);
        const md = await market.getPrice(t.address);
        const formatted = formatAmount(raw, meta.decimals);
        let usd: string | null = null;
        if (md.priceUsd) {
          const n = Number(formatted) * Number(md.priceUsd);
          if (Number.isFinite(n)) {
            usd = n.toFixed(2);
            total += n;
          }
        } else {
          priced = false;
        }
        rows.push({ symbol: meta.symbol, usd, formatted });
      } catch {
        priced = false;
      }
    }
    const positions = await prisma.position.findMany({ where: { userId: user.id } });
    const realized = positions.reduce((s, p) => s + Number(p.realizedPnl), 0);
    const lines = [
      "Portfolio",
      "",
      priced ? `Total: $${total.toFixed(2)}` : "Total: unavailable (missing marks)",
      "",
      ...rows.map((r) => `${r.symbol}: ${r.formatted}${r.usd ? `  ($${r.usd})` : ""}`),
      "",
      "P&L (realized, FIFO, confirmed trades):",
      `Total: ${realized >= 0 ? "+" : ""}${realized.toFixed(2)} USD`,
      "",
      "Unrealized P&L uses reference prices, not DEX mids. See docs/pnl.md.",
    ];
    await ctx.reply(lines.join("\n"), { reply_markup: mainMenu() });
  }

  async function showPositions(ctx: AppContext) {
    const { user } = await ensureUser(ctx);
    const positions = await prisma.position.findMany({
      where: { userId: user.id },
      include: { token: true },
    });
    if (!positions.length) {
      await ctx.reply("No positions yet. Confirmed trades create positions.", { reply_markup: mainMenu() });
      return;
    }
    const parts: string[] = ["Positions", ""];
    for (const p of positions) {
      const md = await market.getPrice(p.token.address as Address);
      const stale = md.stale || md.priceUsd == null;
      parts.push(p.token.symbol);
      parts.push(`Position qty: ${p.quantity}`);
      parts.push(`Average entry: $${p.averageEntryPrice}`);
      parts.push(md.priceUsd ? `Current: $${md.priceUsd}` : "Current: no verified price");
      parts.push(`Unrealized: ${stale ? "not exact — " : ""}${p.unrealizedPnl}`);
      if (md.priceUsd) parts.push(`Price updated ${md.ageSeconds} seconds ago.`);
      parts.push(`Realized: ${p.realizedPnl}`);
      parts.push("");
    }
    await ctx.reply(parts.join("\n"), { reply_markup: mainMenu() });
  }

  async function showHistory(ctx: AppContext) {
    const { user } = await ensureUser(ctx);
    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    if (!trades.length) {
      await ctx.reply("No trades yet.", { reply_markup: mainMenu() });
      return;
    }
    const lines = trades.map((t) => {
      const link = t.transactionHash ? explorerTxUrl(t.transactionHash, config.ARC_EXPLORER_URL) : "";
      return `${t.status}  ${t.amountIn} → ${t.amountOut}  ${t.route}${link ? `\n${link}` : ""}`;
    });
    await ctx.reply(["History", "", ...lines].join("\n"), { reply_markup: mainMenu() });
  }

  async function showWatchlist(ctx: AppContext) {
    const { user } = await ensureUser(ctx);
    const items = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: { token: true },
    });
    if (!items.length) {
      await ctx.reply("Watchlist is empty. Use /price then ⭐ Watch.", { reply_markup: mainMenu() });
      return;
    }
    const kb = new InlineKeyboard();
    for (const i of items) {
      kb.text(`${i.token.symbol}`, `priceaddr:${i.token.address}`).row();
    }
    kb.text("« Menu", "menu:home");
    await ctx.reply("Watchlist", { reply_markup: kb });
  }

  async function showTrending(ctx: AppContext) {
    const trending = await getTrending();
    if (!trending.items.length) {
      await ctx.reply(
        `${trending.label}\n\nNo confirmed ArcTrade volume yet. Rankings are organic product activity, not sponsored.`,
        { reply_markup: mainMenu() },
      );
      return;
    }
    const lines = [
      "🔥 Trending on Arc",
      "",
      trending.label,
      "Not sponsored. Not an on-chain ranking.",
      "",
      ...trending.items.map((i, idx) => `${idx + 1}. ${i.address}  trades=${i.trades}  vol≈${i.volumeUsdc} USDC`),
    ];
    await ctx.reply(lines.join("\n"), { reply_markup: mainMenu() });
  }

  async function showSettings(ctx: AppContext) {
    const { user } = await ensureUser(ctx);
    await ctx.reply(
      [
        "Settings",
        "",
        `Slippage: ${user.slippageBps / 100}%`,
        `Token policy: ${user.tokenPolicy}`,
        `Trade confirmed alerts: ${user.notifyTradeConfirmed ? "on" : "off"}`,
        `Trade failed alerts: ${user.notifyTradeFailed ? "on" : "off"}`,
        `Price alerts: ${user.notifyPriceAlerts ? "on" : "off"}`,
        "",
        "Notifications are opt-in per type. We do not spam.",
      ].join("\n"),
      { reply_markup: slippageKeyboard(user.slippageBps) },
    );
  }

  async function showReferral(ctx: AppContext) {
    const { user } = await ensureUser(ctx);
    const count = await prisma.referral.count({ where: { referrerUserId: user.id } });
    const link = `https://t.me/${config.TELEGRAM_BOT_USERNAME}?start=${user.referralCode}`;
    await ctx.reply(
      [
        "Referral",
        "",
        `Your code: ${user.referralCode}`,
        link,
        "",
        `Referred users: ${count}`,
        "",
        "Rewards are configurable and currently not a promised payout. Do not assume cashback unless an admin fee config enables it.",
      ].join("\n"),
      { reply_markup: mainMenu() },
    );
  }

  async function showPrice(ctx: AppContext, addressOrSymbol: string) {
    const { user } = await ensureUser(ctx);
    let address: Address | undefined;
    const known = knownTokens().find((t) => t.symbol.toLowerCase() === addressOrSymbol.toLowerCase());
    if (known) address = known.address;
    else if (isValidEvmAddress(addressOrSymbol)) address = addressOrSymbol as Address;
    if (!address) {
      await ctx.reply("Send a token symbol (USDC, EURC, cirBTC) or a contract address.", {
        reply_markup: cancelKeyboard(),
      });
      ctx.session.flow = "price";
      return;
    }
    const token = await prisma.token.findFirst({
      where: { address: { equals: address, mode: "insensitive" } },
    });
    const md = await market.getPrice(address);
    const meta = token ?? (await getErc20Metadata(client, address).catch(() => null));
    const symbol = meta && "symbol" in meta ? meta.symbol : md.symbol;
    const name = meta && "name" in meta ? meta.name : symbol;
    await ctx.reply(
      [
        `${name} (${symbol})`,
        "",
        md.priceUsd ? `Price: $${md.priceUsd}` : "Price: unavailable (no verified source)",
        `24h: ${md.change24h ?? "unavailable"}`,
        `Liquidity: ${md.liquidity ?? "unavailable"}`,
        `Volume: ${md.volume24h ?? "unavailable"}`,
        `Contract: ${address}`,
        `Source: ${md.source}`,
        `Price updated ${md.ageSeconds} seconds ago.`,
      ].join("\n"),
      { reply_markup: tokenActionsKeyboard(address) },
    );
    void user;
  }

  async function beginBuy(ctx: AppContext) {
    ctx.session.flow = "buy";
    ctx.session.tokenIn = USDC_ERC20;
    await ctx.reply("Choose token to buy, or search by contract address.", {
      reply_markup: tokenPickKeyboard("buytok"),
    });
  }

  async function beginSell(ctx: AppContext) {
    const { wallet } = await ensureUser(ctx);
    ctx.session.flow = "sell";
    ctx.session.tokenOut = USDC_ERC20;
    const kb = new InlineKeyboard();
    for (const t of knownTokens().filter((x) => x.symbol !== "USDC")) {
      try {
        const raw = await getErc20Balance(client, t.address, wallet.address as Address);
        const meta = await getErc20Metadata(client, t.address);
        kb.text(`${meta.symbol}  ${formatAmount(raw, meta.decimals)}`, `seltok:${t.address}`).row();
      } catch {
        kb.text(`${t.symbol}  (RPC error)`, `seltok:${t.address}`).row();
      }
    }
    kb.text("Search token", "seltok:search").text("❌ Cancel", "flow:cancel");
    await ctx.reply("Select a token you hold.", { reply_markup: kb });
  }

  async function requestQuote(ctx: AppContext, side: "buy" | "sell" | "swap") {
    const { user, wallet } = await ensureUser(ctx);
    const tokenIn = ctx.session.tokenIn as Address | undefined;
    const tokenOut = ctx.session.tokenOut as Address | undefined;
    const amount = ctx.session.amountIn;
    if (!tokenIn || !tokenOut || !amount) {
      await ctx.reply("Missing token or amount.");
      return;
    }
    const rl = await rateLimit(redis, `quote:${user.id}`, RATE_LIMITS.quote.limit, RATE_LIMITS.quote.windowMs);
    if (!rl.allowed) {
      await ctx.reply("Quote rate limit. Try again shortly.");
      return;
    }
    const inMeta = await getErc20Metadata(client, tokenIn);
    const amountInRaw = parseAmount(amount, inMeta.decimals).toString();
    const tradeRequestId = createTradeRequestId();
    ctx.session.tradeRequestId = tradeRequestId;
    try {
      const quote = await quotes.getQuote({
        userId: user.id,
        walletAddress: wallet.address as Address,
        tokenIn,
        tokenOut,
        amountInRaw,
        slippageBps: user.slippageBps,
        tradeRequestId,
      });
      ctx.session.quoteId = quote.quoteId;
      await engine.createQuotedTrade({
        userId: user.id,
        walletId: wallet.id,
        tradeRequestId,
        quote,
      });
      const title = side === "buy" ? `BUY ${quote.tokenOutSymbol}` : side === "sell" ? `SELL ${quote.tokenInSymbol}` : "SWAP";
      await ctx.reply(formatQuoteCard(title, quote), { reply_markup: confirmTradeKeyboard(side) });
    } catch (err) {
      if (err instanceof TradingUnavailableError) {
        await ctx.reply(err.message, { reply_markup: mainMenu() });
        return;
      }
      throw err;
    }
  }

  bot.command("buy", (ctx) => beginBuy(ctx).catch((e) => replyError(ctx, e)));
  bot.command("sell", (ctx) => beginSell(ctx).catch((e) => replyError(ctx, e)));
  bot.command("swap", async (ctx) => {
    ctx.session.flow = "swap";
    await ctx.reply("Swap: choose the token you pay with.", { reply_markup: tokenPickKeyboard("swpin") });
  });
  bot.command("balance", (ctx) => showBalance(ctx).catch((e) => replyError(ctx, e)));
  bot.command("portfolio", (ctx) => showPortfolio(ctx).catch((e) => replyError(ctx, e)));
  bot.command("positions", (ctx) => showPositions(ctx).catch((e) => replyError(ctx, e)));
  bot.command("history", (ctx) => showHistory(ctx).catch((e) => replyError(ctx, e)));
  bot.command("watchlist", (ctx) => showWatchlist(ctx).catch((e) => replyError(ctx, e)));
  bot.command("trending", (ctx) => showTrending(ctx).catch((e) => replyError(ctx, e)));
  bot.command("settings", (ctx) => showSettings(ctx).catch((e) => replyError(ctx, e)));
  bot.command("referral", (ctx) => showReferral(ctx).catch((e) => replyError(ctx, e)));
  bot.command("price", async (ctx) => {
    const arg = ctx.match?.toString().trim();
    if (!arg) {
      ctx.session.flow = "price";
      await ctx.reply("Send a symbol or contract address.", { reply_markup: cancelKeyboard() });
      return;
    }
    await showPrice(ctx, arg);
  });

  bot.callbackQuery("menu:home", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(startMessage(), { reply_markup: mainMenu() });
  });
  bot.callbackQuery("menu:balance", async (ctx) => {
    await ctx.answerCallbackQuery();
    await showBalance(ctx);
  });
  bot.callbackQuery("menu:buy", async (ctx) => {
    await ctx.answerCallbackQuery();
    await beginBuy(ctx);
  });
  bot.callbackQuery("menu:sell", async (ctx) => {
    await ctx.answerCallbackQuery();
    await beginSell(ctx);
  });
  bot.callbackQuery("menu:swap", async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.flow = "swap";
    await ctx.reply("Swap: choose the token you pay with.", { reply_markup: tokenPickKeyboard("swpin") });
  });
  bot.callbackQuery("menu:positions", async (ctx) => {
    await ctx.answerCallbackQuery();
    await showPositions(ctx);
  });
  bot.callbackQuery("menu:watchlist", async (ctx) => {
    await ctx.answerCallbackQuery();
    await showWatchlist(ctx);
  });
  bot.callbackQuery("menu:trending", async (ctx) => {
    await ctx.answerCallbackQuery();
    await showTrending(ctx);
  });
  bot.callbackQuery("menu:history", async (ctx) => {
    await ctx.answerCallbackQuery();
    await showHistory(ctx);
  });
  bot.callbackQuery("menu:settings", async (ctx) => {
    await ctx.answerCallbackQuery();
    await showSettings(ctx);
  });
  bot.callbackQuery("menu:referral", async (ctx) => {
    await ctx.answerCallbackQuery();
    await showReferral(ctx);
  });

  bot.callbackQuery("flow:cancel", async (ctx) => {
    ctx.session = {};
    await ctx.answerCallbackQuery("Cancelled");
    await ctx.reply("Cancelled.", { reply_markup: mainMenu() });
  });

  bot.callbackQuery(/^buytok:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const value = ctx.match[1]!;
    if (value === "search") {
      ctx.session.flow = "buy";
      await ctx.reply("Paste the token contract address.", { reply_markup: cancelKeyboard() });
      return;
    }
    await acceptBuyToken(ctx, value);
  });

  async function acceptBuyToken(ctx: AppContext, raw: string) {
    const { user } = await ensureUser(ctx);
    const validated = await validateTokenAddress(client, raw, {
      verifiedAddresses: verified,
      policy: user.tokenPolicy,
    });
    await upsertToken({
      chainId: config.ARC_CHAIN_ID,
      address: validated.address,
      symbol: validated.symbol,
      name: validated.name,
      decimals: validated.decimals,
      verified: validated.verified,
    });
    ctx.session.tokenOut = validated.address;
    ctx.session.tokenIn = USDC_ERC20;
    if (validated.warning) {
      ctx.session.pendingUnverified = validated.address;
      await ctx.reply(
        `${validated.warning}\n\nContract:\n${validated.address}\n\nLiquidity: unavailable until a quote succeeds.`,
        { reply_markup: unverifiedKeyboard() },
      );
      return;
    }
    await ctx.reply(`${validated.symbol}\n\nYou pay:`, { reply_markup: buyAmountKeyboard() });
  }

  bot.callbackQuery("token:unverified:continue", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply("You pay:", { reply_markup: buyAmountKeyboard() });
  });

  bot.callbackQuery(/^buyamt:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const v = ctx.match[1]!;
    if (v === "custom") {
      ctx.session.flow = "custom_amount";
      await ctx.reply("Enter USDC amount.", { reply_markup: cancelKeyboard() });
      return;
    }
    ctx.session.amountIn = v;
    await requestQuote(ctx, "buy");
  });

  bot.callbackQuery(/^seltok:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const value = ctx.match[1]!;
    if (value === "search") {
      ctx.session.flow = "sell";
      await ctx.reply("Paste the token contract address to sell.", { reply_markup: cancelKeyboard() });
      return;
    }
    ctx.session.tokenIn = value;
    ctx.session.tokenOut = USDC_ERC20;
    const { wallet } = await ensureUser(ctx);
    const raw = await getErc20Balance(client, value as Address, wallet.address as Address);
    const meta = await getErc20Metadata(client, value as Address);
    await ctx.reply(`Balance:\n${formatAmount(raw, meta.decimals)} ${meta.symbol}`, {
      reply_markup: sellPctKeyboard(),
    });
  });

  bot.callbackQuery(/^sellpct:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const v = ctx.match[1]!;
    if (v === "custom") {
      ctx.session.flow = "custom_amount";
      await ctx.reply("Enter token amount to sell.", { reply_markup: cancelKeyboard() });
      return;
    }
    const { wallet } = await ensureUser(ctx);
    const tokenIn = ctx.session.tokenIn as Address;
    const raw = await getErc20Balance(client, tokenIn, wallet.address as Address);
    const meta = await getErc20Metadata(client, tokenIn);
    const pct = BigInt(v);
    const sellRaw = (raw * pct) / 100n;
    ctx.session.amountIn = formatAmount(sellRaw, meta.decimals, meta.decimals);
    await requestQuote(ctx, "sell");
  });

  bot.callbackQuery(/^swpin:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const value = ctx.match[1]!;
    if (value === "search") {
      await ctx.reply("Paste input token address.", { reply_markup: cancelKeyboard() });
      ctx.session.flow = "swap";
      ctx.session.lastAction = "in";
      return;
    }
    ctx.session.tokenIn = value;
    await ctx.reply("Choose token to receive.", { reply_markup: tokenPickKeyboard("swpout") });
  });

  bot.callbackQuery(/^swpout:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const value = ctx.match[1]!;
    if (value === "search") {
      await ctx.reply("Paste output token address.", { reply_markup: cancelKeyboard() });
      ctx.session.lastAction = "out";
      return;
    }
    ctx.session.tokenOut = value;
    ctx.session.flow = "custom_amount";
    await ctx.reply("Enter amount of the input token.", { reply_markup: cancelKeyboard() });
  });

  bot.callbackQuery(/^slip:(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const bps = Number(ctx.match[1]);
    if (isHighSlippage(bps)) {
      ctx.session.pendingHighSlippage = bps;
      await ctx.reply(
        `⚠️ High slippage\n\nCurrent: ${bps / 100}%\n\nThis may result in significantly worse execution.`,
        { reply_markup: highSlippageKeyboard() },
      );
      return;
    }
    const { user } = await ensureUser(ctx);
    await prisma.user.update({ where: { id: user.id }, data: { slippageBps: bps } });
    await ctx.reply(`Slippage set to ${bps / 100}%.`, { reply_markup: mainMenu() });
  });

  bot.callbackQuery("slip:custom", async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.flow = "custom_slippage";
    await ctx.reply("Enter slippage percent (e.g. 0.5). Max is configured by MAX_SLIPPAGE_BPS.", {
      reply_markup: cancelKeyboard(),
    });
  });

  bot.callbackQuery("slip:high:continue", async (ctx) => {
    await ctx.answerCallbackQuery();
    const bps = ctx.session.pendingHighSlippage;
    if (bps == null) return;
    if (bps > config.MAX_SLIPPAGE_BPS) {
      await ctx.reply(`Slippage exceeds maximum of ${config.MAX_SLIPPAGE_BPS / 100}%.`);
      return;
    }
    const { user } = await ensureUser(ctx);
    await prisma.user.update({ where: { id: user.id }, data: { slippageBps: bps } });
    await ctx.reply(`Slippage set to ${bps / 100}%.`, { reply_markup: mainMenu() });
  });

  bot.callbackQuery(/^watch:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const address = ctx.match[1]!;
    const { user } = await ensureUser(ctx);
    const token = await upsertToken({
      chainId: config.ARC_CHAIN_ID,
      address,
      symbol: (await getErc20Metadata(client, address as Address).catch(() => ({ symbol: "TOKEN", name: "Token", decimals: 18 }))).symbol,
      name: "Token",
      decimals: 18,
    });
    await prisma.watchlist.upsert({
      where: { userId_tokenId: { userId: user.id, tokenId: token.id } },
      create: { userId: user.id, tokenId: token.id },
      update: {},
    });
    await ctx.reply("Added to watchlist.", { reply_markup: mainMenu() });
  });

  bot.callbackQuery(/^tokbuy:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await acceptBuyToken(ctx, ctx.match[1]!);
  });

  bot.callbackQuery(/^toksell:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    ctx.session.tokenIn = ctx.match[1];
    ctx.session.tokenOut = USDC_ERC20;
    ctx.session.flow = "sell";
    const { wallet } = await ensureUser(ctx);
    const raw = await getErc20Balance(client, ctx.match[1]! as Address, wallet.address as Address);
    const meta = await getErc20Metadata(client, ctx.match[1]! as Address);
    await ctx.reply(`Balance:\n${formatAmount(raw, meta.decimals)} ${meta.symbol}`, {
      reply_markup: sellPctKeyboard(),
    });
  });

  bot.callbackQuery(/^priceaddr:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await showPrice(ctx, ctx.match[1]!);
  });

  bot.callbackQuery("quote:refresh", async (ctx) => {
    await ctx.answerCallbackQuery();
    const side = ctx.session.flow === "sell" ? "sell" : ctx.session.flow === "swap" ? "swap" : "buy";
    await requestQuote(ctx, side);
  });

  bot.callbackQuery("trade:confirm", async (ctx) => {
    await ctx.answerCallbackQuery();
    const { user, wallet } = await ensureUser(ctx);
    if (!ctx.session.quoteId || !ctx.session.tradeRequestId) {
      await ctx.reply("No quote to confirm.");
      return;
    }
    const rl = await rateLimit(
      redis,
      `trade:${user.id}`,
      RATE_LIMITS.tradeCreate.limit,
      RATE_LIMITS.tradeCreate.windowMs,
    );
    if (!rl.allowed) {
      await ctx.reply("Trade rate limit. Slow down.");
      return;
    }
    try {
      const result = await engine.confirmAndExecute({
        userId: user.id,
        walletId: wallet.id,
        tradeRequestId: ctx.session.tradeRequestId,
        quoteId: ctx.session.quoteId,
      });
      await ctx.reply(
        [
          "⏳ Transaction submitted.",
          "",
          `Buy: ${result.quote.amountOutFormatted} ${result.quote.tokenOutSymbol}`,
          `Spent: ${result.quote.amountInFormatted} ${result.quote.tokenInSymbol}`,
          "",
          "Confirmation requires a successful on-chain receipt — a hash alone is not enough.",
        ].join("\n"),
        { reply_markup: afterSubmitKeyboard(result.explorerUrl) },
      );
    } catch (err) {
      if (err instanceof QuoteExpiredError) {
        await ctx.reply("This quote expired.", { reply_markup: expiredQuoteKeyboard() });
        return;
      }
      const reason = err instanceof Error ? err.message : "Unknown error";
      await ctx.reply(
        [
          "❌ Trade failed.",
          "",
          "Your funds were not successfully swapped.",
          "",
          `Reason: ${reason}`,
          "",
          "Status is based on submission/chain errors. Do not assume funds are safe if a transaction may still be pending.",
        ].join("\n"),
        { reply_markup: mainMenu() },
      );
    }
  });

  bot.on("message:text", async (ctx, next) => {
    if (ctx.message.text.startsWith("/")) return next();
    const flow = ctx.session.flow;
    const text = ctx.message.text.trim();
    try {
      if (flow === "price" || flow === "watch") {
        await showPrice(ctx, text);
        ctx.session.flow = undefined;
        return;
      }
      if (flow === "buy" && isValidEvmAddress(text)) {
        await acceptBuyToken(ctx, text);
        return;
      }
      if (flow === "sell" && isValidEvmAddress(text)) {
        ctx.session.tokenIn = text;
        ctx.session.tokenOut = USDC_ERC20;
        await ctx.reply("Choose percentage to sell.", { reply_markup: sellPctKeyboard() });
        return;
      }
      if (flow === "custom_amount") {
        ctx.session.amountIn = text;
        const side = ctx.session.tokenOut === USDC_ERC20 ? "sell" : ctx.session.flow === "swap" ? "swap" : "buy";
        await requestQuote(ctx, side === "sell" ? "sell" : side === "swap" ? "swap" : "buy");
        return;
      }
      if (flow === "custom_slippage") {
        const pct = Number(text.replace("%", ""));
        if (!Number.isFinite(pct) || pct < 0) {
          await ctx.reply("Invalid slippage.");
          return;
        }
        const bps = Math.round(pct * 100);
        if (bps > config.MAX_SLIPPAGE_BPS) {
          await ctx.reply(`Maximum slippage is ${config.MAX_SLIPPAGE_BPS / 100}%.`);
          return;
        }
        if (isHighSlippage(bps)) {
          ctx.session.pendingHighSlippage = bps;
          await ctx.reply(
            `⚠️ High slippage\n\nCurrent: ${pct}%\n\nThis may result in significantly worse execution.`,
            { reply_markup: highSlippageKeyboard() },
          );
          return;
        }
        const user = await requireActiveUser(ctx.from!.id.toString());
        await prisma.user.update({ where: { id: user.id }, data: { slippageBps: bps } });
        ctx.session.flow = undefined;
        await ctx.reply(`Slippage set to ${pct}%.`, { reply_markup: mainMenu() });
        return;
      }
    } catch (err) {
      await replyError(ctx, err);
      return;
    }
    await next();
  });

  bot.catch((err) => {
    log.error({ err: err.error }, "bot crash");
  });

  log.info("ArcTrade bot starting");
  await bot.start({
    onStart: (info) => log.info({ username: info.username }, "bot online"),
  });
}

main().catch((err) => {
  log.error({ err }, "fatal");
  process.exit(1);
});
