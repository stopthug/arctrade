# Fees

## Types

| Fee | Who | When | How shown |
| --- | --- | --- | --- |
| Network fee | Arc validators | Every tx | USD, because gas is USDC |
| Provider / DEX fee | Swap venue | Inside quote | From Circle estimate `fees[]` when present |
| ArcTrade service fee | Platform | Configurable bps on notional | “ArcTrade fee” |

There is no withdrawal-to-CEX flow in MVP. `withdrawalFee` exists on `FeeConfig` as zero unless enabled later.

## Configuration

`FeeService` reads `TRADING_FEE_BPS` and `fee_config` in the database (admin can change). Quote snapshots `serviceFeeBps` and `serviceFeeAmount` on the trade. Execution uses the snapshot, not a later config change.

Never charge a fee different from the quote screen.

## Display example

```
Network fee:    $0.02
ArcTrade fee:   $0.05
Provider fee:   $0.00
Total due:      25.07 USDC
```

If a fee cannot be estimated, show **Unavailable** and block confirm — do not hide it.

## Referrals

Referral codes are tracked (`t.me/<bot>?start=CODE`). Reward bps are configurable and default to **0**. The product must not promise payouts that are not configured.

## P&L vs fees

Service fees reduce realized P&L when they are paid in the input asset. FIFO lots use execution amounts from the confirmed swap, not the pre-fee quote.
