import { ARC_URL } from "@/lib/constants";
import { Button } from "@/components/marketing/button";
import { Reveal, Shell, TechLabel } from "@/components/marketing/ui";

export function ArcNetwork() {
  return (
    <section id="arc">
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-16 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-20">
            <Reveal>
              <TechLabel tone="blue">The network</TechLabel>
              <h2 className="display mt-5 text-[40px] md:text-[56px] lg:text-[68px]">
                Built on Arc.
                <br />
                The Economic OS
                <br />
                for the internet.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-4 flex flex-col justify-end px-5 py-16 md:col-span-6 md:px-8 lg:col-span-5 lg:py-20">
            <Reveal delay={0.08}>
              <p className="max-w-[44ch] text-base leading-relaxed text-muted">
                Arc is an EVM-compatible Layer-1 blockchain designed for real-world
                financial activity, including stablecoin payments, trading, FX,
                treasury operations and other programmable financial applications.
              </p>
              <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-muted">
                Arc is designed around predictable stablecoin-denominated
                transaction costs and deterministic settlement.
              </p>
              <div className="mt-8">
                <Button href={ARC_URL} variant="secondary">
                  Learn more about Arc
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Shell>
    </section>
  );
}
