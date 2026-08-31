"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "../../components/shell";
import { Button, Card } from "../../components/ui";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const CIRBTC = "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF";

type Token = { address: string; symbol: string; name: string; verified: boolean };
type Price = {
  priceUsd: string | null;
  source: string;
  ageSeconds: number;
  change24h: string | null;
  liquidity: string | null;
  volume24h: string | null;
  marketCap: string | null;
};

const catalog: Token[] = [
  { address: USDC, symbol: "USDC", name: "USD Coin", verified: true },
  { address: EURC, symbol: "EURC", name: "EURC", verified: true },
  { address: CIRBTC, symbol: "cirBTC", name: "Circle Wrapped Bitcoin", verified: true },
];

export default function TradePage() {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [selected, setSelected] = useState(catalog[1]!);
  const [amount, setAmount] = useState("25");
  const [price, setPrice] = useState<Price | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [trending, setTrending] = useState<{ items: { address: string; trades: number }[]; label: string } | null>(
    null,
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return catalog.filter((t) => t.symbol.toLowerCase().includes(q) || t.address.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    fetch(`${api}/v1/tokens/${selected.address}/price`)
      .then((r) => r.json())
      .then((d) => setPrice(d.price))
      .catch(() => setPrice(null));
  }, [selected.address]);

  useEffect(() => {
    fetch(`${api}/v1/trending`)
      .then((r) => r.json())
      .then(setTrending)
      .catch(() => setTrending(null));
  }, []);

  async function requestQuote() {
    setQuote(null);
    const tokenIn = side === "buy" ? USDC : selected.address;
    const tokenOut = side === "buy" ? selected.address : USDC;
    const res = await fetch(`${api}/v1/quotes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "web",
        walletId: "web",
        tokenIn,
        tokenOut,
        amountIn: amount,
      }),
    });
    const data = await res.json();
    setQuote(data.error ?? JSON.stringify(data.quote, null, 2));
  }

  return (
    <Shell title="Trade">
      <div className="grid grid-cols-[240px_1fr_280px] gap-4 min-h-[520px]">
        <Card className="flex flex-col gap-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search token"
            className="bg-ink-950 border border-ink-700 px-3 py-2 text-sm outline-none"
          />
          <div>
            <p className="text-[11px] uppercase tracking-widest text-mute mb-2">Catalog</p>
            {filtered.map((t) => (
              <button
                key={t.address}
                onClick={() => setSelected(t)}
                className={`block w-full text-left px-2 py-2 text-sm ${selected.address === t.address ? "bg-ink-800 text-paper" : "text-mute"}`}
              >
                {t.symbol}
                <span className="block font-mono text-[10px] truncate">{t.address}</span>
              </button>
            ))}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-mute mb-2">Trending</p>
            <p className="text-xs text-mute leading-relaxed">
              {trending?.label ?? "Organic ArcTrade volume only — never sponsored as rank."}
            </p>
            {(trending?.items ?? []).map((i) => (
              <p key={i.address} className="font-mono text-[11px] mt-1 truncate">
                {i.address} · {i.trades}
              </p>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-[11px] uppercase tracking-widest text-mute">Token</p>
          <h2 className="mt-2 text-2xl">
            {selected.name} <span className="text-mute">{selected.symbol}</span>
          </h2>
          <p className="mt-4 font-mono text-3xl">{price?.priceUsd ? `$${price.priceUsd}` : "No verified price"}</p>
          <p className="mt-2 text-xs text-mute">
            {price ? `${price.source}. Updated ${price.ageSeconds}s ago.` : "Waiting for market-data API."}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-mute">24h</dt>
              <dd>{price?.change24h ?? "unavailable"}</dd>
            </div>
            <div>
              <dt className="text-mute">Liquidity</dt>
              <dd>{price?.liquidity ?? "unavailable"}</dd>
            </div>
            <div>
              <dt className="text-mute">Volume</dt>
              <dd>{price?.volume24h ?? "unavailable"}</dd>
            </div>
            <div>
              <dt className="text-mute">Market cap</dt>
              <dd>{price?.marketCap ?? "unavailable"}</dd>
            </div>
          </dl>
          <div className="mt-8 border border-dashed border-ink-700 p-8 text-center text-sm text-mute">
            Chart placeholder. Historical series is not fabricated. Integrate an official Arc/indexer candle API when
            available.
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant={side === "buy" ? "buy" : "ghost"} onClick={() => setSide("buy")}>
              Buy
            </Button>
            <Button variant={side === "sell" ? "sell" : "ghost"} onClick={() => setSide("sell")}>
              Sell
            </Button>
          </div>
          <label className="text-xs text-mute">
            Amount ({side === "buy" ? "USDC" : selected.symbol})
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full bg-ink-950 border border-ink-700 px-3 py-2 font-mono text-sm outline-none"
            />
          </label>
          <Button onClick={requestQuote}>Get quote</Button>
          <pre className="text-[11px] text-mute whitespace-pre-wrap overflow-auto max-h-64">
            {quote ?? "Quotes require a provisioned wallet via Telegram. The API will not invent prices."}
          </pre>
        </Card>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <p className="text-[11px] uppercase tracking-widest text-mute">Transactions</p>
          <p className="mt-2 text-sm text-mute">Open Telegram or /transactions after you trade. No mock fills.</p>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-widest text-mute">Positions</p>
          <p className="mt-2 text-sm text-mute">FIFO lots update only after on-chain confirmation.</p>
        </Card>
      </div>
    </Shell>
  );
}
