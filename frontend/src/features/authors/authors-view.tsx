"use client";

import Link from "@/i18n/link";
import { useParams } from "next/navigation";
import { WorkCard } from "@/features/works/work-card";
import { useI18n } from "@/i18n/provider";
import { compact } from "@/shared/lib/format";
import { Arrow, Avatar, ButtonLink, Skeleton } from "@/shared/ui/primitives";
import { UliSnake } from "@/shared/ui/uli";
import { useAuthor, useAuthors } from "./api";

export function AuthorsList() {
  const { t, intl } = useI18n();
  const { data: authors, isLoading } = useAuthors();

  return (
    <div className="tone-nzu px-5 pb-28 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto max-w-[90rem]">
        {isLoading || !authors ? (
          <Skeleton className="h-96" />
        ) : (
          <ul className="border-t-4 border-char">
            {authors.map((author) => (
              <li key={author.id} className="border-b-2 border-rule">
                <Link
                  href={`/authors/${author.id}`}
                  className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-x-5 gap-y-1 py-6 transition-colors hover:bg-nzu-deep md:grid-cols-[4.5rem_1fr_10rem_10rem_2rem] md:px-2"
                >
                  <Avatar name={author.name} hue={author.avatarHue} className="size-14 text-lg md:size-[4.5rem] md:text-xl" />
                  <span className="min-w-0">
                    <span className="block text-2xl font-extrabold leading-tight group-hover:text-earth md:text-3xl">{author.name}</span>
                    {author.bio && <span className="mt-1 line-clamp-1 block text-muted">{author.bio}</span>}
                  </span>
                  <span className="hidden font-semibold md:block">{t.authors.works(author.workCount)}</span>
                  <span className="hidden text-muted md:block">{t.authors.reads(compact(author.totalReads, intl))}</span>
                  <Arrow className="size-5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AuthorProfile() {
  const { t, intl } = useI18n();
  const a = t.authors;
  const { id } = useParams<{ id: string }>();
  const { data: author, isLoading, error } = useAuthor(id);

  if (isLoading) {
    return (
      <div className="tone-earth plinth px-5 pb-20 pt-12 md:px-10">
        <Skeleton className="mx-auto h-64 max-w-[90rem]" />
      </div>
    );
  }
  if (error || !author) {
    return (
      <div className="tone-earth plinth flex min-h-[70vh] flex-col justify-center px-5 pb-20 md:px-10">
        <div className="mx-auto w-full max-w-[90rem]">
          <p className="display text-6xl">{a.notFound}</p>
          <ButtonLink href="/authors" variant="light" className="mt-8" arrow>
            {a.all}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="tone-earth plinth px-5 pb-20 pt-12 md:px-10 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-[90rem]">
          <div className="flex flex-wrap items-end gap-6">
            <Avatar name={author.name} hue={author.avatarHue} className="size-20 border-4 border-nzu text-2xl md:size-28 md:text-3xl" />
            <h1 className="display text-[clamp(3rem,8vw,6.5rem)]">{author.name}</h1>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <p className="text-xl leading-relaxed md:col-span-7">{author.bio || a.noBio}</p>
            <p className="font-semibold text-muted md:col-span-4 md:col-start-9 md:text-right">
              {a.works(author.workCount)} · {a.reads(compact(author.totalReads, intl))}
            </p>
          </div>
          <UliSnake className="mt-10 h-6 w-full text-nzu/70" />
        </div>
      </header>
      <div className="tone-nzu px-5 pb-28 pt-14 md:px-10">
        <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 xl:grid-cols-5">
          {author.works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </div>
    </>
  );
}
