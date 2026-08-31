"use client";

import { useState } from "react";
import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";
import { cn } from "@/lib/cn";

const SCREENS = [
  {
    id: "search",
    n: "01",
    title: "Search token",
    caption: "Find a market, then open a buy flow.",
  },
  {
    id: "buy",
    n: "02",
    title: "Buy",
    caption: "Review amount, slippage and the ArcTrade fee.",
  },
  {
    id: "success",
    n: "03",
    title: "Success",
    caption: "Confirmation, then transaction tracking.",
  },
];

export function BuyWalkthrough() {
  const [i, setI] = useState(0);

  return (
    <section>
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:py-16">
            <Reveal>
              <TechLabel tone="blue">Buy flow</TechLabel>
              <h2 className="display mt-5 text-[36px] md:text-[48px]">
                The trade,
                <br />
                screen by screen.
              </h2>
              <ol className="mt-10">
                {SCREENS.map((s, idx) => (
                  <li key={s.id} className={idx ? "border-t border-line" : undefined}>
                    <button
                      type="button"
                      onClick={() => setI(idx)}
                      className={cn(
                        "flex w-full items-start gap-4 py-5 text-left",
                        i === idx ? "text-ink" : "text-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] uppercase tracking-[0.18em]",
                          i === idx ? "text-arcblue" : "text-muted",
                        )}
                      >
                        {s.n}
                      </span>
                      <span>
                        <span className="block text-lg font-medium tracking-tight">{s.title}</span>
                        <span className="mt-1 block text-sm leading-relaxed">{s.caption}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-muted">
                Illustrative interface · example values
              </p>
            </Reveal>
          </div>

          <div className="col-span-4 flex items-center justify-center bg-wash/40 px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:py-16">
            <div className="w-full max-w-[360px] border border-line bg-white">
              {i === 0 ? <SearchScreen /> : null}
              {i === 1 ? <BuyScreen /> : null}
              {i === 2 ? <SuccessScreen /> : null}
            </div>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function SearchScreen() {
  return (
    <div className="px-5 py-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Search token</p>
      <div className="mt-3 border border-line px-3 py-3 text-sm text-muted">TOKEN</div>
      <div className="mt-4 flex items-end justify-between border-y border-line py-4">
        <div>
          <p className="text-lg font-medium">TOKEN</p>
          <p className="text-sm text-muted">$0.0042</p>
        </div>
        <span className="inline-flex h-10 items-center bg-arcblue px-5 text-[12px] font-medium uppercase tracking-[0.14em] text-white">
          Buy
        </span>
      </div>
    </div>
  );
}

function BuyScreen() {
  return (
    <div className="px-5 py-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Buy</p>
      <p className="mt-2 text-2xl font-medium tracking-tight">TOKEN</p>
      <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-muted">Pay</dt>
          <dd>25 USDC</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-muted">Receive</dt>
          <dd>~X TOKEN</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-muted">Slippage</dt>
          <dd>0.5%</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-muted">ArcTrade fee</dt>
          <dd className="text-arcblue">$0.125</dd>
        </div>
      </dl>
      <div className="mt-5 flex h-11 items-center justify-center bg-arcblue text-[12px] font-medium uppercase tracking-[0.14em] text-white">
        Confirm buy
      </div>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto grid size-10 place-items-center border border-arcblue text-arcblue">✓</div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-arcblue">Trade confirmed</p>
      <p className="mt-2 text-lg font-medium">25 USDC → TOKEN</p>
      <div className="mt-6 flex h-11 items-center justify-center bg-wash text-[12px] font-medium uppercase tracking-[0.14em]">
        View transaction
      </div>
    </div>
  );
}
