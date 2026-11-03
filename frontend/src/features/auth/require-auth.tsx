"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/i18n/provider";
import { ButtonLink, Skeleton } from "@/shared/ui/primitives";
import type { User } from "@/shared/types";
import { useSession } from "./api";

/** Renders children with the signed-in user, or an inline sign-in prompt. */
export function RequireAuth({ next, children }: { next: string; children: (user: User) => ReactNode }) {
  const { t } = useI18n();
  const { data: session, isLoading } = useSession();

  if (isLoading) return <Skeleton className="mx-5 my-12 h-64 md:mx-10" />;

  if (!session?.user) {
    return (
      <div className="tone-nzu px-5 py-20 md:px-10">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start gap-6 border-t-4 border-char pt-8">
        <p className="max-w-xl text-3xl font-extrabold leading-tight">{t.auth.required}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/login?next=${encodeURIComponent(next)}`} arrow>
            {t.nav.signIn}
          </ButtonLink>
          <ButtonLink href={`/register?next=${encodeURIComponent(next)}`} variant="outline">
            {t.nav.createAccount}
          </ButtonLink>
        </div>
        </div>
      </div>
    );
  }

  return <>{children(session.user)}</>;
}
