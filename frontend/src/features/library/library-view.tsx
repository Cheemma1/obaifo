"use client";

import Link from "@/i18n/link";
import { RequireAuth } from "@/features/auth/require-auth";
import { useI18n } from "@/i18n/provider";
import { ButtonLink, Skeleton } from "@/shared/ui/primitives";
import { Cover } from "@/shared/ui/cover";
import { useLibrary } from "./api";

function Shelf() {
  const { t } = useI18n();
  const l = t.library;
  const { data, isLoading } = useLibrary();

  return (
    <div className="tone-nzu px-5 pb-28 pt-12 md:px-10 md:pt-16">
      <section className="mx-auto max-w-[90rem]">
        <h2 className="text-2xl font-extrabold">{l.continue}</h2>
        {isLoading || !data ? (
          <Skeleton className="mt-6 h-72" />
        ) : data.reading.length === 0 ? (
          <div className="mt-6 max-w-xl border-t-4 border-char pt-8">
            <p className="text-2xl font-semibold leading-snug">{l.empty}</p>
            <ButtonLink href="/stories" className="mt-8" arrow>
              {l.find}
            </ButtonLink>
          </div>
        ) : (
          <ul className="mt-6 border-t-4 border-char">
            {data.reading.map((entry) => (
              <li key={entry.work.id} className="border-b-2 border-rule">
                <Link
                  href={`/read/${entry.work.slug}/${entry.chapterIndex + 1}`}
                  className="group grid grid-cols-[4rem_1fr] items-center gap-x-5 gap-y-3 py-5 transition-colors hover:bg-nzu-deep md:grid-cols-[4.5rem_1fr_18rem] md:px-2"
                >
                  <div className="border-2 border-char">
                    <Cover slug={entry.work.slug} title={entry.work.title} theme={entry.work.theme} coverUrl={entry.work.coverUrl} showText={false} />
                  </div>
                  <div className="min-w-0">
                    <p lang="ig" className="tale truncate text-2xl font-semibold group-hover:text-earth md:text-3xl">
                      {entry.work.title}
                    </p>
                    <p className="mt-1 text-muted">
                      {entry.work.author?.name} · {l.position(entry.chapterIndex + 1, entry.work.chapterCount)}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 md:col-span-1">
                    <div className="h-2 flex-1 bg-nzu-deep" role="progressbar" aria-valuenow={entry.percent} aria-valuemin={0} aria-valuemax={100} aria-label={entry.work.title}>
                      <div className="h-full bg-earth" style={{ width: `${entry.percent}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-bold tabular-nums">{entry.percent}%</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function LibraryView() {
  return <RequireAuth next="/library">{() => <Shelf />}</RequireAuth>;
}
