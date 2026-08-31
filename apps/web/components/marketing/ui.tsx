"use client";

import { useReducedMotion, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { easeOut } from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0 : 0.75, delay: reduce ? 0 : delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function TechLabel({
  children,
  tone = "ink",
}: {
  children: React.ReactNode;
  tone?: "ink" | "blue" | "white" | "muted";
}) {
  const color =
    tone === "blue"
      ? "text-arcblue"
      : tone === "white"
        ? "text-white/80"
        : tone === "muted"
          ? "text-muted"
          : "text-ink";

  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-medium uppercase tracking-[0.18em]",
        color,
      )}
    >
      [ {children} ]
    </span>
  );
}

export function Shell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("shell", className)}>{children}</div>;
}

export function Rule({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}
