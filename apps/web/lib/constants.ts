export const TELEGRAM_URL =
  process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/arc_mainnate_trading_bot";
export const ARC_URL = "https://www.arc.network/";
export const ARC_DOCS_URL = "https://docs.arc.io/";
export const MAINNET_ISO = "2026-09-16";
export const FEE_RATE = 0.005;
export const FEE_LABEL = "0.5%";

export const SITE = {
  name: "ArcTrade",
  title: "ArcTrade — Waitlist",
  description:
    "Join the ArcTrade waitlist. Telegram-native trading for the Arc ecosystem. Buy, sell and track tokens with a simple, fast trading experience.",
};

export const PRODUCT_PATH = "/xoxoxswowo";

export const NAV = [
  { href: "#trade", label: "Trade" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#arc", label: "Arc" },
  { href: "#features", label: "Features" },
] as const;
