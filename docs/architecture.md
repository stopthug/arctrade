# Architecture

ArcTrade is a TypeScript pnpm monorepo. Telegram is the primary client. The web app is a portfolio and trading terminal that talks to the same API and domain packages.

## System context

```
Telegram user ──► grammY bot ──► domain packages ──► Arc RPC / Circle Swap Kit
                         │                │
                         │                ├── PostgreSQL (Prisma)
                         │                └── Redis (cache, rate limits, queues)
Web user ────► Next.js ──► Hono API ──────┘
Workers ─────────────────► BullMQ (Redis) ─► confirmation, market data, portfolio, notifications
```

The bot calls domain packages **in-process** for latency. The web app uses the HTTP API. Both share the same wallet, trading, and portfolio logic.

## Packages

| Package | Responsibility |
| --- | --- |
| `@arctrade/types` | Shared enums and DTOs |
| `@arctrade/config` | Zod-validated environment |
| `@arctrade/logging` | Pino; redacts secrets |
| `@arctrade/security` | Encryption, address validation, rate limits, audit helpers |
| `@arctrade/database` | Prisma schema and client |
| `@arctrade/blockchain` | Arc chain definition, RPC client, ERC-20, gas |
| `@arctrade/wallet` | `WalletProvider` — create/get/sign/send. Custody is swappable |
| `@arctrade/trading` | `TradingProvider`, quotes, fees, execution state machine |

## Apps

| App | Role |
| --- | --- |
| `apps/bot` | grammY commands, inline keyboards, confirmation flows |
| `apps/api` | `/health`, `/ready`, REST for web + admin |
| `apps/web` | Marketing, dashboard, terminal, admin |
| `apps/worker` | Tx confirmation, market data, portfolio, notifications |

## Trading lifecycle

1. User authenticates via Telegram `id` (never username).
2. Wallet is created (encrypted local signer on testnet/dev) or resolved.
3. Token is validated (address, chain, contract, ERC-20, policy).
4. Quote is requested from `TradingProvider.getQuote`.
5. Fees, min received, price impact (when provided by the provider) are shown.
6. User confirms. Idempotency key (`tradeRequestId`) is reserved **before** signing.
7. Quote expiry is checked. Expired quotes are not executed.
8. State: `CREATED → QUOTED → CONFIRMING → SIGNING → SUBMITTED → PENDING → CONFIRMED | FAILED`.
9. Worker watches the hash. Confirmation requires a successful receipt, not just a hash.
10. Positions and P&L update only after `CONFIRMED`.

## Quote lifecycle

- Quotes are cached in Redis with a short TTL (`QUOTE_TTL_SECONDS`, default 30s).
- Stored quotes include provider payload, min out, fee snapshot, and expiry.
- Execute path loads the quote by id; if expired → `EXPIRED` + “Get New Quote”.
- Providers that do not support a pair return a typed `TradingUnavailableError`. The UI shows the unavailable message. No synthetic mid-price is used.

## Wallet model

See [wallet-security.md](wallet-security.md). Trading code depends only on `WalletProvider`. Production custody (MPC, embedded wallet, smart account, external signer) replaces the local signer without rewriting buy/sell.

## Transaction model

`Transaction` rows are the chain-level record. `Trade` rows are the product-level swap. A trade may have approval + swap transactions. Status is advanced by the worker from receipts.

## P&L

- Default accounting: **FIFO** (configurable).
- Quantities and prices use `decimal.js` — never IEEE-754 floats for money.
- Unrealized P&L requires a fresh price; stale quotes are labeled with age.
- Testnet reference prices (EUR, BTC) are not claimed as DEX execution prices.

## Background work

BullMQ queues:

- `tx-monitor` — receipt polling / confirmation
- `market-data` — USDC/EURC/cirBTC reference refresh
- `portfolio` — position mark-to-market
- `notify` — Telegram notifications (user settings honored)

Jobs are idempotent on business keys (`tradeId`, `hash`, `userId+tokenId`).

## What is intentionally not built

Copy trading, snipers, sandwiches, wash trading, fake trending, undisclosed promotions. Trending is derived from **ArcTrade’s own confirmed trades**, labeled as such, never as organic on-chain rank unless an indexer exists.

## Future extension points

Limit/stop/take-profit/DCA, alerts, Mini App, smart accounts, MPC, gas sponsorship, multi-wallet, multi-chain, public trading API, webhooks. Interfaces are in types; MVP does not implement them.
