import { expect, test } from "@playwright/test";

test("/start landing copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Trade Arc from Telegram." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Telegram" })).toBeVisible();
});

test("trade terminal renders catalog", async ({ page }) => {
  await page.goto("/trade");
  await expect(page.getByText("USDC")).toBeVisible();
  await expect(page.getByText("Chart placeholder")).toBeVisible();
});
