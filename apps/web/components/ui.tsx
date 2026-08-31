import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@arctrade/ui";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "buy" | "sell" }) {
  const styles = {
    primary: "bg-gold text-ink-950 hover:bg-[#d4b88a]",
    ghost: "border border-ink-700 text-paper hover:bg-ink-800",
    buy: "bg-bid text-ink-950 hover:opacity-90",
    sell: "bg-ask text-paper hover:opacity-90",
  } as const;
  return (
    <button
      className={cn("px-4 py-2 text-sm font-medium rounded-sm transition-colors", styles[variant], className)}
      {...props}
    />
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("border border-ink-700 bg-ink-900 p-4", className)}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-[11px] uppercase tracking-widest text-mute">{label}</p>
      <p className="mt-2 font-mono text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
    </Card>
  );
}
