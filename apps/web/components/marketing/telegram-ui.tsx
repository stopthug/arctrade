"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Mode = "home" | "buy" | "success";

export function TelegramUI({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("home");

  return (
    <div className="mx-auto w-full max-w-[380px]">
      <div className="border border-line bg-white shadow-[0_24px_60px_rgba(10,10,10,0.06)]">
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Image
            src="/brand.png"
            alt=""
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium tracking-tight">ArcTrade</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
              Telegram interface
            </p>
          </div>
          <span className="text-muted" aria-hidden>
            ⋯
          </span>
        </header>

        {mode === "home" ? <HomeScreen onBuy={() => setMode("buy")} compact={compact} /> : null}
        {mode === "buy" ? (
          <BuyScreen onBack={() => setMode("home")} onConfirm={() => setMode("success")} />
        ) : null}
        {mode === "success" ? <SuccessScreen onDone={() => setMode("home")} /> : null}
      </div>
      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
        Illustrative interface · example values
      </p>
    </div>
  );
}

function HomeScreen({ onBuy, compact }: { onBuy: () => void; compact?: boolean }) {
  return (
    <div className="px-4 py-4">
      <RowLabel>Portfolio</RowLabel>
      <p className="mt-1 text-[32px] font-medium tracking-tight">$2,481.42</p>
      <div className="mt-3 grid grid-cols-2 gap-px border border-line bg-line">
        <Asset name="USDC" value="$1,824.20" />
        <Asset name="TOKEN" value="$657.22" />
      </div>

      {!compact ? (
        <>
          <RowLabel className="mt-6">Trending</RowLabel>
          <ul className="mt-2 border border-line">
            <TrendRow name="TOKEN" price="$0.0042" change="+18.4%" />
            <TrendRow name="TOKEN" price="$0.012" change="+7.2%" last />
          </ul>
        </>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onBuy}
          className="group/btn h-11 rounded-none bg-arcblue text-[12px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-arcblue-deep"
        >
          Buy
        </button>
        <button
          type="button"
          className="h-11 bg-wash text-[12px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-[#e6e6e0]"
        >
          Sell
        </button>
      </div>
    </div>
  );
}

function BuyScreen({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  return (
    <div className="px-4 py-4">
      <button
        type="button"
        onClick={onBack}
        className="text-[11px] uppercase tracking-[0.16em] text-muted hover:text-ink"
      >
        ← Back
      </button>
      <RowLabel className="mt-4">Buy</RowLabel>
      <p className="mt-1 text-2xl font-medium tracking-tight">TOKEN</p>
      <dl className="mt-4 divide-y divide-line border border-line text-[13px]">
        <KV k="Pay" v="25 USDC" />
        <KV k="Receive" v="~5,952 TOKEN" />
        <KV k="Slippage" v="0.5%" />
        <KV k="ArcTrade fee" v="$0.125" accent />
      </dl>
      <button
        type="button"
        onClick={onConfirm}
        className="group/btn mt-5 h-11 w-full bg-arcblue text-[12px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-arcblue-deep"
      >
        Confirm buy
      </button>
    </div>
  );
}

function SuccessScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="px-4 py-8 text-center">
      <div className="mx-auto grid size-12 place-items-center border border-arcblue text-arcblue">
        ✓
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-arcblue">Trade confirmed</p>
      <p className="mt-2 text-lg font-medium tracking-tight">25 USDC → TOKEN</p>
      <p className="mt-2 text-sm text-muted">Example confirmation state</p>
      <button
        type="button"
        onClick={onDone}
        className="mt-6 h-11 w-full bg-wash text-[12px] font-medium uppercase tracking-[0.14em]"
      >
        View transaction
      </button>
    </div>
  );
}

function RowLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] uppercase tracking-[0.16em] text-muted", className)}>
      {children}
    </p>
  );
}

function Asset({ name, value }: { name: string; value: string }) {
  return (
    <div className="bg-white px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{name}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function TrendRow({
  name,
  price,
  change,
  last,
}: {
  name: string;
  price: string;
  change: string;
  last?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center justify-between px-3 py-3 text-sm",
        !last && "border-b border-line",
      )}
    >
      <span className="font-medium">{name}</span>
      <span className="text-muted">{price}</span>
      <span className="text-arcblue">{change}</span>
    </li>
  );
}

function KV({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <dt className="text-muted">{k}</dt>
      <dd className={accent ? "text-arcblue" : "font-medium"}>{v}</dd>
    </div>
  );
}
