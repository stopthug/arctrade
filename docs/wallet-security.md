# Wallet security

## Threat model

Telegram bots are a high-risk custody surface:

- Chat logs, forwards, and screenshots leak messages.
- Usernames are not authentication.
- Callback retries can double-submit trades.
- Admin dashboards are a juicy target for key theft.

Therefore:

- Never store plaintext private keys or seed phrases.
- Never log keys, seeds, `ENCRYPTION_KEY`, bot tokens, or API secrets.
- Never send keys through Telegram or the web client.
- Never expose signing material to Next.js (`NEXT_PUBLIC_*`).
- Never treat Telegram username as wallet authorization — only `telegramId`.
- Never execute without explicit confirmation.
- Never allow arbitrary calldata from user-typed payloads.

## WalletProvider

```ts
interface WalletProvider {
  createWallet(userId: string): Promise<WalletRecord>;
  getAddress(walletId: string): Promise<Address>;
  getBalance(walletId: string, token?: Address): Promise<TokenAmount>;
  signTransaction(walletId: string, tx: TransactionRequest): Promise<Hex>;
  sendTransaction(walletId: string, tx: TransactionRequest): Promise<Hex>;
  getTransaction(hash: Hex): Promise<TxStatus>;
  estimateGas(walletId: string, tx: TransactionRequest): Promise<GasEstimate>;
}
```

Trading, portfolio, and the bot depend on this interface only.

## Current implementation: encrypted local signer (testnet/dev)

`LocalEncryptedWalletProvider`

1. Generate secp256k1 key **in process**.
2. Encrypt with AES-256-GCM using `ENCRYPTION_KEY` (32-byte hex).
3. Persist `{ ciphertext, iv, authTag, keyVersion }` in `WalletSecret`.
4. Persist public `address` on `Wallet` (`provider = LOCAL_ENCRYPTED`).
5. Decrypt only inside `withSigner`, never return the key to callers.
6. Admin APIs select wallets **without** joining `WalletSecret`.

This is **not** production custody. It exists so testnet development can sign without faking transactions. `DEV_SIGNER_ENABLED` documents that isolation.

Compromise of `ENCRYPTION_KEY` + database = compromise of all local wallets. Treat both as production secrets even in staging.

Mnemonic/`private key` export to users is **disabled**. Users who need self-custody should use an external signer adapter (not in MVP).

## Production replacements (do not rewrite trading)

| Provider | `Wallet.provider` | Notes |
| --- | --- | --- |
| MPC | `MPC` | Threshold signing; ArcTrade never holds a full key |
| Embedded wallet | `EMBEDDED` | Vendor iframe / SDK; server holds session only |
| Smart account | `SMART_ACCOUNT` | UserOperation / Account Abstraction |
| External signer | `EXTERNAL` | User signs in wallet; bot only prepares tx |

Implement a new class, register it in the wallet factory, migrate `Wallet.provider`. Quote and swap code stay the same.

## Authorization

- Wallet rows are scoped by `userId`.
- Telegram identity = numeric `telegramId`.
- Web sessions must bind to the same user id (HMAC session / signed token using `SESSION_SECRET`).
- Signing is only allowed for `Wallet.status = ACTIVE` and `User.status = ACTIVE`.

## Encryption details

- Algorithm: AES-256-GCM
- IV: 12 random bytes per secret
- AAD: `walletId|keyVersion` to bind ciphertext to the row
- Key rotation: increment `keyVersion`, re-encrypt, do not log plaintext during rotation

## What admins can see

Address, provider type, network, status, balances (via RPC). **Never** ciphertext in UI. **Never** decrypt in an admin handler.
