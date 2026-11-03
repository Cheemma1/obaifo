"use client";

import Link from "@/i18n/link";
import { useI18n } from "@/i18n/provider";
import { THEME_LABELS, TYPE_LABELS } from "@/shared/lib/format";
import { Cover } from "@/shared/ui/cover";
import { HeartIcon, SpeechIcon } from "@/shared/ui/primitives";
import type { WorkSummary } from "@/shared/types";

export function WorkCard({ work, footer }: { work: WorkSummary; footer?: React.ReactNode }) {
  const { t, locale } = useI18n();
  return (
    <article className="group">
      <Link href={`/stories/${work.slug}`} className="block">
        <div className="border-4 border-char transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-1">
          <Cover slug={work.slug} title={work.title} author={work.author?.name} theme={work.theme} coverUrl={work.coverUrl} />
        </div>
        <h3 lang="ig" className="tale mt-4 text-xl font-semibold leading-tight group-hover:text-earth md:text-2xl">
          {work.title}
        </h3>
      </Link>
      <p className="mt-1 text-sm text-muted">
        {THEME_LABELS[work.theme][locale]} · {TYPE_LABELS[work.type][locale]}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3 text-sm">
        {work.author ? (
          <Link href={`/authors/${work.author.id}`} className="link truncate font-medium">
            {work.author.name}
          </Link>
        ) : (
          <span />
        )}
        <span className="flex shrink-0 gap-3 tabular-nums text-muted">
          <span className="inline-flex items-center gap-1" aria-label={t.card.likes(work.likes)}>
            <HeartIcon className="size-3.5" />
            {work.likes}
          </span>
          <span className="inline-flex items-center gap-1" aria-label={t.card.comments(work.comments)}>
            <SpeechIcon className="size-3.5" />
            {work.comments}
          </span>
        </span>
      </div>
      {footer}
    </article>
  );
}
