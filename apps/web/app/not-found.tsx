import type { Metadata } from "next";
import Link from "next/link";
import { MarketingRoot } from "@/components/marketing/root";
import { WaitlistFooter, WaitlistNav } from "@/components/marketing/waitlist-chrome";
import { Shell, TechLabel } from "@/components/marketing/ui";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <MarketingRoot>
      <WaitlistNav />
      <main id="main">
        <Shell>
          <div className="px-5 py-24 md:px-8 md:py-32">
            <TechLabel tone="blue">404</TechLabel>
            <h1 className="display mt-5 text-[48px] md:text-[72px]">Page not found.</h1>
            <p className="mt-6 max-w-[40ch] text-muted">
              That route does not exist. Join the waitlist, or return home.
            </p>
            <p className="mt-10">
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
