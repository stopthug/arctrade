"use client";

import { IsoModule } from "@/components/marketing/iso-module";
import { usePointerParallax } from "@/lib/use-parallax";

const NODES = [
  { label: "USDC", angle: -90 },
  { label: "Trading", angle: -30 },
  { label: "Payments", angle: 30 },
  { label: "FX", angle: 90 },
  { label: "Treasury", angle: 150 },
  { label: "Liquidity", angle: 210 },
];

export function EcosystemVisual() {
  const { ref, p } = usePointerParallax(true);
  const radius = 168;

  return (
    <div
      ref={ref}
      className="iso-scene relative mx-auto h-[520px] w-full max-w-[560px] md:h-[580px]"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 560 580"
        fill="none"
        aria-hidden
      >
        {NODES.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = 280 + Math.cos(rad) * radius;
          const y = 280 + Math.sin(rad) * radius;
          return (
            <line
              key={n.label}
              x1="280"
              y1="280"
              x2={x}
              y2={y}
              stroke="#D9D9D5"
              strokeWidth="1"
              strokeDasharray="3 5"
              style={{ animation: "dash-move 8s linear infinite" }}
            />
          );
        })}
      </svg>

      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${-p.y * 5}deg) rotateY(${p.x * 6}deg)`,
        }}
      >
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="float-y-slow" style={{ transformStyle: "preserve-3d" }}>
            <IsoModule size={132} depth={56} tone="blue">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
                Arc
              </span>
            </IsoModule>
            <div className="iso-shadow" />
          </div>
        </div>

        {NODES.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          return (
            <div
              key={n.label}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div
                className="float-y"
                style={{
                  transformStyle: "preserve-3d",
                  animationDelay: `${i * 0.45}s`,
                }}
              >
                <IsoModule size={86} depth={32} tone="paper">
                  <span className="px-1 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-muted">
                    {n.label}
                  </span>
                </IsoModule>
                <div className="iso-shadow" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
