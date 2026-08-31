import Link from "next/link";
import { Button } from "../components/ui";

const telegram = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/ArcTradeBot";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink-950 text-paper">
      <header className="flex items-center justify-between px-8 py-6 border-b border-ink-700">
        <span className="font-mono text-xs tracking-[0.4em] text-gold">ARCTRADE</span>
        <nav className="flex gap-6 text-sm text-mute">
          <Link href="/docs">Docs</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/trade">Terminal</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-3xl px-8 py-28">
        <p className="font-mono text-xs tracking-[0.25em] text-gold">ARC TESTNET</p>
        <h1 className="mt-4 text-5xl font-medium leading-tight tracking-tight">Trade Arc from Telegram.</h1>
        <p className="mt-6 max-w-xl text-lg text-mute leading-relaxed">
          Fast token discovery. Simple execution. Real-time portfolio tracking.
        </p>
        <div className="mt-10 flex gap-4">
          <a href={telegram}>
            <Button>Open Telegram</Button>
          </a>
          <Link href="/trade">
            <Button variant="ghost">Open terminal</Button>
          </Link>
        </div>
        <dl className="mt-20 grid grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-mute">Network</dt>
            <dd className="mt-1 font-mono">Arc Testnet · 5042002</dd>
          </div>
          <div>
            <dt className="text-mute">Gas</dt>
            <dd className="mt-1 font-mono">USDC</dd>
          </div>
          <div>
            <dt className="text-mute">Execution</dt>
            <dd className="mt-1 font-mono">Standard</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
