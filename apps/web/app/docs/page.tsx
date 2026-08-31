import { Shell } from "../../components/shell";
import { Card } from "../../components/ui";

export default function DocsPage() {
  return (
    <Shell title="Documentation">
      <div className="grid gap-4 max-w-2xl">
        {[
          ["Architecture", "Monorepo, quote lifecycle, workers"],
          ["Arc integration", "Verified chain ID, RPC, USDC, Swap Kit"],
          ["Wallet security", "Encrypted local signer is testnet/dev only"],
          ["Trading engine", "Provider adapters, no fake quotes"],
          ["Fees", "Displayed fees equal charged fees"],
          ["Deployment", "Production checklist — not yet claimed safe"],
        ].map(([title, body]) => (
          <Card key={title}>
            <h2 className="text-sm font-medium">{title}</h2>
            <p className="mt-1 text-sm text-mute">{body}. Full markdown lives in the repository /docs folder.</p>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
