import { Shell } from "../../components/shell";
import { Card } from "../../components/ui";

export default function WatchlistPage() {
  return (
    <Shell title="Watchlist">
      <Card>
        <p className="text-sm text-mute">Watchlist is per Telegram user. Use ⭐ Watch in the bot or the token page.</p>
      </Card>
    </Shell>
  );
}
