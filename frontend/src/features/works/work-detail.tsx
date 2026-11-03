"use client";

import Link from "@/i18n/link";
import { useParams } from "next/navigation";
import { useSession } from "@/features/auth/api";
import { Comments } from "@/features/engagement/comments";
import { LikeButton } from "@/features/engagement/like-button";
import { ShareBar } from "@/features/engagement/share-bar";
import { useLibrary } from "@/features/library/api";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/shared/lib/api-client";
import { THEME_LABELS, TYPE_LABELS, compact } from "@/shared/lib/format";
import { Cover } from "@/shared/ui/cover";
import { Avatar, ButtonLink, Skeleton, SpeechIcon } from "@/shared/ui/primitives";
import { KindMotif, UliSnake } from "@/shared/ui/uli";
import { useWork } from "./api";

export function WorkDetailView() {
  const { t, locale, intl } = useI18n();
  const d = t.detail;
  const { slug } = useParams<{ slug: string }>();
  const { data: work, isLoading, error } = useWork(slug);
  const { data: session } = useSession();
  const { data: library } = useLibrary();

  if (isLoading) {
    return (
      <div className="tone-earth plinth px-5 pb-20 pt-12 md:px-10">
        <div className="mx-auto grid max-w-[90rem] gap-10 md:grid-cols-12">
          <Skeleton className="aspect-[3/4] md:col-span-4" />
          <div className="space-y-6 md:col-span-7 md:col-start-6">
            <Skeleton className="h-24 w-3/4" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="tone-earth plinth flex min-h-[70vh] flex-col justify-center px-5 pb-20 md:px-10">
        <div className="mx-auto w-full max-w-[90rem]">
          <p className="display text-7xl">{t.common.ewoo}</p>
          <p className="mt-4 text-lg text-muted">{error instanceof ApiError && error.status === 404 ? d.notFound : d.loadError}</p>
          <ButtonLink href="/stories" variant="light" className="mt-8" arrow>
            {d.back}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const progress = library?.reading.find((r) => r.work.id === work.id);
  const resumeAt = progress && progress.chapterIndex < work.chapterCount ? progress.chapterIndex : 0;
  const isAuthor = session?.user?.id === work.author?.id;
  const stats = [
    t.common.minutes(work.minutes),
    `${compact(work.reads, intl)} ${d.reads.toLowerCase()}`,
    `${compact(work.likes, intl)} ${d.likes.toLowerCase()}`,
  ];

  return (
    <article>
      <header className="tone-earth plinth px-5 pb-20 pt-10 md:px-10 md:pb-24 md:pt-14">
        <div className="mx-auto grid max-w-[90rem] gap-10 md:grid-cols-12 md:items-end">
          <div className="max-w-xs border-4 border-char md:col-span-4 md:max-w-none lg:col-span-3">
            <Cover slug={work.slug} title={work.title} author={work.author?.name} theme={work.theme} coverUrl={work.coverUrl} />
          </div>

          <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
            <h1 lang="ig" className="tale text-[clamp(2.75rem,6.5vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.01em]">
              {work.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {work.author && (
                <Link href={`/authors/${work.author.id}`} className="group inline-flex items-center gap-3 font-semibold">
                  <Avatar name={work.author.name} hue={work.author.avatarHue} className="border-2 border-nzu" />
                  <span className="group-hover:underline">{work.author.name}</span>
                </Link>
              )}
              <p className="flex items-center gap-2 text-muted">
                <KindMotif theme={work.theme} className="size-6" strokeWidth={4} />
                {[THEME_LABELS[work.theme][locale], TYPE_LABELS[work.type][locale], ...stats].join(" · ")}
              </p>
            </div>

            <p lang="ig" className="tale mt-8 max-w-2xl text-xl leading-relaxed">
              {work.synopsis}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/read/${work.slug}/${resumeAt + 1}`} variant="light" arrow>
                {progress ? d.continue(resumeAt + 1) : d.read}
              </ButtonLink>
              {isAuthor && (
                <ButtonLink href={`/studio/${work.id}`} variant="outline">
                  {d.edit}
                </ButtonLink>
              )}
              <p className="text-sm text-muted">{d.free}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="tone-nzu px-5 pb-28 pt-14 md:px-10 md:pt-20">
        <div className="mx-auto grid max-w-[90rem] gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {work.type === "long" && (
              <section aria-labelledby="chapters-title" className="mb-16">
                <h2 id="chapters-title" className="text-2xl font-extrabold">
                  {d.chapters}
                </h2>
                <ol className="mt-5 border-t-4 border-char">
                  {work.chapters.map((c) => {
                    const current = progress && c.index === resumeAt;
                    return (
                      <li key={c.index} className="border-b-2 border-rule">
                        <Link
                          href={`/read/${work.slug}/${c.index + 1}`}
                          aria-current={current ? "step" : undefined}
                          className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-4 transition-colors hover:bg-nzu-deep aria-[current=step]:bg-ochre/40 md:px-2"
                        >
                          <span className="text-sm font-bold tabular-nums text-earth">{c.index + 1}</span>
                          <span lang="ig" className="tale text-xl font-semibold group-hover:text-earth md:text-2xl">
                            {c.title}
                          </span>
                          <span className="text-sm text-muted">{t.common.minutes(Math.max(1, Math.round(c.words / 180)))}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            <div id="comments" className="scroll-mt-24">
              <Comments slug={work.slug} workAuthorId={work.author?.id} />
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="space-y-8 border-t-4 border-char pt-6 lg:sticky lg:top-24">
              <div className="flex flex-wrap items-center gap-3">
                <LikeButton slug={work.slug} />
                <a href="#comments" className="inline-flex min-h-12 items-center gap-2 border-2 border-char px-4 font-semibold transition-colors hover:bg-nzu-deep">
                  <SpeechIcon />
                  {d.comment}
                  <span className="tabular-nums text-muted">{work.comments}</span>
                </a>
              </div>
              <ShareBar slug={work.slug} title={work.title} />
              <UliSnake className="h-5 w-full text-earth" />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
