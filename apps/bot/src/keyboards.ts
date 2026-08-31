import { InlineKeyboard } from "grammy";

export function mainMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text("💰 Balance", "menu:balance")
    .text("🟢 Buy", "menu:buy")
    .row()
    .text("🔴 Sell", "menu:sell")
    .text("🔄 Swap", "menu:swap")
    .row()
    .text("📊 Positions", "menu:positions")
    .text("📈 Watchlist", "menu:watchlist")
    .row()
    .text("🔥 Trending", "menu:trending")
    .text("📜 History", "menu:history")
    .row()
    .text("⚙️ Settings", "menu:settings")
    .text("🎁 Referral", "menu:referral");
}

export function startMessage(): string {
  return [
    "ARCTRADE",
    "",
    "Trade on Arc",
    "",
    "Trade Arc tokens directly from Telegram.",
    "Quotes and balances come from Arc Testnet — nothing is simulated.",
    "",
    "Execution: Standard transaction execution.",
    "Network: Arc Testnet (chain ID 5042002).",
  ].join("\n");
}

export function cancelKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("❌ Cancel", "flow:cancel");
}

export function confirmTradeKeyboard(kind: "buy" | "sell" | "swap"): InlineKeyboard {
  const label = kind === "buy" ? "✅ BUY" : kind === "sell" ? "CONFIRM SELL" : "✅ SWAP";
  return new InlineKeyboard().text(label, "trade:confirm").text("❌ CANCEL", "flow:cancel");
}

export function buyAmountKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("10 USDC", "buyamt:10")
    .text("25 USDC", "buyamt:25")
    .row()
    .text("50 USDC", "buyamt:50")
    .text("100 USDC", "buyamt:100")
    .row()
    .text("Custom", "buyamt:custom")
    .text("❌ Cancel", "flow:cancel");
}

export function sellPctKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("25%", "sellpct:25")
    .text("50%", "sellpct:50")
    .row()
    .text("75%", "sellpct:75")
    .text("100%", "sellpct:100")
    .row()
    .text("Custom", "sellpct:custom")
    .text("❌ Cancel", "flow:cancel");
}

export function slippageKeyboard(current: number): InlineKeyboard {
  const mark = (bps: number) => (current === bps ? `• ${bps / 100}%` : `${bps / 100}%`);
  return new InlineKeyboard()
    .text(mark(10), "slip:10")
    .text(mark(50), "slip:50")
    .text(mark(100), "slip:100")
    .row()
    .text("Custom", "slip:custom")
    .text("« Back", "menu:settings");
}

export function unverifiedKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("Continue", "token:unverified:continue").text("Cancel", "flow:cancel");
}

export function highSlippageKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("Continue", "slip:high:continue").text("Cancel", "flow:cancel");
}

export function tokenActionsKeyboard(address: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("🟢 Buy", `tokbuy:${address}`)
    .text("🔴 Sell", `toksell:${address}`)
    .row()
    .text("⭐ Watch", `watch:${address}`)
    .text("« Menu", "menu:home");
}

export function afterSubmitKeyboard(explorerUrl: string): InlineKeyboard {
  return new InlineKeyboard().url("View transaction", explorerUrl).text("« Menu", "menu:home");
}

export function expiredQuoteKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text("Get New Quote", "quote:refresh").text("❌ Cancel", "flow:cancel");
}
