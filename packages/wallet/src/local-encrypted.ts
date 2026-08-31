import {
  createWalletClient,
  http,
  type Address,
  type Hex,
  type PublicClient,
  type TransactionRequest,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { loadConfig } from "@arctrade/config";
import { prisma } from "@arctrade/database";
import { createLogger } from "@arctrade/logging";
import {
  decryptSecret,
  encryptSecret,
  formatAmount,
  parseEncryptionKey,
} from "@arctrade/security";
import {
  USDC_ERC20,
  USDC_ERC20_DECIMALS,
  arcTestnet,
  createArcPublicClient,
  estimateEip1559Gas,
  getErc20Balance,
  getErc20Metadata,
  getNativeBalance,
  getTransactionReceipt,
} from "@arctrade/blockchain";
import type { GasEstimate, TokenAmount } from "@arctrade/types";
import type { WalletProvider, WalletRecord } from "./provider.js";

const log = createLogger("wallet");

function encryptionKey(): Buffer {
  const config = loadConfig();
  if (!config.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is required to use the local encrypted signer.");
  }
  return parseEncryptionKey(config.ENCRYPTION_KEY);
}

function aad(walletId: string, keyVersion: number): string {
  return `${walletId}|${keyVersion}`;
}

function toRecord(row: {
  id: string;
  userId: string;
  address: string;
  provider: WalletRecord["provider"];
  network: string;
  status: WalletRecord["status"];
}): WalletRecord {
  return {
    id: row.id,
    userId: row.userId,
    address: row.address as Address,
    provider: row.provider,
    network: row.network,
    status: row.status,
  };
}

/**
 * Testnet/dev signer. Keys are AES-256-GCM encrypted at rest.
 * Not a production custody model — replace via WalletProvider.
 */
export class LocalEncryptedWalletProvider implements WalletProvider {
  constructor(private readonly client: PublicClient = createArcPublicClient()) {}

  async createWallet(userId: string): Promise<WalletRecord> {
    const config = loadConfig();
    if (!config.DEV_SIGNER_ENABLED && config.NODE_ENV === "production") {
      throw new Error("Local encrypted signer is disabled. Configure a production WalletProvider.");
    }
    const existing = await prisma.wallet.findUnique({
      where: { userId_network: { userId, network: "arc-testnet" } },
    });
    if (existing) return toRecord(existing);

    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        address: account.address,
        provider: "LOCAL_ENCRYPTED",
        network: "arc-testnet",
        chainId: config.ARC_CHAIN_ID,
      },
    });
    const payload = encryptSecret(privateKey, encryptionKey(), aad(wallet.id, 1), 1);
    await prisma.walletSecret.create({
      data: {
        walletId: wallet.id,
        ciphertext: payload.ciphertext,
        iv: payload.iv,
        authTag: payload.authTag,
        keyVersion: payload.keyVersion,
      },
    });
    log.info({ userId, walletId: wallet.id, address: account.address }, "wallet created");
    return toRecord(wallet);
  }

  async getAddress(walletId: string): Promise<Address> {
    const wallet = await this.requireWallet(walletId);
    return wallet.address as Address;
  }

  async getBalance(walletId: string, token?: Address): Promise<TokenAmount> {
    const address = await this.getAddress(walletId);
    if (!token || token.toLowerCase() === USDC_ERC20.toLowerCase()) {
      const raw = await getErc20Balance(this.client, USDC_ERC20, address);
      return {
        tokenAddress: USDC_ERC20,
        symbol: "USDC",
        decimals: USDC_ERC20_DECIMALS,
        raw: raw.toString(),
        formatted: formatAmount(raw, USDC_ERC20_DECIMALS),
      };
    }
    const [raw, meta] = await Promise.all([
      getErc20Balance(this.client, token, address),
      getErc20Metadata(this.client, token),
    ]);
    return {
      tokenAddress: token,
      symbol: meta.symbol,
      decimals: meta.decimals,
      raw: raw.toString(),
      formatted: formatAmount(raw, meta.decimals),
    };
  }

  async getNativeUsdcWei(walletId: string): Promise<bigint> {
    const address = await this.getAddress(walletId);
    return getNativeBalance(this.client, address);
  }

  async signTransaction(walletId: string, tx: TransactionRequest): Promise<Hex> {
    return this.withAccount(walletId, async (account) => {
      const walletClient = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http(loadConfig().ARC_RPC_URL),
      });
      return walletClient.signTransaction({
        ...tx,
        account,
        chain: arcTestnet,
      });
    });
  }

  async sendTransaction(walletId: string, tx: TransactionRequest): Promise<Hex> {
    return this.withAccount(walletId, async (account) => {
      const walletClient = createWalletClient({
        account,
        chain: arcTestnet,
        transport: http(loadConfig().ARC_RPC_URL),
      });
      return walletClient.sendTransaction({
        ...tx,
        account,
        chain: arcTestnet,
      });
    });
  }

  async getTransaction(hash: Hex) {
    const receipt = await getTransactionReceipt(this.client, hash);
    if (!receipt) return { hash, status: "pending" as const };
    if (receipt.status === "success") return { hash, status: "success" as const };
    return { hash, status: "reverted" as const };
  }

  async estimateGas(walletId: string, tx: TransactionRequest): Promise<GasEstimate> {
    const address = await this.getAddress(walletId);
    return estimateEip1559Gas(this.client, {
      account: address,
      to: tx.to ?? undefined,
      data: tx.data ?? undefined,
      value: tx.value,
    });
  }

  async withPrivateKey<T>(walletId: string, fn: (privateKey: Hex) => Promise<T>): Promise<T> {
    const secret = await prisma.walletSecret.findUnique({ where: { walletId } });
    if (!secret) throw new Error("Wallet secret not found.");
    const pk = decryptSecret(secret, encryptionKey(), aad(walletId, secret.keyVersion)) as Hex;
    try {
      return await fn(pk);
    } finally {
      // Best-effort: pk is a string and cannot be securely wiped in JS.
    }
  }

  private async withAccount<T>(
    walletId: string,
    fn: (account: ReturnType<typeof privateKeyToAccount>) => Promise<T>,
  ): Promise<T> {
    return this.withPrivateKey(walletId, async (pk) => fn(privateKeyToAccount(pk)));
  }

  private async requireWallet(walletId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet || wallet.status !== "ACTIVE") {
      throw new Error("Wallet not found or disabled.");
    }
    return wallet;
  }
}

export function createWalletProvider(): WalletProvider {
  return new LocalEncryptedWalletProvider();
}
