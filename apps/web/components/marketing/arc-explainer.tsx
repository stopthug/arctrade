import { Reveal, Shell } from "@/components/marketing/ui";
import { cn } from "@/lib/cn";

const BLOCKS = [
  {
    n: "01",
    title: "Stablecoin-native",
    body: "Fees are designed around stablecoins rather than a volatile gas token.",
  },
  {
    n: "02",
    title: "Fast settlement",
    body: "Arc is designed for deterministic finality in under a second.",
  },
  {
    n: "03",
    title: "Financial infrastructure",
    body: "Built for payments, FX, trading, treasury and other real-world financial workflows.",
  },
  {
    n: "04",
    title: "Interoperable",
    body: "Arc is designed to connect with broader blockchain liquidity and financial infrastructure.",
  },
];

export function ArcExplainer() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {BLOCKS.map((b, i) => (
            <Reveal
              key={b.n}
              delay={i * 0.06}
              className={cn(
                "min-h-[280px] border-b border-line px-5 py-10 md:px-8",
                i % 2 === 1 && "sm:border-l",
                "lg:border-l lg:first:border-l-0",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{b.n}</p>
              <h3 className="mt-16 text-xl font-medium tracking-tight">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{b.body}</p>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}
