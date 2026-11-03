"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useErrorText } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import { naira } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/primitives";
import { UliMark } from "@/shared/ui/uli";
import { useVerifyDonation } from "./api";

export function DonationThanks() {
  const { t } = useI18n();
  const th = t.donate.thanks;
  const errorText = useErrorText();
  const reference = useSearchParams().get("reference");
  const verify = useVerifyDonation();
  const sent = useRef(false);

  useEffect(() => {
    if (reference && !sent.current) {
      sent.current = true;
      verify.mutate(reference);
    }
  }, [reference, verify]);

  return (
    <main className="tone-earth plinth flex min-h-[calc(100svh-4rem)] flex-col items-start justify-center px-5 pb-24 md:px-10">
      <UliMark className="size-14 text-nzu" />
      {!reference ? (
        <p className="display mt-10 text-5xl">{th.noReference}</p>
      ) : verify.isPending || verify.isIdle ? (
        <p className="display mt-10 text-5xl" role="status">{th.confirming}</p>
      ) : verify.isError ? (
        <>
          <p className="display mt-10 text-6xl">{t.common.ewoo}</p>
          <p className="mt-4 text-lg text-muted">{errorText(verify.error)}</p>
          <ButtonLink href="/donate" variant="light" className="mt-8" arrow>
            {t.common.tryAgain}
          </ButtonLink>
        </>
      ) : (
        <div>
          <p className="display mt-10 text-[clamp(3.5rem,10vw,7rem)]">
            {th.title(verify.data.name.split(" ")[0] ?? "")}
          </p>
          <p className="mt-6 max-w-md text-xl leading-relaxed text-muted">
            {th.body(naira(verify.data.amountKobo))}
          </p>
          <ButtonLink href="/stories" variant="light" className="mt-10" arrow>
            {th.back}
          </ButtonLink>
        </div>
      )}
    </main>
  );
}
