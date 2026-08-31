import { Shell } from "../../components/shell";
import { Card } from "../../components/ui";

export default function ReferralsPage() {
  return (
    <Shell title="Referrals">
      <Card>
        <p className="text-sm text-mute leading-relaxed">
          Every user receives a code: <span className="font-mono text-paper">t.me/ArcTradeBot?start=CODE</span>. Volume
          and active referrals are tracked. Reward bps default to 0 — no hardcoded monetary promise.
        </p>
      </Card>
    </Shell>
  );
}
