"use client";

import Link from "@/i18n/link";
import { useI18n } from "@/i18n/provider";
import { THEME_LABELS, TYPE_LABELS, compact, longDate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { Cover } from "@/shared/ui/cover";
import { ButtonLink, Skeleton } from "@/shared/ui/primitives";
import { useStudioWorks } from "./api";
import { StudioGate } from "./studio-gate";

function Dashboard({ name }: { name: string }) {
  const { t, locale, intl } = useI18n();
  const d = t.studio.dashboard;
  const { data: works, isLoading } = useStudioWorks(true);

  const published = works?.filter((w) => w.status === "published") ?? [];
  const stats = [
    { label: d.works, value: works?.length ?? 0 },
    { label: d.published, value: published.length },
    { label: d.reads, value: compact(published.reduce((n, w) => n + w.reads, 0), intl) },
  ];

  return (
    <div className="tone-nzu px-5 pb-28 pt-10 md:px-10">
      <div className="mx-auto max-w-[90rem]">
      <div className="flex flex-wrap items-center justify-between gap-6 pb-8">
        <p className="text-3xl font-extrabold">{d.hello(name.split(" ")[0]!)}</p>
        <ButtonLink href="/studio/new" arrow>
          {d.newWork}
        </ButtonLink>
      </div>

      <dl className="grid grid-cols-3 border-y-4 border-char">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse border-r-2 border-rule px-4 py-6 first:pl-0 last:border-r-0 md:py-8">
            <dt className="mt-1 font-semibold text-muted">{s.label}</dt>
            <dd className="text-4xl font-extrabold tabular-nums md:text-5xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      {isLoading ? (
        <Skeleton className="mt-10 h-64" />
      ) : works && works.length > 0 ? (
        <ul className="mt-2">
          {works.map((work) => (
              <li key={work.id} className="border-b-2 border-rule">
                <Link href={`/studio/${work.id}`} className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-5 py-5 transition-colors hover:bg-nzu-deep md:grid-cols-[4rem_1fr_8rem_8rem_6rem] md:px-2">
                  <div className="border-2 border-char"><Cover slug={work.slug} title={work.title} theme={work.theme} coverUrl={work.coverUrl} showText={false} /></div>
                  <div>
                    <p lang="ig" className="tale text-2xl font-semibold leading-tight group-hover:text-earth">{work.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {TYPE_LABELS[work.type][locale]} · {THEME_LABELS[work.theme][locale]} · {t.common.chapters(work.chapterCount)} · {d.edited(longDate(work.updatedAt, intl))}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "justify-self-end px-2.5 py-1 text-sm font-bold md:justify-self-start",
                      work.status === "published" ? "bg-char text-nzu" : "border-2 border-dashed border-char/60",
                    )}
                  >
                    {work.status === "published" ? d.publishedBadge : d.draftBadge}
                  </span>
                  <span className="hidden text-sm text-muted md:block">{d.readsCount(compact(work.reads, intl))}</span>
                  <span className="hidden text-right font-semibold md:block">
                    <span className="group-hover:underline">{d.edit}</span>
                  </span>
                </Link>
              </li>
          ))}
        </ul>
      ) : (
        <div className="py-20">
          <p className="text-3xl font-extrabold">{d.emptyTitle}</p>
          <p className="mt-3 max-w-xl text-lg text-muted">{d.emptyBody}</p>
        </div>
      )}
      </div>
    </div>
  );
}

export function StudioDashboard() {
  return <StudioGate next="/studio">{(user) => <Dashboard name={user.name} />}</StudioGate>;
}
