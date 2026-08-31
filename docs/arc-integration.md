# Arc integration

Verified against official Circle/Arc documentation. Last reviewed: 2026-08-31.

Do not treat this file as a substitute for the live docs. Re-check before production or mainnet cutover. Mainnet contract addresses were **not published** at review time.

## Sources

| Topic | Source |
| --- | --- |
| Network / chain | https://docs.arc.io/arc-chain |
| Connect / wallet params | https://docs.arc.io/arc/references/connect-to-arc |
| RPC endpoints | https://docs.arc.io/arc/references/rpc-endpoints |
| Contract addresses | https://docs.arc.io/arc/references/contract-addresses |
| Gas and fees | https://docs.arc.io/arc/references/gas-and-fees |
| Fee display | https://docs.arc.io/integrate/wallets/fee-display |
| Stablecoin native model | https://docs.arc.io/arc/concepts/stablecoin-native-model |
| DeFi / AMM notes | https://docs.arc.io/integrate/defi |
| App Kit Swap | https://docs.arc.io/app-kit/swap |
| Supported swap tokens | https://docs.arc.io/app-kit/references/supported-blockchains |
| Same-chain swap quickstart | https://docs.arc.io/app-kit/quickstarts/swap-tokens-same-chain |
| cirBTC addresses | https://developers.circle.com/assets/cirbtc-contract-addresses |
| Uniswap on Arc (announcement, Mainnet) | https://community.arc.io/public/blogs/arc-x-uniswap-swap-and-liquidity-infrastructure-for-arc-2026-06-15 |
| AMP / MEV research | https://www.circle.com/blog/amp-rethinking-block-building-with-multi-proposer-consensus |

## Network

| Parameter | Verified value |
| --- | --- |
| Network name | Arc Testnet |
| Chain ID | `5042002` |
| Native gas token | USDC |
| Native gas decimals | 18 (wei / `eth_getBalance` / `msg.value`) |
| Execution | EVM (Osaka hard fork), Reth |
| Consensus | Malachite BFT |
| Block time (testnet) | ~0.48 s |
| Finality | Deterministic, sub-second |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |
| JSON-RPC | Standard Ethereum JSON-RPC |

## RPC

Primary (Circle):

- HTTP: `https://rpc.testnet.arc.io`
- WebSocket: `wss://rpc.testnet.arc.io`

Documented alternatives: Blockdaemon, dRPC, QuickNode testnet endpoints (see RPC docs).

ArcTrade uses `ARC_RPC_URL` and optional `ARC_RPC_FALLBACK_URL`. Do not hardcode a vendor-only URL as the only path.

## USDC (critical)

USDC is the native EVM asset **and** has a built-in ERC-20 interface. There is **no wrapped USDC**.

| Interface | Address / access | Decimals |
| --- | --- | --- |
| Native balance | `eth_getBalance` | 18 |
| ERC-20 | `0x3600000000000000000000000000000000000000` | 6 |

They share the **same underlying balance**. Mixing 18-decimal native units with 6-decimal ERC-20 units silently breaks math by 10^12.

Official recommendation for application-level transfers and balances: use the ERC-20 interface (`balanceOf`, `transfer`, `approve`, `transferFrom`).

Native transfers (`msg.value`) **bypass ERC-20 allowances**.

## Other documented testnet tokens

| Token | Address | Decimals | Notes |
| --- | --- | --- | --- |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 | Circle EUR stablecoin |
| cirBTC | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` | (read on-chain) | Circle Wrapped Bitcoin; testnet has **no** BTC backing |
| USYC | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` | 6 | Permissioned; not a default retail swap asset |

Permit2 (common Ethereum contract on Arc Testnet): `0x000000000022D473030F116dDEE9F6B43aC78BA3`.

StableFX FxEscrow (enterprise RFQ FX, not a retail DEX): `0xd68256f4D69C6BbEcB873D8588AE0Dc6B8E22E10`.

## Gas model

- Fees are **USDC**, displayed as **USD** (never as ETH).
- EIP-1559 + EWMA smoothing.
- Testnet minimum base fee: **20 Gwei**.
- `maxPriorityFeePerGas` of 0 is accepted; a small tip can help under load.
- Target design: ~$0.01 per transaction under normal load.
- Insufficient native USDC (gas) must block submission.

ArcTrade estimates gas via `eth_estimateGas` + `eth_feeHistory` / latest base fee, and shows the max fee in dollars.

## Wallets and SDKs

- Standard EVM accounts (`0x` + 20 bytes).
- Compatible with viem, ethers, WalletConnect (add-chain required; Arc Testnet may not be in the WC registry).
- Official swap SDK: `@circle-fin/swap-kit` or `@circle-fin/app-kit` with `@circle-fin/adapter-viem-v2`.
- Swap Kit is **server-side** (kit key must not ship to the browser).

## Trading / liquidity (what exists today)

### Circle Swap Kit (implemented adapter)

On Arc Testnet, App Kit Swap supports **USDC, EURC, and cirBTC only**.

Methods used:

- `kit.estimate(...)` / `kit.estimateSwap(...)` for quotes
- `kit.swap(...)` for execution
- Optional `CIRCLE_KIT_KEY` (`KIT_KEY` in Circle docs)

If estimate fails, liquidity is missing, or the pair is unsupported, ArcTrade does **not** invent a quote.

### Uniswap

Circle announced Uniswap for **Arc Mainnet**. This repo does not assume Uniswap router addresses on testnet. A future `UniswapProvider` can be added under `packages/trading/providers/` without changing buy/sell UX.

### StableFX

Enterprise RFQ + on-chain escrow. Not used as the retail Telegram swap path.

## MEV / execution protection

Do **not** claim MEV protection in the product UI.

- Circle has discussed **private-mempool protection** as a mainnet intent and **AMP** (Arc Multi-Proposer Protocol) as research / design-partner work.
- AMP is not treated as a live, application-callable protection API in this integration.
- ArcTrade labels execution as **Standard transaction execution**.
- The transaction layer has an `ExecutionProtection` hook so a private relay / AMP proposer path can be added later without rewriting trade flows.

## Transaction confirmation

- Sub-second deterministic finality on Arc does **not** mean a hash equals success.
- ArcTrade waits for receipt (`status === success`) before `CONFIRMED`.
- Reverts, RPC errors, and expired quotes are distinct failure reasons.
- Never tell the user funds are safe unless chain state supports that conclusion.

## Market data

There is no official Arc-wide token price index for arbitrary ERC-20s.

ArcTrade market data policy:

| Asset | Source | Display |
| --- | --- | --- |
| USDC | Protocol native / $1 peg | $1.00, source: Arc native USDC |
| EURC | Frankfurter (ECB) EURUSD | Reference peg, not a DEX mid |
| cirBTC | CoinGecko BTC/USD | Reference for BTC, **not** testnet inventory value |
| Other ERC-20 | On-chain metadata only | Price omitted if no verified source |

Testnet tokens have no financial value. UI copy must not imply live mainnet markets.

## Explorer links

`https://testnet.arcscan.app/tx/{hash}`
`https://testnet.arcscan.app/address/{address}`
`https://testnet.arcscan.app/token/{address}`
