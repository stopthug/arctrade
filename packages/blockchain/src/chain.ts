import { defineChain } from "viem";

/**
 * Arc Testnet — values from https://docs.arc.io/arc/references/connect-to-arc
 * Native currency is USDC with 18 decimals for gas accounting.
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.io"],
      webSocket: ["wss://rpc.testnet.arc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

export const ARC_TESTNET_CHAIN_ID = 5042002;

/** Official ERC-20 interface for native USDC (6 decimals). Same balance as native. */
export const USDC_ERC20 = "0x3600000000000000000000000000000000000000" as const;
export const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;
export const CIRBTC = "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF" as const;

export const NATIVE_USDC_DECIMALS = 18;
export const USDC_ERC20_DECIMALS = 6;
export const NATIVE_TO_ERC20_SCALE = 10n ** 12n;

export const MIN_MAX_FEE_PER_GAS = 20_000_000_000n;

export function explorerTxUrl(hash: string, base = "https://testnet.arcscan.app"): string {
  return `${base.replace(/\/$/, "")}/tx/${hash}`;
}

export function explorerAddressUrl(address: string, base = "https://testnet.arcscan.app"): string {
  return `${base.replace(/\/$/, "")}/address/${address}`;
}

export function explorerTokenUrl(address: string, base = "https://testnet.arcscan.app"): string {
  return `${base.replace(/\/$/, "")}/token/${address}`;
}
