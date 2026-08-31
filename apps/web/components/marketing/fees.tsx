import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";

export function Fees() {
  return (
    <section id="fees">
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-16 md:col-span-6 md:px-8 lg:col-span-6 lg:border-b-0 lg:border-r lg:py-24">
            <Reveal>
              <TechLabel tone="blue">Simple fees</TechLabel>
              <h2 className="display mt-5 text-[40px] md:text-[56px] lg:text-[64px]">
                One trade.
                <br />
                One clear fee.
              </h2>
              <p className="display mt-10 text-[88px] leading-none text-arcblue md:text-[128px]">
                0.5%
              </p>
              <p className="mt-8 max-w-[44ch] text-base leading-relaxed text-muted">
                ArcTrade charges a simple 0.5% service fee per executed trade.
              </p>
              <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-muted">
                Network / liquidity costs may apply separately depending on the
                transaction and execution route.
              </p>
            </Reveal>
          </div>

          <div className="col-span-4 px-5 py-16 md:col-span-6 md:px-8 lg:col-span-6 lg:py-24">
            <Reveal delay={0.1}>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
                Example · $100 trade
              </p>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                <Row k="Trade amount" v="$100" />
                <Row k="ArcTrade fee" v="$0.50" accent />
                <Row k="Network / execution costs" v="Displayed before confirmation" />
                <Row k="Total" v="Clearly displayed before execution" last />
              </dl>
              <p className="mt-8 max-w-[48ch] text-[12px] leading-relaxed text-muted">
                Fees and execution costs are shown before confirmation and may vary
                based on the transaction and available liquidity.
              </p>
            </Reveal>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Row({
  k,
  v,
  accent,
  last,
}: {
  k: string;
  v: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="text-sm text-muted">{k}</dt>
      <dd className={accent || last ? "text-lg font-medium tracking-tight" : "text-sm"}>
        {v}
      </dd>
    </div>
  );
}
