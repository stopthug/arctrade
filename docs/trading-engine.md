# Trading engine

## Provider abstraction

Business logic never imports a DEX SDK directly. All quotes and execution go through `TradingProvider`:

- `getQuote`
- `getRoutes`
- `buildTransaction`
- `estimateGas`
- `executeTransaction`
- `getTransactionStatus`

Adapters live in `packages/trading/src/providers/`.

### Circle Swap adapter (current)

Official path on Arc Testnet: Circle Swap Kit (`@circle-fin/swap-kit`).

- Chain enum: `Arc_Testnet`
- Tokens: `USDC`, `EURC`, `cirBTC`
- Quote: `kit.estimate`
- Execute: `kit.swap`
- Optional `CIRCLE_KIT_KEY`

If the kit is not configured, the pair is unsupported, liquidity is missing, or estimate fails: **Trading for this pair is currently unavailable.**

No mid-price is invented from thin air.

### Future adapters

Uniswap (Mainnet announcement) or other routers implement the same interface. `TRADING_PROVIDER` selects the adapter.

## Quote rules

- Quotes expire (`QUOTE_TTL_SECONDS`).
- Execution always re-loads the stored quote and rejects expiry.
- Slippage is user-set. ArcTrade never silently raises it.
- High slippage (≥ 3% default warn, hard cap `MAX_SLIPPAGE_BPS`) requires a second confirm.
- Minimum received = provider stop-limit when present, otherwise `amountOut * (1 - slippage)`.

## Fees

See [fees.md](fees.md). Network fee (gas in USDC) and ArcTrade service fee are shown separately. The charged service fee must match the displayed bps at quote time (snapshotted on the trade row).

## Idempotency

Every confirm action carries `tradeRequestId` (UUID). Unique constraint in PostgreSQL. Telegram duplicate updates reuse the same request id from session. Signing does not start if the id already exists in a terminal or in-flight state.

## State machine

`CREATED → QUOTED → CONFIRMING → SIGNING → SUBMITTED → PENDING → CONFIRMED`

Failures: `FAILED`, `EXPIRED`, `CANCELLED`.

A hash moves the trade to `SUBMITTED`/`PENDING`. Only a successful receipt moves it to `CONFIRMED`.

## Gas

Estimate before send. If native USDC cannot cover `gasLimit * maxFeePerGas` (+ value if native send), the bot shows insufficient network fee and does not submit.

## Execution protection

Current label: **Standard transaction execution.**

`ExecutionProtection` is a no-op passthrough (`submitRpc`). Replace with a private relay when Arc exposes one. Do not advertise MEV protection until that path is verified.
