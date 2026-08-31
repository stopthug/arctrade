import { Shell } from "../../components/shell";
import { Card, Stat } from "../../components/ui";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default async function AdminPage() {
  const key = process.env.ADMIN_API_KEY ?? "";
  let metrics: Record<string, number | string> | { error: string } = { error: "Set ADMIN_API_KEY to load metrics." };
  if (key) {
    try {
      const res = await fetch(`${api}/v1/admin/metrics`, {
        headers: { "x-admin-key": key },
        cache: "no-store",
      });
      metrics = await res.json();
    } catch {
      metrics = { error: "admin API unreachable" };
    }
  }
  const m = metrics as Record<string, number>;
  return (
    <Shell title="Admin">
      {"error" in metrics ? (
        <p className="text-sm text-mute">{String((metrics as { error: string }).error)}</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Users" value={String(m.totalUsers ?? 0)} />
          <Stat label="DAU" value={String(m.dau ?? 0)} />
          <Stat label="WAU" value={String(m.wau ?? 0)} />
          <Stat label="MAU" value={String(m.mau ?? 0)} />
          <Stat label="Trades" value={String(m.trades ?? 0)} />
          <Stat label="Confirmed" value={String(m.confirmed ?? 0)} />
          <Stat label="Failed" value={String(m.failed ?? 0)} />
          <Stat label="Volume USDC" value={String(m.volumeUsdc ?? 0)} />
        </div>
      )}
      <Card className="mt-6">
        <p className="text-sm text-mute">
          Admin surfaces users, trades, tokens, fees, and health. Wallet secrets are never selected in these queries.
        </p>
      </Card>
    </Shell>
  );
}
