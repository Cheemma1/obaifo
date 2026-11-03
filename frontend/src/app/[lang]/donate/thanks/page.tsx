import { Suspense } from "react";
import { DonationThanks } from "@/features/donations/donation-thanks";
import { metaT } from "@/i18n/server";

export const metadata = { title: metaT.donate.thanks.metaTitle };

export default function DonationThanksPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <DonationThanks />
    </Suspense>
  );
}
