import { Shell } from "../../components/shell";
import { Stat } from "../../components/ui";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function loadNetwork() {
  try {
    const res = await fetch(`${api}/v1/network`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function loadReady() {
  try {
    const res = await fetch(`${api}/ready`, { cache: "no-store" });
    return res.json();
  } catch {
    return { ready: false, checks: {} };
  }
}

export default async function DashboardPage() {
  const [network, ready] = await Promise.all([loadNetwork(), loadReady()]);
  return (
    <Shell title="Overview">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Network" value={network?.name ?? "Unreachable"} hint="From live API, not a mock." />
        <Stat label="Chain ID" value={String(network?.chainId ?? "—")} />
        <Stat label="API" value={ready.ready ? "Ready" : "Degraded"} hint="Database, Redis, RPC, provider" />
      </div>
      <div className="mt-8 text-sm text-mute max-w-2xl leading-relaxed">
        <p>
          Connect via Telegram to create an encrypted testnet wallet. Balances and quotes are read from Arc RPC
          and Circle Swap Kit. This dashboard never displays private keys.
        </p>
      </div>
    </Shell>
  );
}
