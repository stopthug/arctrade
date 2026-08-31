import { MAINNET_ISO } from "@/lib/constants";
import { Reveal, TechLabel } from "@/components/marketing/ui";

function daysUntilMainnet() {
  const target = Date.UTC(2026, 8, 16);
  return Math.ceil((target - Date.now()) / 86_400_000);
}

export function Mainnet() {
  const days = daysUntilMainnet();

  return (
    <section id="mainnet" className="bg-navy text-white">
      <div className="shell border-white/10">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          <div className="col-span-4 border-b border-white/10 px-5 py-16 md:col-span-6 md:px-8 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-24">
            <Reveal>
              <TechLabel tone="white">Arc mainnet</TechLabel>
              <h2 className="display mt-5 text-[40px] md:text-[56px] lg:text-[68px]">
                The next financial
                <br />
                rails are coming.
              </h2>
              <p className="mt-8 max-w-[48ch] text-base leading-relaxed text-white/65">
                Arc public mainnet is scheduled for September 16, 2026. Arc is
                being built as a stablecoin-native Layer-1 focused on real-time
                financial activity, programmable money and internet-native
                economic applications.
              </p>
              {days > 0 ? (
                <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-white/50">
                  {days} days to public mainnet
                </p>
              ) : null}
            </Reveal>
          </div>
          <div className="relative col-span-4 flex flex-col justify-end px-5 py-16 md:col-span-6 md:px-8 lg:col-span-5 lg:py-24">
            <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 hatch opacity-30" />
            <Reveal delay={0.1}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Mainnet</p>
              <p className="display mt-3 text-[72px] md:text-[96px] lg:text-[112px]">
                09.16.26
              </p>
              <p className="mt-4 text-sm text-white/50">Scheduled · not live yet</p>
              <time dateTime={MAINNET_ISO} className="sr-only">
                September 16, 2026
              </time>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
