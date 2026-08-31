"use client";

import { useEffect, useMemo, useState } from "react";
import { FEE_RATE, MAINNET_ISO } from "@/lib/constants";

const MAINNET_MS = Date.parse(`${MAINNET_ISO}T00:00:00.000Z`);

function remaining(now: number) {
  const delta = Math.max(0, MAINNET_MS - now);
  const days = Math.floor(delta / 86_400_000);
  const hours = Math.floor((delta % 86_400_000) / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  const seconds = Math.floor((delta % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: delta === 0 };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function WaitlistUtility() {
  const [now, setNow] = useState<number | null>(null);
  const [amount, setAmount] = useState("100");

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const clock = remaining(now ?? MAINNET_MS);
  const ready = now !== null;

  const parsed = Number.parseFloat(amount.replace(/,/g, ""));
  const valid = Number.isFinite(parsed) && parsed >= 0;
  const fee = useMemo(() => (valid ? parsed * FEE_RATE : 0), [parsed, valid]);

  const cells = [
    { n: ready ? (clock.done ? "00" : String(clock.days).padStart(2, "0")) : "—", l: "Days" },
    { n: ready ? pad(clock.hours) : "—", l: "Hrs" },
    { n: ready ? pad(clock.minutes) : "—", l: "Min" },
    { n: ready ? pad(clock.seconds) : "—", l: "Sec" },
  ];

  return (
    <aside className="border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Utility</p>
        <p className="text-[11px] uppercase tracking-[0.18em] text-arcblue">Fee preview</p>
      </div>

      <div className="border-b border-line px-5 py-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Arc mainnet</p>
        <p className="mt-2 font-medium tracking-tight">09.16.26</p>
        <p className="mt-1 text-[12px] text-muted">
          {clock.done ? "Scheduled date has passed" : "Public mainnet countdown"}
        </p>
        <div className="mt-5 grid grid-cols-4 border border-line">
          {cells.map((c, i) => (
            <div
              key={c.l}
              className={`px-2 py-3 text-center ${i ? "border-l border-line" : ""}`}
            >
              <p className="font-mono text-xl tabular-nums tracking-tight md:text-2xl">{c.n}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">{c.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        <label htmlFor="trade-amount" className="text-[11px] uppercase tracking-[0.18em] text-muted">
          Trade amount · USDC
        </label>
        <input
          id="trade-amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-3 h-11 w-full border border-line bg-canvas px-3 text-sm tabular-nums outline-none transition-colors focus:border-arcblue"
        />
        <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
          <div className="flex justify-between py-3">
            <dt className="text-muted">ArcTrade fee · 0.5%</dt>
            <dd className="font-medium tabular-nums text-arcblue">
              {valid ? `$${fee.toFixed(fee >= 1 ? 2 : 3)}` : "—"}
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-muted">Network / execution</dt>
            <dd className="text-right text-[13px]">Shown before confirm</dd>
          </div>
        </dl>
        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Illustrative only. Fees and execution costs may vary with liquidity.
        </p>
      </div>
    </aside>
  );
}
