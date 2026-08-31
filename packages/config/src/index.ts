import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";
import type { AccountingMethod, TokenPolicy } from "@arctrade/types";

function loadEnvFile(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
    resolve(here, "../../../.env"),
    resolve(here, "../../.env"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      loadDotenv({ path, override: false });
    }
  }
}

loadEnvFile();

function normalizeKitKey(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("KIT_KEY:")) return trimmed;
  if (trimmed.includes(":")) return `KIT_KEY:${trimmed}`;
  return trimmed;
}

const optionalUrl = z.string().url().optional().or(z.literal(""));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_BOT_USERNAME: z.string().default("ArcTradeBot"),
  ARC_RPC_URL: z.string().url().default("https://rpc.testnet.arc.io"),
  ARC_RPC_FALLBACK_URL: optionalUrl,
  ARC_WSS_URL: z.string().default("wss://rpc.testnet.arc.io"),
  ARC_CHAIN_ID: z.coerce.number().int().default(5042002),
  ARC_EXPLORER_URL: z.string().url().default("https://testnet.arcscan.app"),
  USDC_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0x3600000000000000000000000000000000000000"),
  EURC_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"),
  CIRBTC_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default("0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  API_URL: z.string().default("http://localhost:3001"),
  API_PORT: z.coerce.number().int().default(3001),
  ENCRYPTION_KEY: z.string().optional().default(""),
  SESSION_SECRET: z.string().optional().default(""),
  SENTRY_DSN: z.string().optional().default(""),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  TRADING_PROVIDER: z.string().default("circle-swap"),
  TRADING_API_URL: z.string().optional().default(""),
  TRADING_API_KEY: z.string().optional().default(""),
  CIRCLE_KIT_KEY: z.string().optional().default(""),
  TRADING_FEE_BPS: z.coerce.number().int().min(0).max(1000).default(5),
  MAX_SLIPPAGE_BPS: z.coerce.number().int().min(1).max(5000).default(500),
  QUOTE_TTL_SECONDS: z.coerce.number().int().min(5).max(300).default(30),
  TOKEN_POLICY: z.enum(["STRICT", "VERIFIED_ONLY", "WARN_UNVERIFIED"]).default("WARN_UNVERIFIED"),
  ACCOUNTING_METHOD: z.enum(["FIFO", "LIFO", "AVERAGE"]).default("FIFO"),
  ADMIN_TELEGRAM_IDS: z.string().optional().default(""),
  ADMIN_API_KEY: z.string().optional().default(""),
  MARKET_DATA_EUR_URL: z
    .string()
    .default("https://api.frankfurter.app/latest?from=EUR&to=USD"),
  MARKET_DATA_BTC_URL: z
    .string()
    .default("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"),
  DEV_SIGNER_ENABLED: z
    .string()
    .optional()
    .default("true")
    .transform((v) => v !== "false"),
});

export type AppConfig = z.infer<typeof envSchema> & {
  tokenPolicy: TokenPolicy;
  accountingMethod: AccountingMethod;
  adminTelegramIds: string[];
};

let cached: AppConfig | undefined;

export function loadConfig(overrides?: Record<string, string | undefined>): AppConfig {
  if (cached && !overrides) return cached;
  const parsed = envSchema.parse({ ...process.env, ...overrides });
  const config: AppConfig = {
    ...parsed,
    CIRCLE_KIT_KEY: normalizeKitKey(parsed.CIRCLE_KIT_KEY),
    tokenPolicy: parsed.TOKEN_POLICY,
    accountingMethod: parsed.ACCOUNTING_METHOD,
    adminTelegramIds: parsed.ADMIN_TELEGRAM_IDS.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  if (!overrides) cached = config;
  return config;
}

export function resetConfigCache(): void {
  cached = undefined;
}

export function isAdminTelegramId(telegramId: string, config = loadConfig()): boolean {
  return config.adminTelegramIds.includes(telegramId);
}
