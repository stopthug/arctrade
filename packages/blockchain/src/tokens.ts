import type { Address, PublicClient } from "viem";
import {
  addressesEqual,
  assertChecksumAddress,
  isValidEvmAddress,
  normalizeAddress,
} from "@arctrade/security";
import { contractExists, getErc20Metadata } from "./client.js";
import { ARC_TESTNET_CHAIN_ID, USDC_ERC20 } from "./chain.js";

export type TokenPolicy = "STRICT" | "VERIFIED_ONLY" | "WARN_UNVERIFIED";

export interface ValidatedToken {
  address: Address;
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  verified: boolean;
  isUsdc: boolean;
  warning?: string;
}

export async function validateTokenAddress(
  client: PublicClient,
  raw: string,
  opts: {
    chainId?: number;
    verifiedAddresses?: Set<string>;
    policy?: TokenPolicy;
  } = {},
): Promise<ValidatedToken> {
  const chainId = opts.chainId ?? ARC_TESTNET_CHAIN_ID;
  if (!isValidEvmAddress(raw)) {
    throw new Error("Invalid EVM address.");
  }
  const address = assertChecksumAddress(raw);
  const exists = await contractExists(client, address);
  if (!exists) {
    throw new Error("No contract found at this address on Arc.");
  }
  let meta: { decimals: number; symbol: string; name: string };
  try {
    meta = await getErc20Metadata(client, address);
  } catch {
    throw new Error("Address is not ERC-20 compatible (decimals/symbol/name failed).");
  }
  const verified = Boolean(
    opts.verifiedAddresses?.has(normalizeAddress(address).toLowerCase()) ||
      opts.verifiedAddresses?.has(address.toLowerCase()),
  );
  const isUsdc = addressesEqual(address, USDC_ERC20);
  const policy = opts.policy ?? "WARN_UNVERIFIED";
  if (policy === "VERIFIED_ONLY" && !verified) {
    throw new Error("This token is not verified. Trading is disabled by your policy.");
  }
  if (policy === "STRICT" && !verified) {
    throw new Error("STRICT policy: only verified tokens with a live quote can be traded.");
  }
  return {
    address,
    chainId,
    ...meta,
    verified,
    isUsdc,
    warning: verified
      ? undefined
      : "UNVERIFIED TOKEN. This token has not been verified by ArcTrade.",
  };
}

export function unverifiedWarningCopy(token: ValidatedToken): string {
  return [
    "⚠️ UNVERIFIED TOKEN",
    "",
    "This token has not been verified by ArcTrade.",
    "",
    `Contract: ${token.address}`,
  ].join("\n");
}
