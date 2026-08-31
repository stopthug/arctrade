import { Reveal, Rule, Shell, TechLabel } from "@/components/marketing/ui";
import { TelegramUI } from "@/components/marketing/telegram-ui";

export function Product() {
  return (
    <section id="product">
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-20">
            <Reveal>
              <TechLabel tone="blue">The product</TechLabel>
              <h2 className="display mt-5 text-[40px] md:text-[56px] lg:text-[68px]">
                Your Arc
                <br />
                trading terminal.
                <br />
                Inside Telegram.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-4 flex items-end px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:py-20">
            <Reveal delay={0.1}>
              <p className="max-w-[42ch] text-base leading-relaxed text-muted">
                ArcTrade makes onchain trading simpler by bringing token discovery,
                buying, selling, portfolio tracking and transaction history into a
                familiar Telegram interface.
              </p>
            </Reveal>
          </div>
        </div>
        <Rule />
        <div className="px-5 py-16 md:px-8 lg:py-20">
          <Reveal>
            <TelegramUI />
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}
