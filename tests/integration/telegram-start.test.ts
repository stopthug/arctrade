import { describe, expect, it } from "vitest";
import { startMessage, mainMenu } from "../../apps/bot/src/keyboards.js";

describe("telegram start copy", () => {
  it("renders the product frame without fake balances", () => {
    const text = startMessage();
    expect(text).toContain("ARCTRADE");
    expect(text).toContain("Trade on Arc");
    expect(text).not.toMatch(/\$4,821/);
    const kb = mainMenu();
    expect(kb.inline_keyboard.flat().map((b) => b.text)).toEqual(
      expect.arrayContaining(["💰 Balance", "🟢 Buy", "🔴 Sell", "📊 Positions"]),
    );
  });
});
