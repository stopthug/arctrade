import { TelegramCta } from "@/components/marketing/button";
import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";

export function FinalCta() {
  return (
    <section>
      <Shell>
        <div className="px-5 py-24 md:px-8 md:py-32 lg:py-40">
          <Reveal>
            <TechLabel tone="blue">Ready</TechLabel>
            <h2 className="display mt-6 max-w-[12ch] text-[48px] md:text-[72px] lg:text-[96px]">
              Trade Arc.
              <br />
              Without leaving
              <br />
              Telegram.
            </h2>
            <p className="mt-8 max-w-[40ch] text-lg leading-relaxed text-muted">
              Discover, buy, sell and track Arc tokens from one simple interface.
            </p>
            <div className="mt-10">
              <TelegramCta>Open ArcTrade</TelegramCta>
            </div>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}
