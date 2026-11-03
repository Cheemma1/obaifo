"use client";

import Link from "@/i18n/link";
import { useTaleOfTheDay } from "@/features/works/api";
import { useI18n } from "@/i18n/provider";
import { THEME_LABELS } from "@/shared/lib/format";
import { Arrow, ButtonLink, Skeleton } from "@/shared/ui/primitives";
import { UliMural } from "@/shared/ui/uli";

export function Hero() {
  const { t, locale } = useI18n();
  const h = t.home.hero;
  const { data: today, isLoading } = useTaleOfTheDay();

  return (
    <section className="tone-earth plinth relative overflow-hidden">
      <div className="relative mx-auto grid min-h-[min(calc(100svh-4rem),60rem)] max-w-[90rem] grid-cols-[minmax(0,1fr)] grid-rows-[1fr] px-5 pb-12 pt-10 md:pb-16 lg:pt-0 md:px-10 lg:block lg:pb-20">
        <UliMural className="pointer-events-none hidden lg:absolute lg:block lg:right-[-1%] lg:top-[1%] lg:m-0 lg:h-[76%] lg:w-[66%] lg:max-w-none" />

        <div className="relative flex flex-col justify-end gap-10 lg:min-h-[min(calc(100svh-9rem),55rem)] lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="display text-[clamp(4.25rem,14.5vw,13rem)] leading-[0.82]">Ọbaifo</h1>
            <p className="mt-6 max-w-xl text-[clamp(1.2rem,1.9vw,1.6rem)] font-medium leading-snug">{h.tagline}</p>
            <p className="mt-4 max-w-md leading-relaxed text-muted">{h.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/stories" arrow>
                {h.read}
              </ButtonLink>
              <ButtonLink href="/studio/new" variant="outline">
                {h.share}
              </ButtonLink>
            </div>
          </div>

          <div className="tone-nzu w-full shrink-0 border-4 border-char p-6 lg:w-[24rem]">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : today ? (
              <>
                <Link href={`/stories/${today.slug}`} className="block hover:text-earth">
                  <h2 lang="ig" className="tale text-3xl font-semibold leading-tight">
                    {today.title}
                  </h2>
                </Link>
                <p className="mt-2 text-sm text-muted">
                  {THEME_LABELS[today.theme][locale]} · {today.author?.name} · {t.common.minutes(today.minutes)}
                </p>
                {today.synopsis && (
                  <p lang="ig" className="tale mt-4 line-clamp-3 leading-relaxed">
                    {today.synopsis}
                  </p>
                )}
                <Link
                  href={`/read/${today.slug}/1`}
                  className="group mt-5 flex min-h-12 items-center justify-between bg-earth px-5 font-semibold text-nzu transition-colors hover:bg-ochre hover:text-char"
                >
                  {h.today}
                  <Arrow />
                </Link>
              </>
            ) : (
              <ButtonLink href="/stories" className="w-full" arrow>
                {h.read}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
