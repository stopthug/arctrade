# ArcTrade

Trade Arc tokens directly from Telegram.

ArcTrade is a Telegram-first trading client for the [Arc](https://docs.arc.io) blockchain. It is built for fast token discovery and explicit, confirmed execution — not for DEX navigation, sniping, or market manipulation.

**This is a real-money blockchain application.** Quotes, balances, and confirmations come from live RPC and the configured trading provider. Nothing is fabricated. The current network is **Arc Testnet** (chain ID `5042002`). Mainnet contract addresses have not been published.

## Current trading reality

On Arc Testnet, the officially documented swap path is **Circle Swap Kit / App Kit Swap**.

Supported testnet swap tokens: **USDC, EURC, cirBTC**.

Uniswap is announced for Arc Mainnet, not as a live testnet DEX adapter in this repo. If a pair has no provider quote, ArcTrade returns:

> Trading for this pair is currently unavailable.

See [docs/arc-integration.md](docs/arc-integration.md).

## Architecture

```
apps/
  bot/       Telegram bot (grammY)
  api/       HTTP API (Hono)
  web/       Next.js dashboard
  worker/    Background jobs (BullMQ)

packages/
  blockchain/  Arc RPC, balances, ERC-20 reads, gas
  trading/     TradingProvider + Circle Swap adapter
  wallet/      WalletProvider (encrypted local signer for testnet/dev)
  database/    Prisma + PostgreSQL
  config/      Typed environment
  types/       Shared types
  security/    Encryption, validation, rate limits
  logging/     Structured logs (no secrets)
```

## Prerequisites

- Node.js 22+
- pnpm 9.15+
- Docker (PostgreSQL + Redis)

## Local setup

```bash
cp .env.example .env
# Generate secrets:
#   openssl rand -hex 32   # ENCRYPTION_KEY
#   openssl rand -hex 32   # SESSION_SECRET
# Set TELEGRAM_BOT_TOKEN from @BotFather

docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

| Process | URL |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Health | http://localhost:3001/health |

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install workspace dependencies |
| `pnpm dev` | Run API, bot, worker, and web |
| `pnpm test` | Unit tests (mocked chain/provider) |
| `pnpm lint` | Lint all packages |
| `pnpm build` | Production build |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:seed` | Seed mock users/tokens only — never private keys |

## Telegram commands

`/start` `/buy` `/sell` `/swap` `/balance` `/portfolio` `/positions` `/price` `/trending` `/watchlist` `/history` `/settings` `/referral` `/help`

## Environment

See `.env.example`. Arc RPC, chain ID, and USDC address are filled from [official Arc Testnet docs](https://docs.arc.io/arc/references/rpc-endpoints). Do not invent mainnet values.

## Security

- Private keys are encrypted at rest (AES-256-GCM).
- Keys and seeds are never logged, never sent through Telegram, never exposed to the web UI or admin panel.
- Trades require explicit confirmation.
- The testnet/dev signer is isolated and replaceable (MPC / embedded / smart account). See [docs/wallet-security.md](docs/wallet-security.md).

**This application is not production-safe until the requirements in [docs/deployment.md](docs/deployment.md) are completed.** The local encrypted signer is a development custody model only.

## License

Private — all rights reserved.
