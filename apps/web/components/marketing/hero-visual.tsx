"use client";

import { IsoModule, Glyph } from "@/components/marketing/iso-module";
import { usePointerParallax } from "@/lib/use-parallax";

const BLOCKS = [
  { label: "Discover", glyph: "search" as const, tone: "paper" as const, x: 18, y: 8, size: 118, depth: 48, delay: "0s" },
  { label: "Quote", glyph: "quote" as const, tone: "paper" as const, x: 132, y: 72, size: 128, depth: 52, delay: "0.6s" },
  { label: "Execute", glyph: "bolt" as const, tone: "blue" as const, x: 42, y: 168, size: 148, depth: 60, delay: "1.1s" },
  { label: "Track", glyph: "eye" as const, tone: "paper" as const, x: 168, y: 248, size: 110, depth: 44, delay: "1.7s" },
];

export function HeroVisual() {
  const { ref, p } = usePointerParallax(true);

  return (
    <div
      ref={ref}
      className="iso-scene relative mx-auto h-[420px] w-full max-w-[420px] md:h-[520px]"
    >
      <div
        className="absolute inset-0 origin-center transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${-p.y * 4}deg) rotateY(${p.x * 6}deg)`,
        }}
      >
        {BLOCKS.map((b) => (
          <div
            key={b.label}
            className="absolute"
            style={{ left: `${b.x}px`, top: `${b.y}px` }}
          >
            <div
              className="float-y"
              style={{
                transformStyle: "preserve-3d",
                animationDelay: b.delay,
              }}
            >
              <IsoModule size={b.size} depth={b.depth} tone={b.tone}>
                <Glyph name={b.glyph} />
              </IsoModule>
              <div className="iso-shadow" />
            </div>
            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
              {b.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
