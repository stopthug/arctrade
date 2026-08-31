import { ArcExplainer } from "@/components/marketing/arc-explainer";
import { ArcNetwork } from "@/components/marketing/arc-network";
import { BuyWalkthrough } from "@/components/marketing/buy-walkthrough";
import { Ecosystem } from "@/components/marketing/ecosystem";
import { Features } from "@/components/marketing/features";
import { Fees } from "@/components/marketing/fees";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { HowToTrade } from "@/components/marketing/how-to-trade";
import { Mainnet } from "@/components/marketing/mainnet";
import { MarketChart } from "@/components/marketing/market-chart";
import { Product } from "@/components/marketing/product";
import { Security } from "@/components/marketing/security";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { Stats } from "@/components/marketing/stats";
import { MarketingRoot } from "@/components/marketing/root";
import { PRODUCT_PATH } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArcTrade — Trade Arc Directly From Telegram",
  robots: { index: false, follow: false },
  alternates: { canonical: PRODUCT_PATH },
};

export default function ProductLandingPage() {
  return (
    <MarketingRoot>
      <SiteNav />
      <main id="main">
        <Hero />
        <Stats />
        <Product />
        <HowItWorks />
        <Features />
        <Fees />
        <ArcNetwork />
        <Mainnet />
        <ArcExplainer />
        <Ecosystem />
        <HowToTrade />
        <BuyWalkthrough />
        <MarketChart />
        <Security />
        <FinalCta />
      </main>
      <SiteFooter />
    </MarketingRoot>
  );
}
