import type { Address, Hex, TransactionRequest } from "viem";
import type { GasEstimate, TokenAmount, WalletProviderType } from "@arctrade/types";

export interface WalletRecord {
  id: string;
  userId: string;
  address: Address;
  provider: WalletProviderType;
  network: string;
  status: "ACTIVE" | "DISABLED";
}

export interface WalletProvider {
  createWallet(userId: string): Promise<WalletRecord>;
  getAddress(walletId: string): Promise<Address>;
  getBalance(walletId: string, token?: Address): Promise<TokenAmount>;
  signTransaction(walletId: string, tx: TransactionRequest): Promise<Hex>;
  sendTransaction(walletId: string, tx: TransactionRequest): Promise<Hex>;
  getTransaction(hash: Hex): Promise<{ hash: Hex; status: "pending" | "success" | "reverted" | "unknown" }>;
  estimateGas(walletId: string, tx: TransactionRequest): Promise<GasEstimate>;
  withPrivateKey?<T>(walletId: string, fn: (privateKey: Hex) => Promise<T>): Promise<T>;
}
