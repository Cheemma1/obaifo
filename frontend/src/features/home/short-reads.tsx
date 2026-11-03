"use client";

import Link from "@/i18n/link";
import { useWorks } from "@/features/works/api";
import { useI18n } from "@/i18n/provider";
import { THEME_LABELS } from "@/shared/lib/format";
import { Rich } from "@/shared/ui/rich";
import { Skeleton } from "@/shared/ui/primitives";
import { KindMotif } from "@/shared/ui/uli";

/** Short tales on an earth band: a plain list, each row a tale you can finish in minutes. */
export function ShortReads() {
  const { t, locale } = useI18n();
  const s = t.home.short;
  const { data: works, isLoading } = useWorks({ type: "short", limit: 6 });

  return (
    <section className="tone-earth plinth px-5 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
      <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="display text-[clamp(2.5rem,5.5vw,4.5rem)]">
            <Rich parts={s.title} />
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted">{s.body}</p>
          <Link href="/stories?type=short" className="link mt-8 inline-block text-lg font-semibold">
            {s.all}
          </Link>
        </div>

        <ul className="border-t-2 border-nzu lg:col-span-8">
          {isLoading || !works
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="border-b-2 border-rule py-6">
                  <Skeleton className="h-8 w-2/3" />
                </li>
              ))
            : works.map((work) => (
                <li key={work.id} className="border-b-2 border-rule">
                  <Link
                    href={`/read/${work.slug}/1`}
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 py-5 transition-colors hover:bg-earth-deep md:px-3"
                  >
                    <KindMotif theme={work.theme} className="size-9 text-nzu/80 group-hover:text-ochre" />
                    <span className="min-w-0">
                      <span lang="ig" className="tale block text-[clamp(1.35rem,2.4vw,2rem)] font-semibold leading-tight">
                        {work.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        {work.author?.name} · {THEME_LABELS[work.theme][locale]}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{t.common.minutes(work.minutes)}</span>
                  </Link>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
