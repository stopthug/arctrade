import { prisma } from "@arctrade/database";
import { loadConfig } from "@arctrade/config";
import { createLogger } from "@arctrade/logging";
import {
  CIRBTC,
  EURC,
  USDC_ERC20,
  createArcPublicClient,
  getErc20Balance,
  getErc20Metadata,
} from "@arctrade/blockchain";
import { formatAmount, normalizeAddress } from "@arctrade/security";
import type { Address } from "viem";

interface CacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
}

const log = createLogger("market-data");
const TTL = 20;

export interface MarketPrice {
  symbol: string;
  address: Address;
  priceUsd: string | null;
  change24h: string | null;
  liquidity: string | null;
  volume24h: string | null;
  marketCap: string | null;
  source: string;
  updatedAt: string;
  stale: boolean;
  ageSeconds: number;
}

export class MarketDataService {
  constructor(private readonly redis: CacheClient) {}

  async getPrice(address: Address): Promise<MarketPrice> {
    const checksum = normalizeAddress(address);
    const cacheKey = `md:${checksum}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as MarketPrice;
      const age = Math.floor((Date.now() - Date.parse(parsed.updatedAt)) / 1000);
      return { ...parsed, ageSeconds: age, stale: age > 60 };
    }
    const fresh = await this.fetchPrice(checksum);
    await this.redis.set(cacheKey, JSON.stringify(fresh), "EX", TTL);
    return { ...fresh, ageSeconds: 0, stale: false };
  }

  private async fetchPrice(address: Address): Promise<MarketPrice> {
    const lower = address.toLowerCase();
    const now = new Date().toISOString();
    const config = loadConfig();

    if (lower === USDC_ERC20.toLowerCase()) {
      return {
        symbol: "USDC",
        address,
        priceUsd: "1",
        change24h: null,
        liquidity: null,
        volume24h: null,
        marketCap: null,
        source: "Arc native USDC ($1 by protocol design)",
        updatedAt: now,
        stale: false,
        ageSeconds: 0,
      };
    }

    if (lower === EURC.toLowerCase()) {
      const usd = await this.fetchEurUsd(config.MARKET_DATA_EUR_URL);
      return {
        symbol: "EURC",
        address,
        priceUsd: usd,
        change24h: null,
        liquidity: null,
        volume24h: null,
        marketCap: null,
        source: "Frankfurter ECB EUR/USD reference (not a DEX price)",
        updatedAt: now,
        stale: false,
        ageSeconds: 0,
      };
    }

    if (lower === CIRBTC.toLowerCase()) {
      const usd = await this.fetchBtcUsd(config.MARKET_DATA_BTC_URL);
      return {
        symbol: "cirBTC",
        address,
        priceUsd: usd,
        change24h: null,
        liquidity: null,
        volume24h: null,
        marketCap: null,
        source: "CoinGecko BTC/USD reference. Testnet cirBTC is not redeemable BTC.",
        updatedAt: now,
        stale: false,
        ageSeconds: 0,
      };
    }

    return {
      symbol: "UNKNOWN",
      address,
      priceUsd: null,
      change24h: null,
      liquidity: null,
      volume24h: null,
      marketCap: null,
      source: "No verified market-data source for this token.",
      updatedAt: now,
      stale: false,
      ageSeconds: 0,
    };
  }

  private async fetchEurUsd(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as { rates?: { USD?: number } };
      const usd = data.rates?.USD;
      if (typeof usd !== "number" || !Number.isFinite(usd)) return null;
      return usd.toString();
    } catch (err) {
      log.warn({ err }, "EURUSD fetch failed");
      return null;
    }
  }

  private async fetchBtcUsd(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as { bitcoin?: { usd?: number } };
      const usd = data.bitcoin?.usd;
      if (typeof usd !== "number" || !Number.isFinite(usd)) return null;
      return usd.toString();
    } catch (err) {
      log.warn({ err }, "BTCUSD fetch failed");
      return null;
    }
  }
}

export async function readTokenBalance(owner: Address, token: Address) {
  const client = createArcPublicClient();
  const [raw, meta] = await Promise.all([
    getErc20Balance(client, token, owner),
    getErc20Metadata(client, token),
  ]);
  return {
    ...meta,
    raw: raw.toString(),
    formatted: formatAmount(raw, meta.decimals),
    address: token,
  };
}

export async function upsertToken(meta: {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  verified?: boolean;
}) {
  return prisma.token.upsert({
    where: { chainId_address: { chainId: meta.chainId, address: meta.address } },
    create: meta,
    update: {
      symbol: meta.symbol,
      name: meta.name,
      decimals: meta.decimals,
      verified: meta.verified ?? undefined,
    },
  });
}
