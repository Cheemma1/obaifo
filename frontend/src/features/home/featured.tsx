"use client";

import Link from "@/i18n/link";
import { useWorks } from "@/features/works/api";
import { useI18n } from "@/i18n/provider";
import { THEME_LABELS, TYPE_LABELS } from "@/shared/lib/format";
import { Rich } from "@/shared/ui/rich";
import { Cover } from "@/shared/ui/cover";
import { ButtonLink, Skeleton } from "@/shared/ui/primitives";

/** One featured tale shown large, the rest of the featured set as a list beside it. */
export function Featured() {
  const { t, locale } = useI18n();
  const f = t.home.featured;
  const { data: works, isLoading } = useWorks({ featured: true, sort: "popular", limit: 7 });
  const [lead, ...rest] = works ?? [];

  return (
    <section className="tone-nzu border-t-4 border-char px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display text-[clamp(2.5rem,5.5vw,4.5rem)]">
            <Rich parts={f.title} />
          </h2>
          <Link href="/stories" className="link text-lg font-semibold">
            {f.seeAll}
          </Link>
        </div>

        {isLoading || !lead ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <Skeleton className="aspect-[3/4] lg:col-span-4" />
            <Skeleton className="h-80 lg:col-span-8" />
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
            <article className="grid gap-8 sm:grid-cols-[minmax(0,15rem)_1fr] lg:col-span-7 lg:grid-cols-[minmax(0,17rem)_1fr]">
              <Link href={`/stories/${lead.slug}`} className="block self-start border-4 border-char" tabIndex={-1} aria-hidden>
                <Cover slug={lead.slug} title={lead.title} author={lead.author?.name} theme={lead.theme} coverUrl={lead.coverUrl} />
              </Link>
              <div className="flex flex-col">
                <h3 lang="ig" className="tale text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.05]">
                  <Link href={`/stories/${lead.slug}`} className="hover:text-earth">
                    {lead.title}
                  </Link>
                </h3>
                <p className="mt-2 text-muted">
                  {lead.author?.name} · {THEME_LABELS[lead.theme][locale]} · {TYPE_LABELS[lead.type][locale]} · {t.common.minutes(lead.minutes)}
                </p>
                <p lang="ig" className="tale mt-5 text-lg leading-relaxed">
                  {lead.synopsis}
                </p>
                <div className="mt-auto pt-8">
                  <ButtonLink href={`/read/${lead.slug}/1`} arrow>
                    {t.detail.read}
                  </ButtonLink>
                </div>
              </div>
            </article>

            <ol className="border-t-2 border-char lg:col-span-5">
              {rest.map((work) => (
                <li key={work.id} className="border-b-2 border-rule">
                  <Link href={`/stories/${work.slug}`} className="group grid grid-cols-[3.25rem_1fr] items-center gap-4 py-4">
                    <Cover slug={work.slug} title={work.title} theme={work.theme} coverUrl={work.coverUrl} showText={false} />
                    <span className="min-w-0">
                      <span lang="ig" className="tale block truncate text-xl font-semibold group-hover:text-earth">
                        {work.title}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {work.author?.name} · {THEME_LABELS[work.theme][locale]}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
