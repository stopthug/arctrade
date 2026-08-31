import { EcosystemVisual } from "@/components/marketing/ecosystem-visual";
import { Reveal, Rule, Shell, TechLabel } from "@/components/marketing/ui";

export function Ecosystem() {
  return (
    <section>
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-16">
            <Reveal>
              <TechLabel tone="blue">Arc infrastructure</TechLabel>
              <h2 className="display mt-5 text-[36px] md:text-[52px]">
                A network built
                <br />
                for financial activity.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-4 flex items-end px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:py-16">
            <Reveal delay={0.08}>
              <p className="max-w-[40ch] text-base leading-relaxed text-muted">
                ArcTrade sits on Arc as a trading interface — not the network
                itself. The stack below is how the ecosystem is structured.
              </p>
            </Reveal>
          </div>
        </div>
        <Rule />
        <div className="px-4 py-12 md:py-16">
          <EcosystemVisual />
        </div>
      </Shell>
    </section>
  );
}
