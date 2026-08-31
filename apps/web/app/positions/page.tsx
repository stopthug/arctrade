import { Shell } from "../../components/shell";
import { Card } from "../../components/ui";

export default function PositionsPage() {
  return (
    <Shell title="Positions">
      <Card>
        <p className="text-sm text-mute leading-relaxed">
          Positions track quantity, average entry, realized P&amp;L (FIFO by default), and unrealized P&amp;L. Stale marks
          are labeled with age. See docs/pnl.md.
        </p>
      </Card>
    </Shell>
  );
}
