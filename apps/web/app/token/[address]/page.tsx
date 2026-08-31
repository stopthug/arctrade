import { Shell } from "../../../components/shell";
import { Card } from "../../../components/ui";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function TokenPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  let payload: { token?: { name: string; symbol: string; verified: boolean; address: string }; price?: { priceUsd: string | null; source: string; change24h: string | null; liquidity: string | null; volume24h: string | null; marketCap: string | null }; warning?: string | null; error?: string } | null = null;
  try {
    const res = await fetch(`${api}/v1/tokens/${address}`, { cache: "no-store" });
    payload = await res.json();
  } catch {
    payload = { error: "API unreachable" };
  }
  const token = payload?.token;
  const price = payload?.price;
  return (
    <Shell title={token ? `${token.name} (${token.symbol})` : "Token"}>
      {payload?.error ? <p className="text-ask">{payload.error}</p> : null}
      {payload?.warning ? <p className="mb-4 text-gold text-sm">{payload.warning}</p> : null}
      <Card>
        <p className="font-mono text-xs text-mute">{token?.address ?? address}</p>
        <p className="mt-4 font-mono text-3xl">{price?.priceUsd ? `$${price.priceUsd}` : "No verified price"}</p>
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
          <div>
            <dt className="text-mute">Verified</dt>
            <dd>{token?.verified ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-mute">Holders</dt>
            <dd>unavailable (no verified indexer)</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-mute">{price?.source}</p>
        <div className="mt-6 flex gap-3 text-sm">
          <Link className="text-bid" href="/trade">
            BUY
          </Link>
          <Link className="text-ask" href="/trade">
            SELL
          </Link>
          <Link className="text-gold" href="/watchlist">
            WATCH
          </Link>
        </div>
      </Card>
    </Shell>
  );
}
