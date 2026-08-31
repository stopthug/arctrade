import { cn } from "@/lib/cn";

export function IsoModule({
  size = 132,
  depth = 22,
  tone = "paper",
  className,
  children,
}: {
  size?: number;
  depth?: number;
  tone?: "paper" | "blue";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("iso-module", tone === "blue" && "is-blue", className)}
      style={
        {
          "--iso-size": `${size}px`,
          "--iso-depth": `${depth}px`,
        } as React.CSSProperties
      }
    >
      <div className="iso-face iso-front">{children}</div>
      <div className="iso-face iso-back" />
      <div className="iso-face iso-top" />
      <div className="iso-face iso-bottom" />
      <div className="iso-face iso-left" />
      <div className="iso-face iso-right" />
    </div>
  );
}

export function Glyph({ name }: { name: "search" | "quote" | "bolt" | "eye" | "grid" | "shield" }) {
  const common: React.SVGProps<SVGSVGElement> = {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    "aria-hidden": true,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="12.5" cy="12.5" r="6.5" />
        <path d="M17.2 17.2 22 22" />
      </svg>
    );
  }
  if (name === "quote") {
    return (
      <svg {...common}>
        <path d="M5 20V8h8v8H9" />
        <path d="M15 20V8h8v8h-4" />
      </svg>
    );
  }
  if (name === "bolt") {
    return (
      <svg {...common}>
        <path d="M15 4 7 15h7l-1 9 8-11h-7l1-9Z" />
      </svg>
    );
  }
  if (name === "eye") {
    return (
      <svg {...common}>
        <path d="M3.5 14s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S3.5 14 3.5 14Z" />
        <circle cx="14" cy="14" r="2.6" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M14 4 6 7.5v6.2c0 4.4 3.2 7.6 8 8.8 4.8-1.2 8-4.4 8-8.8V7.5L14 4Z" />
        <path d="m10.5 14 2.4 2.4 4.6-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="5" y="5" width="7" height="7" />
      <rect x="16" y="5" width="7" height="7" />
      <rect x="5" y="16" width="7" height="7" />
      <rect x="16" y="16" width="7" height="7" />
    </svg>
  );
}
