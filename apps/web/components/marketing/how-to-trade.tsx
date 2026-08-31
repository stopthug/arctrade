import { TelegramCta } from "@/components/marketing/button";
import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    n: "01",
    title: "Open Telegram",
    body: "Open ArcTrade.",
  },
  {
    n: "02",
    title: "Connect / create wallet",
    body: "Follow the wallet onboarding flow.",
  },
  {
    n: "03",
    title: "Fund",
    body: "Deposit supported assets on Arc.",
  },
  {
    n: "04",
    title: "Choose a token",
    body: "Search for a token or enter its verified contract address.",
  },
  {
    n: "05",
    title: "Set your trade",
    body: "Choose buy/sell amount and review slippage.",
  },
  {
    n: "06",
    title: "Confirm",
    body: "Review the quote and fee, then confirm.",
  },
];

export function HowToTrade() {
  return (
    <section id="trade">
      <Shell>
        <div className="grid grid-cols-4 border-y border-line md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-16">
            <Reveal>
              <TechLabel tone="blue">How to trade</TechLabel>
              <h2 className="display mt-5 text-[36px] md:text-[52px] lg:text-[60px]">
                Your first trade
                <br />
                takes minutes.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-4 flex items-end px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:py-16">
            <Reveal delay={0.08}>
              <TelegramCta>Open ArcTrade</TelegramCta>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <article
              key={s.n}
              className={cn(
                "border-b border-line px-5 py-10 md:px-8",
                i % 2 === 1 && "sm:border-l",
                "lg:border-l lg:[&:nth-child(3n+1)]:border-l-0",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Step {s.n}
              </p>
              <h3 className="mt-8 text-xl font-medium tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </article>
          ))}
        </div>
      </Shell>
    </section>
  );
}
