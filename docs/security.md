# Security

## Application rules

- Validate all token addresses (see [token-validation.md](token-validation.md)).
- Authorize by Telegram numeric id / server session, not username.
- Confirm every trade; duplicate Telegram updates are deduped (`update_id` in Redis + `tradeRequestId`).
- Rate-limit search, price, quotes, and especially trade creation.
- Structured logs with `requestId`, `userId`, `tradeId`, `transactionHash`, `operation`, `status`, `provider`.
- Redact: private keys, seeds, `ENCRYPTION_KEY`, `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TRADING_API_KEY`, `CIRCLE_KIT_KEY`, `ADMIN_API_KEY`, wallet ciphertext.

## HTTP

- CORS allowlist = `NEXT_PUBLIC_APP_URL`.
- Admin routes require `ADMIN_API_KEY` or an admin Telegram id mapped session.
- No private keys in JSON responses. Wallet endpoints return `address` only.

## Redis abuse controls

- Per-user and per-IP sliding windows.
- Stricter window on `POST /v1/trades`.
- Suspicious patterns (rapid failed quotes, many unverified tokens) write `AuditLog` with `SUSPICIOUS_ACTIVITY`.

## What this repo does not do

No price manipulation, wash trading, spoofed volume, or fake trending. Rankings that exist are labeled as ArcTrade activity.

## Production bar

See [deployment.md](deployment.md). Until then, treat the stack as **testnet/dev**.
