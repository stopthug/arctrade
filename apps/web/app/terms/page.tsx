import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the ArcTrade marketing site and Telegram trading bot.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout kicker="Legal" title="Terms of use.">
      <p>
        ArcTrade is a Telegram-native trading interface for the Arc ecosystem. These
        terms apply to this website and to use of the ArcTrade bot at
        t.me/arc_mainnate_trading_bot.
      </p>
      <p>
        Trading digital assets involves risk of loss. Quotes, balances and
        confirmations shown in marketing materials are illustrative unless they
        appear inside your live Telegram session. Nothing on this site is an
        offer, solicitation, or financial, legal or tax advice.
      </p>
      <p>
        ArcTrade charges a 0.5% service fee on executed trades. Network and
        liquidity costs may apply separately and are displayed before confirmation
        where the interface provides them. Fees can vary with the transaction and
        available liquidity.
      </p>
      <p>
        ArcTrade is an independent application. It is not affiliated with or
        endorsed by Circle or the Arc network operators unless that relationship
        is stated explicitly.
      </p>
      <p>
        You are responsible for the wallet you connect, the addresses you paste,
        and the transactions you confirm. Blockchain transactions can be
        irreversible.
      </p>
      <p>
        This page is a summary of how ArcTrade is offered. It is not a complete
        legal agreement. If a separately published policy applies to the bot, that
        policy controls in case of conflict.
      </p>
    </LegalLayout>
  );
}
