"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Glyph } from "@/components/marketing/iso-module";

const STEPS = [
  {
    n: "01",
    title: "Find",
    body: "Discover a token or paste its contract address.",
    glyph: "search" as const,
  },
  {
    n: "02",
    title: "Quote",
    body: "ArcTrade retrieves available liquidity and a live trading quote.",
    glyph: "quote" as const,
  },
  {
    n: "03",
    title: "Review",
    body: "Review price, slippage, minimum received and fees.",
    glyph: "grid" as const,
  },
  {
    n: "04",
    title: "Execute",
    body: "Confirm the trade directly through Telegram.",
    glyph: "bolt" as const,
  },
  {
    n: "05",
    title: "Track",
    body: "Monitor the transaction and portfolio afterward.",
    glyph: "eye" as const,
  },
];

export function ProcessVisual() {
  const [active, setActive] = useState(2);

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
      <div className="col-span-4 border-b border-line md:col-span-6 lg:col-span-4 lg:border-b-0 lg:border-r">
        <ol>
          {STEPS.map((step, i) => (
            <li key={step.n} className={i !== 0 ? "border-t border-line" : undefined}>
              <button
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-start gap-4 px-5 py-6 text-left transition-colors duration-300 md:px-8",
                  active === i ? "bg-white" : "hover:bg-white/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border text-[11px] tracking-wide",
                    active === i
                      ? "border-arcblue bg-arcblue text-white"
                      : "border-line text-muted",
                  )}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-muted">
                    {step.n}
                  </span>
                  <span
                    className={cn(
                      "block text-lg font-medium tracking-tight",
                      active === i ? "text-arcblue" : "text-ink",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="mt-1.5 block max-w-[34ch] text-sm leading-relaxed text-muted">
                    {step.body}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="col-span-4 flex min-h-[420px] items-center justify-center bg-canvas md:col-span-6 lg:col-span-8 lg:min-h-[640px]">
        <div className="process-scene relative h-[340px] w-[280px] md:h-[420px] md:w-[340px]">
          <div className="process-stack mx-auto">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className={cn("process-plate", active === i && "is-active")}
                style={{
                  transform: `translateZ(${(4 - i) * 58}px)`,
                  transition: "background 0.5s ease, box-shadow 0.5s ease, color 0.5s ease, border-color 0.5s ease",
                }}
              >
                <Glyph name={step.glyph} />
              </div>
            ))}
          </div>
          <p className="absolute bottom-0 left-1/2 w-max -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-muted">
            {STEPS[active].n}  {STEPS[active].title}
          </p>
        </div>
      </div>
    </div>
  );
}
