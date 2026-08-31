import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";
import { cn } from "@/lib/cn";

const POINTS = [
  {
    n: "01",
    title: "Transaction confirmation",
    body: "Trades require an explicit confirm step before they are sent.",
  },
  {
    n: "02",
    title: "Explicit fee display",
    body: "The ArcTrade service fee is shown before you confirm.",
  },
  {
    n: "03",
    title: "Slippage controls",
    body: "Review and set slippage before execution.",
  },
  {
    n: "04",
    title: "Address validation",
    body: "Contract addresses are checked before a market is opened.",
  },
  {
    n: "05",
    title: "Transaction tracking",
    body: "Follow the state of an order after it is submitted.",
  },
  {
    n: "06",
    title: "Clear transaction states",
    body: "Pending, confirmed and failed states are shown without ambiguity.",
  },
];

export function Security() {
  return (
    <section id="security">
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-16">
            <Reveal>
              <TechLabel tone="blue">Built with security in mind</TechLabel>
              <h2 className="display mt-5 text-[36px] md:text-[52px]">
                Controls you can
                <br />
                see before you sign.
              </h2>
              <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted">
                ArcTrade is designed so fee, slippage and confirmation details are
                visible in the interface. This is not a security audit claim.
              </p>
            </Reveal>
          </div>
          <div className="relative col-span-4 min-h-[240px] px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:py-16">
            <SecuritySchematic />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map((p, i) => (
            <article
              key={p.n}
              className={cn(
                "border-t border-line px-5 py-8 md:px-8",
                i % 2 === 1 && "sm:border-l",
                "lg:border-l lg:[&:nth-child(3n+1)]:border-l-0",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{p.n}</p>
              <h3 className="mt-4 text-lg font-medium tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </article>
          ))}
        </div>
      </Shell>
    </section>
  );
}

function SecuritySchematic() {
  const nodes = ["Confirm", "Fee", "Slippage", "Validate", "Track"];
  return (
    <div className="flex h-full flex-col justify-center">
      <svg viewBox="0 0 360 180" className="w-full" aria-hidden>
        <line x1="24" y1="90" x2="336" y2="90" stroke="#D9D9D5" strokeDasharray="3 4" />
        {nodes.map((label, i) => {
          const x = 36 + i * 72;
          const active = i === 2;
          return (
            <g key={label}>
              <rect
                x={x - 22}
                y={active ? 58 : 66}
                width={44}
                height={active ? 44 : 28}
                fill={active ? "#1A53E8" : "#F7F7F5"}
                stroke={active ? "#1A53E8" : "#D9D9D5"}
              />
              <text
                x={x}
                y={140}
                textAnchor="middle"
                fill="#5F5F5F"
                fontSize="9"
                style={{ letterSpacing: "0.12em" }}
              >
                {label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
