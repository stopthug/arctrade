import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the ArcTrade marketing site and Telegram bot handle information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout kicker="Legal" title="Privacy.">
      <p>
        If you join the waitlist, we store the email address you submit so we can
        contact you about ArcTrade. That list is kept in a spreadsheet used for
        this product. You can ask to be removed by contacting us through the same
        channel you used to reach ArcTrade.
      </p>
      <p>
        Standard server logs (such as IP address, user agent and requested path)
        may be recorded by the host that serves this site. We do not use that
        information to build a trading profile.
      </p>
      <p>
        The ArcTrade Telegram bot processes messages you send in Telegram in order
        to provide quoting, execution and portfolio features. Telegram also
        processes those messages under Telegram’s own terms. Do not send secrets
        that the product does not require.
      </p>
      <p>
        Onchain activity you confirm is public on the Arc network according to how
        that network operates.
      </p>
      <p>
        This page describes the marketing site and the intended bot surface. It is
        not a substitute for a jurisdiction-specific privacy notice if one is
        published separately.
      </p>
    </LegalLayout>
  );
}
