import { Shell } from "../../components/shell";
import { Card } from "../../components/ui";

export default function PortfolioPage() {
  return (
    <Shell title="Portfolio">
      <Card>
        <p className="text-sm text-mute leading-relaxed">
          Portfolio totals are computed from on-chain ERC-20 balances and verified marks (USDC = $1, EURC via ECB
          reference, cirBTC via BTC reference). Open Telegram, run /start, then query the API with your Telegram id:
          <code className="mx-1 text-gold">GET /v1/users/&lt;telegramId&gt;/overview</code>
        </p>
        <p className="mt-4 font-mono text-xs text-mute">Never uses JavaScript floats in the trading engine — decimal.js only.</p>
      </Card>
    </Shell>
  );
}
