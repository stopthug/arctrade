import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { WaitlistFooter, WaitlistNav } from "@/components/marketing/waitlist-chrome";
import { WaitlistUtility } from "@/components/marketing/waitlist-utility";
import { MarketingRoot } from "@/components/marketing/root";
import { Shell, TechLabel } from "@/components/marketing/ui";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  description: SITE.description,
};

export default function WaitlistPage() {
  return (
    <MarketingRoot>
      <div className="flex min-h-screen flex-col">
        <WaitlistNav />
        <main id="main" className="flex flex-1 flex-col">
          <Shell className="flex flex-1 flex-col">
            <div className="grid flex-1 grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
              <section className="col-span-4 flex flex-col justify-center border-b border-line px-5 py-16 md:col-span-6 md:px-8 md:py-20 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-24">
                <TechLabel tone="blue">Telegram-native trading</TechLabel>
                <h1 className="display mt-6 text-[44px] md:text-[68px] lg:text-[84px]">
                  Trade Arc.
                  <br />
                  From Telegram.
                </h1>
                <p className="mt-8 max-w-[42ch] text-lg leading-relaxed text-muted">
                  Join the waitlist for ArcTrade. A simple interface to buy, sell and
                  track tokens on Arc — without leaving Telegram.
                </p>
                <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-ink">
                  0.5% service fee per executed trade
                </p>
                <div className="relative mt-10 max-w-[520px]">
                  <WaitlistForm />
                </div>
              </section>
              <section className="col-span-4 flex flex-col justify-center px-5 py-12 md:col-span-6 md:px-8 lg:col-span-5 lg:py-16">
                <WaitlistUtility />
              </section>
            </div>
          </Shell>
        </main>
        <WaitlistFooter />
      </div>
    </MarketingRoot>
  );
}
