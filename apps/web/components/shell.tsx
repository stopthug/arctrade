import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/trade", label: "Trade" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/positions", label: "Positions" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/transactions", label: "Transactions" },
  { href: "/referrals", label: "Referrals" },
  { href: "/settings", label: "Settings" },
  { href: "/docs", label: "Docs" },
];

export function Shell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r border-ink-700 bg-ink-900 px-4 py-6 flex flex-col gap-8">
        <Link href="/" className="font-mono text-xs tracking-[0.35em] text-gold">
          ARCTRADE
        </Link>
        <nav className="flex flex-col gap-1 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1.5 text-mute hover:text-paper hover:bg-ink-800 rounded-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto text-[11px] text-mute leading-relaxed">
          Arc Testnet · USDC gas
          <br />
          Standard execution
        </p>
      </aside>
      <main className="px-8 py-6">
        <header className="mb-8 flex items-baseline justify-between border-b border-ink-700 pb-4">
          <h1 className="text-xl font-medium tracking-tight">{title}</h1>
          <span className="font-mono text-[11px] text-mute">chain 5042002</span>
        </header>
        {children}
      </main>
    </div>
  );
}
