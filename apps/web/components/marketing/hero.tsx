import { TelegramCta } from "@/components/marketing/button";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";

export function Hero() {
  return (
    <section className="relative">
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 flex flex-col justify-between border-b border-line px-5 py-16 md:col-span-6 md:px-8 md:py-20 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-24 lg:pr-12">
            <Reveal>
              <TechLabel tone="blue">Telegram-native trading</TechLabel>
              <h1 className="display mt-6 text-[48px] md:text-[72px] lg:text-[92px]">
                Trade Arc.
                <br />
                Directly from Telegram.
              </h1>
              <p className="mt-8 max-w-[46ch] text-lg leading-relaxed text-muted">
                Buy, sell and track tokens on Arc from one simple trading interface.
              </p>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-muted">
                ArcTrade gives you a simple trading interface for the Arc ecosystem,
                built directly into Telegram.
              </p>
              <p className="mt-6 text-[12px] uppercase tracking-[0.16em] text-ink">
                0.5% service fee per executed trade
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <TelegramCta>Open ArcTrade</TelegramCta>
                <a
                  href="#arc"
                  className="group/btn-down inline-flex h-11 items-center gap-2 px-5 text-[13px] font-medium uppercase tracking-[0.12em] text-ink"
                >
                  Learn about Arc
                  <span className="btn-arrow" aria-hidden>
                    ↓
                  </span>
                </a>
              </div>
            </Reveal>
          </div>

          <div className="relative col-span-4 overflow-hidden px-4 py-10 md:col-span-6 md:py-16 lg:col-span-5">
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 hatch" />
            <HeroVisual />
          </div>
        </div>
      </Shell>
    </section>
  );
}
