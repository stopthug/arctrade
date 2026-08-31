import { Shell } from "../../components/shell";
import { Card } from "../../components/ui";

export default function SettingsPage() {
  return (
    <Shell title="Settings">
      <Card className="max-w-xl space-y-4 text-sm">
        <p>
          Slippage presets: 0.1% / 0.5% / 1% / custom. High slippage requires a second confirmation. ArcTrade never
          silently increases slippage.
        </p>
        <p className="text-mute">Token policy default: WARN_UNVERIFIED. Notifications are per-event and opt-in.</p>
        <p className="text-mute">Change these in Telegram /settings. Web writes go through the authenticated API.</p>
      </Card>
    </Shell>
  );
}
