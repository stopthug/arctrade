# Implementation plan

Phased delivery matching the product brief. Status reflects this repository’s MVP.

## Phase 1 — Repository — done

Monorepo, env, Docker Compose (Postgres + Redis), docs.

## Phase 2 — Telegram + wallet — done

grammY bot, Telegram-id auth, `WalletProvider` with encrypted local signer.

## Phase 3 — Arc adapter — done

viem Arc Testnet chain, native + ERC-20 USDC, token validation.

## Phase 4 — Market data + quotes — done

Circle Swap Kit adapter for USDC/EURC/cirBTC. Reference FX/BTC feeds. Redis TTLs. Unsupported pairs return unavailable — not fake quotes.

## Phase 5 — Trading engine — done

Buy/sell/swap confirmation, gas gate, quote expiry, idempotency, tx state machine.

## Phase 6 — Portfolio — done

Balances, FIFO positions, stale-price labeling.

## Phase 7 — Web — done

Landing, dashboard, terminal, token page, settings, referrals, docs.

## Phase 8 — Referrals, fees, admin — done

Configurable bps fees, referral codes, admin metrics. No hardcoded reward promises.

## Phase 9 — Tests + observability — done

Unit tests for money math and state machine. `/health` `/ready`. Sentry hook via `SENTRY_DSN`.

## Phase 10 — Production — not done

Do not ship to mainnet until [deployment.md](deployment.md) is complete. Local encrypted keys are **not** production custody.
