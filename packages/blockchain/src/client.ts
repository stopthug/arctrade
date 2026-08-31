import {
  createPublicClient,
  fallback,
  http,
  type Address,
  type Hex,
  type PublicClient,
  type TransactionReceipt,
} from "viem";
import { loadConfig } from "@arctrade/config";
import { nativeUsdcWeiToUsd } from "@arctrade/security";
import { arcTestnet, MIN_MAX_FEE_PER_GAS } from "./chain.js";
import type { GasEstimate } from "@arctrade/types";

export function createArcPublicClient(rpcUrl?: string, fallbackUrl?: string): PublicClient {
  const config = loadConfig();
  const primary = rpcUrl ?? config.ARC_RPC_URL;
  const secondary = fallbackUrl ?? config.ARC_RPC_FALLBACK_URL;
  const transports = [http(primary)];
  if (secondary) transports.push(http(secondary));
  return createPublicClient({
    chain: arcTestnet,
    transport: transports.length > 1 ? fallback(transports) : transports[0]!,
  });
}

const erc20Abi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

export async function getNativeBalance(client: PublicClient, address: Address): Promise<bigint> {
  return client.getBalance({ address });
}

export async function getErc20Balance(
  client: PublicClient,
  token: Address,
  owner: Address,
): Promise<bigint> {
  return client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [owner],
  });
}

export async function getErc20Metadata(client: PublicClient, token: Address) {
  const [decimals, symbol, name] = await Promise.all([
    client.readContract({ address: token, abi: erc20Abi, functionName: "decimals" }),
    client.readContract({ address: token, abi: erc20Abi, functionName: "symbol" }),
    client.readContract({ address: token, abi: erc20Abi, functionName: "name" }),
  ]);
  return { decimals: Number(decimals), symbol, name };
}

export async function contractExists(client: PublicClient, address: Address): Promise<boolean> {
  const code = await client.getCode({ address });
  return Boolean(code && code !== "0x");
}

export async function estimateEip1559Gas(
  client: PublicClient,
  args: {
    account: Address;
    to?: Address;
    data?: Hex;
    value?: bigint;
  },
): Promise<GasEstimate> {
  const [gasLimit, block] = await Promise.all([
    client.estimateGas({
      account: args.account,
      to: args.to,
      data: args.data,
      value: args.value,
    }),
    client.getBlock({ blockTag: "latest" }),
  ]);
  const baseFee = block.baseFeePerGas ?? MIN_MAX_FEE_PER_GAS;
  const maxPriorityFeePerGas = 0n;
  let maxFeePerGas = baseFee * 2n;
  if (maxFeePerGas < MIN_MAX_FEE_PER_GAS) maxFeePerGas = MIN_MAX_FEE_PER_GAS;
  const estimatedFeeRaw = gasLimit * maxFeePerGas;
  return {
    gasLimit: gasLimit.toString(),
    maxFeePerGas: maxFeePerGas.toString(),
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
    estimatedFeeRaw: estimatedFeeRaw.toString(),
    estimatedFeeUsd: nativeUsdcWeiToUsd(estimatedFeeRaw),
    nativeSymbol: "USDC",
  };
}

export async function getTransactionReceipt(
  client: PublicClient,
  hash: Hex,
): Promise<TransactionReceipt | null> {
  try {
    return await client.getTransactionReceipt({ hash });
  } catch {
    return null;
  }
}

export async function rpcHealthy(client: PublicClient): Promise<boolean> {
  try {
    const block = await client.getBlockNumber();
    return block >= 0n;
  } catch {
    return false;
  }
}

export { erc20Abi };
