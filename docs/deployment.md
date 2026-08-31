# Deployment

## Local

```bash
docker compose up -d
cp .env.example .env   # fill TELEGRAM_BOT_TOKEN, ENCRYPTION_KEY, SESSION_SECRET
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Production requirements (not met by the default signer)

Do **not** call ArcTrade production-safe until all of the following are done:

- [ ] Replace `LOCAL_ENCRYPTED` with MPC, embedded wallet, smart account, or an external signer. Independent review of that design.
- [ ] Independent review of any ArcTrade-deployed contracts (none in MVP).
- [ ] Infrastructure security review (network, IAM, secret store).
- [ ] RPC redundancy (`ARC_RPC_URL` + fallbacks + health failover).
- [ ] Monitoring (Sentry, logs, alerts on failed trades and RPC errors).
- [ ] Database backups and restore tests.
- [ ] Incident response runbook.
- [ ] Rate limits verified under load.
- [ ] Transaction reconciliation job (db vs chain).
- [ ] Secrets in a manager (not a plaintext `.env` on disk).
- [ ] Mainnet addresses and chain id re-verified from official docs (not this file’s testnet values).

## Suggested runtime

- `apps/api`, `apps/bot`, `apps/worker` as separate processes.
- `apps/web` behind TLS.
- Postgres + Redis managed services.
- Image: `infra/Dockerfile` (build from repo root).

## Health

- `GET /health` — process up
- `GET /ready` — Postgres, Redis, Arc RPC, trading provider probe

## Incident notes

If a swap is `PENDING` with a hash: do not tell the user funds are safe. Inspect the receipt. If RPC is stale, say the status is unknown.
