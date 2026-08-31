import Image from "next/image";
import { ARC_URL, TELEGRAM_URL } from "@/lib/constants";

const LINKS = [
  { href: "#trade", label: "Trade" },
  { href: "#arc", label: "Arc" },
  { href: "#how-it-works", label: "Docs" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: TELEGRAM_URL, label: "Telegram", external: true },
];

export function SiteFooter() {
  return (
    <footer>
      <div className="shell border-t border-line">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-10 md:col-span-6 md:px-8 lg:col-span-4 lg:border-b-0 lg:border-r">
            <a href="#main" className="flex items-center gap-2.5">
              <Image src="/brand.png" alt="" width={24} height={24} className="rounded-full" />
              <span className="text-[12px] font-medium uppercase tracking-[0.16em]">
                ArcTrade
              </span>
            </a>
            <p className="mt-6 max-w-[36ch] text-[12px] leading-relaxed text-muted">
              A Telegram-native trading bot for the Arc ecosystem. Independent of
              Circle unless explicitly stated.
            </p>
          </div>
          <nav className="col-span-4 flex flex-wrap content-start gap-x-6 gap-y-3 px-5 py-10 md:col-span-6 md:px-8 lg:col-span-8">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href={ARC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
            >
              Arc.network
            </a>
            <span className="text-[11px] uppercase tracking-[0.16em] text-line">X</span>
          </nav>
        </div>
        <div className="border-t border-line px-5 py-6 md:px-8">
          <p className="max-w-[72ch] text-[11px] leading-relaxed text-muted">
            ArcTrade is an independent application built for the Arc ecosystem and
            is not affiliated with or endorsed by Circle unless explicitly stated.
            Trading involves risk. Nothing on this site is financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
