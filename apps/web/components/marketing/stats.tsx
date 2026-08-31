import { Reveal, Shell } from "@/components/marketing/ui";

const STATS = [
  { n: "01", label: "Telegram native" },
  { n: "02", label: "Arc" },
  { n: "03", label: "USDC" },
  { n: "04", label: "0.5% fee" },
];

export function Stats() {
  return (
    <section aria-label="Product attributes">
      <Shell>
        <div className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 0.06}
              className="border-line px-5 py-8 md:px-8 [&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{s.n}</p>
              <p className="mt-3 text-xl font-medium tracking-tight md:text-2xl">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}
