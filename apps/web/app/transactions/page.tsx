import { Shell } from "../../components/shell";
import { Card } from "../../components/ui";

export default function TransactionsPage() {
  return (
    <Shell title="Transactions">
      <Card>
        <p className="text-sm text-mute leading-relaxed">
          A submitted hash is PENDING until a successful receipt. Confirmed and failed states are written by the
          worker after <code className="text-gold">eth_getTransactionReceipt</code>.
        </p>
      </Card>
    </Shell>
  );
}
