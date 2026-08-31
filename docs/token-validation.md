# Token validation

A pasted address is not a tradable token.

## Checks (in order)

1. **EVM address** — `0x` + 40 hex chars, checksum recommended; invalid checksum is rejected.
2. **Chain** — `ARC_CHAIN_ID` (testnet `5042002`). No other chain ids in MVP.
3. **Contract exists** — `eth_getCode` non-empty.
4. **ERC-20 surface** — `decimals()`, `symbol()`, `name()` succeed. Failure → not tradable.
5. **Not native/ERC-20 USDC confused as two tokens** — USDC native and `0x3600…0000` are the same asset.
6. **Policy**
   - `STRICT` — verified **and** a live quote
   - `VERIFIED_ONLY` — must be in the verified catalog
   - `WARN_UNVERIFIED` (default) — allow with an explicit warning and Continue/Cancel
7. **Liquidity / quote** — `TradingProvider.getQuote` must succeed before the confirm screen. No quote → cannot trade.

## Verified catalog (MVP)

Seeded from official Arc Testnet docs:

- USDC `0x3600000000000000000000000000000000000000`
- EURC `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`
- cirBTC `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF`

Admin can mark additional tokens verified. That does not create liquidity.

## Warnings

Unverified tokens show contract, whatever liquidity the provider reports (or “unknown”), and require Continue. ArcTrade does not imply audit or legitimacy.

## Arbitrary execution

User input is never used as raw calldata. The only built transactions are those returned by the trading adapter for a validated pair.
