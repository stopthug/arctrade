"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { NAV, TELEGRAM_URL } from "@/lib/constants";
import { Button } from "@/components/marketing/button";
import { cn } from "@/lib/cn";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-arcblue focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="shell">
        <div className="grid grid-cols-4 items-center md:grid-cols-6 lg:grid-cols-12">
          <a
            href="#main"
            className="col-span-2 flex items-center gap-2.5 px-4 py-4 md:px-6"
          >
            <Image
              src="/brand.png"
              alt=""
              width={28}
              height={28}
              className="rounded-full"
              priority
            />
            <span className="text-[13px] font-medium uppercase tracking-[0.16em]">
              ArcTrade
            </span>
          </a>

          <nav className="hidden items-center justify-center gap-8 lg:col-span-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="col-span-2 flex items-center justify-end gap-2 px-3 md:col-span-4 lg:col-span-3 lg:px-6">
            <button
              type="button"
              className="h-11 px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-ink lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? "Close" : "Menu"}
            </button>
            <Button href={TELEGRAM_URL} className="h-10 px-3 text-[11px] sm:px-4">
              Open Telegram
            </Button>
          </div>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "border-t border-line bg-canvas lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="shell">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line px-5 py-4 text-[13px] uppercase tracking-[0.16em]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
