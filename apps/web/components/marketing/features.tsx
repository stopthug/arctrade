import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";
import { cn } from "@/lib/cn";

const FEATURES = [
  {
    n: "01",
    title: "Fast execution",
    body: "Trade directly from Telegram without navigating multiple interfaces.",
  },
  {
    n: "02",
    title: "Live quotes",
    body: "See current quote information before confirming a trade.",
    graphic: "dots" as const,
  },
  {
    n: "03",
    title: "Portfolio",
    body: "Track balances and positions in one place.",
  },
  {
    n: "04",
    title: "Trade history",
    body: "Keep your executed transactions organized.",
  },
  {
    n: "05",
    title: "Token discovery",
    body: "Find tokens and inspect relevant market information.",
  },
  {
    n: "06",
    title: "Slippage control",
    body: "Review and configure slippage before execution.",
  },
  {
    n: "07",
    title: "Telegram native",
    body: "Your trading interface lives where you already communicate.",
  },
  {
    n: "08",
    title: "Arc native",
    body: "Built specifically around the Arc ecosystem.",
  },
];

export function Features() {
  return (
    <section id="features">
      <Shell>
        <div className="grid grid-cols-4 border-y border-line md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-16">
            <Reveal>
              <TechLabel tone="blue">Features</TechLabel>
              <h2 className="display mt-5 text-[36px] md:text-[52px] lg:text-[60px]">
                Everything you need
                <br />
                to trade Arc.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-4 flex items-end px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:py-16">
            <Reveal delay={0.08}>
              <p className="max-w-[38ch] text-base leading-relaxed text-muted">
                Discovery, quoting, execution and tracking — structured as a single
                Telegram workflow.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <article
              key={f.n}
              className={cn(
                "group flex min-h-[280px] flex-col justify-between border-b border-line px-5 py-8 transition-transform duration-500 hover:-translate-y-0.5 md:px-6",
                (i + 1) % 2 === 0 ? "sm:border-l" : "",
                "lg:border-l lg:[&:nth-child(4n+1)]:border-l-0",
              )}
            >
              <div>
                <p className="text-[40px] font-medium leading-none tracking-tight text-line">
                  {f.n}
                </p>
                {f.graphic ? (
                  <div className="mt-8 h-16 w-full max-w-[140px] hatch-blue opacity-80" />
                ) : (
                  <div className="mt-8 h-px w-10 bg-line" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Shell>
    </section>
  );
}
