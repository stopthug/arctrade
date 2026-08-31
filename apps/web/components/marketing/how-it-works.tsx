import { ProcessVisual } from "@/components/marketing/process-visual";
import { Reveal, Rule, Shell, TechLabel } from "@/components/marketing/ui";

export function HowItWorks() {
  return (
    <section id="how-it-works">
      <Shell>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-line px-5 py-14 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-16">
            <Reveal>
              <TechLabel tone="blue">How trading works</TechLabel>
              <h2 className="display mt-5 text-[36px] md:text-[52px] lg:text-[60px]">
                Five steps
                <br />
                from find
                <br />
                to track.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-4 flex items-end px-5 py-14 md:col-span-6 md:px-8 lg:col-span-5 lg:py-16">
            <Reveal delay={0.08}>
              <p className="max-w-[40ch] text-base leading-relaxed text-muted">
                Each trade moves through a clear sequence. Select a step to see
                where it sits in the execution stack.
              </p>
            </Reveal>
          </div>
        </div>
        <Rule />
        <ProcessVisual />
      </Shell>
    </section>
  );
}
