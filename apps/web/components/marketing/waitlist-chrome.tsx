import Image from "next/image";
import Link from "next/link";

export function WaitlistNav() {
  return (
    <header className="border-b border-line bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-arcblue focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="shell">
        <div className="flex items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brand.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
              priority
            />
            <span className="text-[13px] font-medium uppercase tracking-[0.16em]">
              ArcTrade
            </span>
          </Link>
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-arcblue">
            [ Waitlist ]
          </span>
        </div>
      </div>
    </header>
  );
}

export function WaitlistFooter() {
  return (
    <footer>
      <div className="shell border-t border-line">
        <div className="flex flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="max-w-[62ch] text-[11px] leading-relaxed text-muted">
            ArcTrade is an independent application built for the Arc ecosystem and
            is not affiliated with or endorsed by Circle unless explicitly stated.
          </p>
          <nav className="flex gap-5">
            <Link
              href="/terms"
              className="text-[11px] uppercase tracking-[0.16em] text-muted hover:text-ink"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-[11px] uppercase tracking-[0.16em] text-muted hover:text-ink"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
