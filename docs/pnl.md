# Positions and P&L

## Accounting

Default: **FIFO**. Configurable: `FIFO | LIFO | AVERAGE` via `ACCOUNTING_METHOD`.

Lots are stored per user per token. Buys add lots. Sells consume lots in order and realize P&L.

```
realized = proceedsUsd - costBasisUsd_of_consumed_lots
unrealized = markUsd - remaining_cost_basis
```

All math is `decimal.js` with token decimals. JavaScript `number` is not used for quantities, prices, or P&L.

## Marks

Mark price comes from the market-data service:

- USDC = $1
- EURC = ECB EURUSD reference (Frankfurter)
- cirBTC = CoinGecko BTC/USD **reference** (testnet cirBTC is not redeemable BTC)
- Other tokens: no mark unless a verified source exists

If the snapshot is older than 60 seconds, UI shows: `Price updated X seconds ago.` and does not claim exact P&L.

## Updates

Positions change only when a trade is **CONFIRMED** on-chain. Quote screens never mutate cost basis.
