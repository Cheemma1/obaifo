"use client";

import { useI18n } from "@/i18n/provider";
import { ButtonLink } from "@/shared/ui/primitives";
import { UliSnake } from "@/shared/ui/uli";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="tone-earth plinth flex min-h-[calc(100svh-4rem)] flex-col justify-center px-5 pb-24 md:px-10">
      <div className="mx-auto w-full max-w-[90rem]">
        <p className="display text-[clamp(6rem,22vw,16rem)] leading-[0.8]">
          404
        </p>
        <UliSnake className="my-8 h-6 w-full max-w-md text-nzu/70" />
        <h1 className="text-3xl font-extrabold md:text-4xl">
          {t.notFound.title}
        </h1>
        <p className="mt-2 text-lg text-muted">{t.notFound.body}</p>
        <ButtonLink href="/stories" variant="light" className="mt-10" arrow>
          {t.notFound.cta}
        </ButtonLink>
      </div>
    </main>
  );
}
