import { expect, test } from "@playwright/test";

test("waitlist landing", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Trade Arc/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Join waitlist/i })).toBeVisible();
});

test("trade terminal renders catalog", async ({ page }) => {
  await page.goto("/trade");
  await expect(page.getByText("USDC")).toBeVisible();
  await expect(page.getByText("Chart placeholder")).toBeVisible();
});
