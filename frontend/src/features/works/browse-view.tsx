"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";
import Link from "@/i18n/link";
import { THEME_LABELS, TYPE_LABELS } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { Cover } from "@/shared/ui/cover";
import { HeartIcon, Skeleton, SpeechIcon } from "@/shared/ui/primitives";
import { KindMotif } from "@/shared/ui/uli";
import { THEMES, type Theme, type WorkType } from "@/shared/types";
import { useWorks } from "./api";
import { WorkCard } from "./work-card";

const chip =
  "inline-flex min-h-10 shrink-0 items-center gap-2 border-2 px-3.5 text-sm font-semibold transition-colors";

/** Filters live in the URL so results are shareable and survive back/forward. */
export function BrowseView() {
  const { t, locale } = useI18n();
  const b = t.browse;
  const types: { value: WorkType | ""; label: string }[] = [
    { value: "", label: b.all },
    { value: "short", label: b.short },
    { value: "long", label: b.long },
  ];
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const type = (params.get("type") as WorkType | null) ?? undefined;
  const theme = (params.get("theme") as Theme | null) ?? undefined;
  const sort = params.get("sort") === "popular" ? "popular" : "new";
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (search !== q) setParam("q", search.trim() || undefined);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { data: works, isLoading, isFetching } = useWorks({ type, theme, sort, q: q || undefined, limit: 60 });

  return (
    <div className="tone-nzu px-5 pb-28 md:px-10">
      <div className="mx-auto max-w-[90rem]">
        <div className="border-b-4 border-char py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex w-full max-w-2xl items-center gap-3 border-2 border-char bg-nzu px-4 focus-within:bg-white/60">
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" aria-hidden>
                <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.2" />
                <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              <span className="sr-only">{b.search}</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={b.placeholder}
                className="min-h-14 w-full bg-transparent text-xl font-medium outline-none placeholder:text-char-soft/70"
              />
              {isFetching && <span className="size-2.5 shrink-0 animate-pulse bg-earth" aria-hidden />}
            </label>

            <div className="flex items-center gap-4">
              <div className="flex border-2 border-char" role="group" aria-label={b.all}>
                {types.map((ty) => {
                  const active = (type ?? "") === ty.value;
                  return (
                    <button
                      key={ty.value || "all"}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setParam("type", ty.value || undefined)}
                      className={cn("min-h-11 px-4 text-sm font-semibold transition-colors", active ? "bg-char text-nzu" : "hover:bg-nzu-deep")}
                    >
                      {ty.label}
                    </button>
                  );
                })}
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <span className="sr-only sm:not-sr-only">{b.sort}</span>
                <select
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value === "new" ? undefined : e.target.value)}
                  className="min-h-11 cursor-pointer border-2 border-char bg-nzu px-3 font-semibold outline-none"
                >
                  <option value="new">{b.newest}</option>
                  <option value="popular">{b.popular}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="no-scrollbar -mx-5 mt-5 flex items-center gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
            <button
              type="button"
              aria-pressed={!theme}
              onClick={() => setParam("theme")}
              className={cn(chip, !theme ? "border-char bg-char text-nzu" : "border-char/30 hover:border-char")}
            >
              {b.allThemes}
            </button>
            {THEMES.map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={theme === g}
                onClick={() => setParam("theme", theme === g ? undefined : g)}
                className={cn(chip, theme === g ? "border-char bg-ochre text-char" : "border-char/30 hover:border-char")}
              >
                <KindMotif theme={g} className="size-5" strokeWidth={4} />
                {THEME_LABELS[g][locale]}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm font-semibold text-muted" role="status">
          {works ? b.results(works.length) : t.common.loading}
        </p>

        {isLoading ? (
          <div className="mt-6 grid gap-10 lg:grid-cols-12">
            <Skeleton className="aspect-[3/4] lg:col-span-3" />
            <Skeleton className="h-96 lg:col-span-9" />
          </div>
        ) : works && works.length > 0 ? (
          // The first result is set large on the wall; the rest run as rows you can scan.
          <div className="mt-6 grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="max-w-xs lg:col-span-3 lg:max-w-none">
              <WorkCard work={works[0]!} />
            </div>
            <ol className="border-t-4 border-char lg:col-span-9">
              {works.slice(1).map((work) => (
                <li key={work.id} className="border-b-2 border-rule">
                  <Link
                    href={`/stories/${work.slug}`}
                    className="group grid grid-cols-[3.5rem_1fr] items-center gap-x-5 gap-y-1 py-4 transition-colors hover:bg-nzu-deep md:grid-cols-[4rem_1fr_11rem_6rem] md:px-2"
                  >
                    <span className="border-2 border-char">
                      <Cover slug={work.slug} title={work.title} theme={work.theme} coverUrl={work.coverUrl} showText={false} />
                    </span>
                    <span className="min-w-0">
                      <span lang="ig" className="tale block text-xl font-semibold leading-tight group-hover:text-earth md:text-2xl">
                        {work.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                        <KindMotif theme={work.theme} className="size-4 shrink-0" strokeWidth={5} />
                        <span className="truncate">
                          {THEME_LABELS[work.theme][locale]} · {TYPE_LABELS[work.type][locale]} · {t.common.minutes(work.minutes)}
                        </span>
                      </span>
                    </span>
                    <span className="col-start-2 truncate text-sm font-medium md:col-start-auto">{work.author?.name}</span>
                    <span className="col-start-2 flex gap-3 text-sm tabular-nums text-muted md:col-start-auto md:justify-end">
                      <span className="inline-flex items-center gap-1" aria-label={t.card.likes(work.likes)}>
                        <HeartIcon className="size-3.5" />
                        {work.likes}
                      </span>
                      <span className="inline-flex items-center gap-1" aria-label={t.card.comments(work.comments)}>
                        <SpeechIcon className="size-3.5" />
                        {work.comments}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="py-24">
            <p className="display text-5xl">{b.emptyTitle}</p>
            <p className="mt-3 text-lg text-muted">{b.emptyBody}</p>
          </div>
        )}
      </div>
    </div>
  );
}
