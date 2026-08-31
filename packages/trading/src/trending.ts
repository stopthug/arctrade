import { prisma } from "@arctrade/database";
import Decimal from "decimal.js";

export async function getTrending(limit = 10) {
  const rule = await prisma.trendingRule.findUnique({ where: { id: "default" } });
  const hours = rule?.windowHours ?? 24;
  const since = new Date(Date.now() - hours * 3600 * 1000);
  const trades = await prisma.trade.findMany({
    where: { status: "CONFIRMED", confirmedAt: { gte: since } },
    select: { tokenOut: true, amountIn: true, tokenIn: true },
  });
  const agg = new Map<string, { trades: number; volume: Decimal }>();
  for (const t of trades) {
    const cur = agg.get(t.tokenOut) ?? { trades: 0, volume: new Decimal(0) };
    cur.trades += 1;
    if (t.tokenIn.toLowerCase().includes("3600000000000000000000000000000000000000")) {
      cur.volume = cur.volume.add(t.amountIn);
    }
    agg.set(t.tokenOut, cur);
  }
  const ranked = [...agg.entries()]
    .map(([address, v]) => ({
      address,
      trades: v.trades,
      volumeUsdc: v.volume.toString(),
    }))
    .sort((a, b) => b.trades - a.trades || Number(b.volumeUsdc) - Number(a.volumeUsdc))
    .slice(0, limit);

  return {
    label: `Trending on ArcTrade (confirmed trades, last ${hours}h)`,
    organic: true,
    sponsored: false as const,
    metric: rule?.metric ?? "trades",
    items: ranked,
  };
}
