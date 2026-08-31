import { loadConfig } from "@arctrade/config";
import type { TradingProvider } from "./provider-interface.js";
import { CircleSwapProvider } from "./circle-swap.js";
import { UnavailableTradingProvider } from "./unavailable.js";

export function createTradingProvider(): TradingProvider {
  const config = loadConfig();
  switch (config.TRADING_PROVIDER) {
    case "none":
    case "unavailable":
      return new UnavailableTradingProvider();
    case "circle-swap":
    default:
      return new CircleSwapProvider();
  }
}
