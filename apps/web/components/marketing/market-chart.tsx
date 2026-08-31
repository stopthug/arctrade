"use client";

import { useMemo, useState } from "react";
import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";
import { cn } from "@/lib/cn";

const RANGES = ["1H", "4H", "1D", "1W"] as const;
type Range = (typeof RANGES)[number];

const SERIES: Record<Range, number[]> = {
  "1H": [42, 44, 41, 46, 45, 48, 47, 51, 50, 54, 52, 58, 61, 59, 64, 62, 68, 70],
  "4H": [38, 42, 40, 36, 44, 48, 46, 52, 49, 55, 60, 57, 63, 61, 66, 70, 68, 72],
  "1D": [30, 34, 32, 38, 36, 42, 48, 44, 50, 47, 55, 58, 54, 62, 60, 67, 65, 70],
  "1W": [22, 28, 26, 34, 30, 38, 36, 44, 42, 50, 48, 56, 52, 60, 58, 66, 64, 70],
};

function toPath(values: number[], w: number, h: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * (h - 16) - 8;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function MarketChart() {
  const [range, setRange] = useState<Range>("1D");
  const w = 720;
  const h = 280;
  const d = useMemo(() => toPath(SERIES[range], w, h), [range, w, h]);
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;

  return (
    <section id="market">
      <Shell>
        <div className="grid grid-cols-4 border-y border-line md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-16">
            <Reveal>
              <TechLabel tone="blue">Arc market</TechLabel>
              <h2 className="display mt-5 text-[36px] md:text-[52px] lg:text-[60px]">
                See the market.
                <br />
                Then make your move.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-4 flex items-end px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:py-16">
            <Reveal delay={0.08}>
              <p className="max-w-[40ch] text-base leading-relaxed text-muted">
                A trading-terminal view of TOKEN / USDC. Values on this page are
                illustrative — they are not live market data.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="px-5 py-10 md:px-8 md:py-14">
          <div className="border border-line bg-white">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-5 md:px-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  TOKEN / USDC
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <p className="text-3xl font-medium tracking-tight md:text-4xl">$0.0042</p>
                  <p className="text-sm text-arcblue">+12.4%</p>
                </div>
              </div>
              <div className="flex border border-line">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cn(
                      "h-9 px-3 text-[11px] uppercase tracking-[0.14em] transition-colors",
                      range === r ? "bg-arcblue text-white" : "text-muted hover:text-ink",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${w} ${h}`}
                className="h-[240px] min-w-[520px] w-full md:h-[320px]"
                role="img"
                aria-label="Illustrative TOKEN / USDC price chart"
              >
                {[0.25, 0.5, 0.75].map((g) => (
                  <line
                    key={g}
                    x1="0"
                    x2={w}
                    y1={h * g}
                    y2={h * g}
                    stroke="#E8E8E4"
                    strokeWidth="1"
                  />
                ))}
                <path d={area} fill="url(#chartFill)" />
                <path
                  key={range}
                  d={d}
                  fill="none"
                  stroke="#1A53E8"
                  strokeWidth="1.5"
                  className="chart-line"
                />
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A53E8" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#1A53E8" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="border-t border-line px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-muted">
              Illustrative interface
            </p>
          </div>
        </div>
      </Shell>
    </section>
  );
}
