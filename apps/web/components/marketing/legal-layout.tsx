import Link from "next/link";
import { MarketingRoot } from "@/components/marketing/root";
import { WaitlistFooter, WaitlistNav } from "@/components/marketing/waitlist-chrome";
import { Shell, TechLabel } from "@/components/marketing/ui";

export function LegalLayout({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingRoot>
      <WaitlistNav />
      <main id="main">
        <Shell>
          <div className="px-5 py-16 md:px-8 md:py-24">
            <TechLabel tone="blue">{kicker}</TechLabel>
            <h1 className="display mt-5 max-w-[16ch] text-[40px] md:text-[56px]">{title}</h1>
            <div className="mt-12 max-w-[62ch] space-y-6 text-[15px] leading-relaxed text-muted">
              {children}
            </div>
            <p className="mt-16">
              <Link href="/" className="text-[12px] uppercase tracking-[0.16em] text-ink">
                ← Back to ArcTrade
              </Link>
            </p>
          </div>
        </Shell>
      </main>
      <WaitlistFooter />
    </MarketingRoot>
  );
}
