"use client";

import { motion, useScroll, useSpring } from "motion/react";
import Link from "@/i18n/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useSession } from "@/features/auth/api";
import { useSaveProgress } from "@/features/library/api";
import { useWork, useChapter } from "@/features/works/api";
import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/i18n/provider";
import { EngagementPanel } from "@/features/engagement/engagement-panel";
import { Arrow, ButtonLink, Skeleton } from "@/shared/ui/primitives";
import { UliClose } from "@/shared/ui/uli";

const THEMES = {
  paper: { bg: "#efeee9", fg: "#1a1410", muted: "#4a403a", line: "#9c3b1e" },
  sepia: { bg: "#e9d7c6", fg: "#2b1a10", muted: "#5e3f2c", line: "#9c3b1e" },
  night: { bg: "#1a1410", fg: "#e9e5dc", muted: "#b3a99d", line: "#d39a2c" },
} as const;
type ThemeKey = keyof typeof THEMES;

const PREFS_KEY = "obaifo.reader";
const PARAGRAPH_BREAK = /\n{2,}/;
/** A snake line down the margin; its drawn length is how far through the chapter you are. */
const PROGRESS_PATH_FLAT = "M2 6 C 22 0, 42 12, 62 6 S 102 0, 122 6 S 162 12, 182 6 S 222 0, 242 6 S 282 12, 302 6 S 342 0, 362 6 S 382 12, 398 6";
const PROGRESS_PATH = "M20 0 C 4 60, 36 120, 20 180 S 4 300, 20 360 S 36 480, 20 540 S 4 660, 20 720 S 36 840, 20 900 S 12 960, 20 1000";

type Prefs = { theme: ThemeKey; size: number };
const DEFAULT_PREFS: Prefs = { theme: "paper", size: 21 };
const prefsListeners = new Set<() => void>();

function readPrefsRaw(): string | null {
  try {
    return localStorage.getItem(PREFS_KEY);
  } catch {
    return null; // Storage blocked: fall back to defaults.
  }
}

function parsePrefs(raw: string | null): Prefs {
  try {
    const saved = JSON.parse(raw ?? "null");
    if (saved && saved.theme in THEMES && typeof saved.size === "number") return saved;
  } catch {}
  return DEFAULT_PREFS;
}

/** Reader theme + size, persisted per device. Server render always uses defaults. */
function usePrefs() {
  const raw = useSyncExternalStore(
    (cb) => {
      prefsListeners.add(cb);
      return () => prefsListeners.delete(cb);
    },
    readPrefsRaw,
    () => null,
  );
  const prefs = useMemo(() => parsePrefs(raw), [raw]);
  const update = (next: Partial<Prefs>) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, ...next }));
    } catch {}
    prefsListeners.forEach((cb) => cb());
  };
  return [prefs, update] as const;
}

export function ReaderView() {
  const { t, locale } = useI18n();
  const r = t.reader;
  const params = useParams<{ slug: string; chapter: string }>();
  const slug = params.slug;
  const chapterNumber = Math.max(1, Number(params.chapter) || 1);
  const index = chapterNumber - 1;

  const { data, isLoading, error } = useChapter(slug, index);
  const { data: detail } = useWork(slug);
  const { data: session } = useSession();
  const saveProgress = useSaveProgress();
  const [prefs, setPrefs] = usePrefs();
  const [panel, setPanel] = useState(false);
  const theme = THEMES[prefs.theme];

  // Page-level progress: the article mounts after data loads, so it can't be a scroll target from the first render.
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  // Persist reading position (debounced) for signed-in readers.
  const workId = data?.work.id;
  const total = data?.total ?? 1;
  useEffect(() => {
    if (!session?.user || !workId) return;
    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = scrollYProgress.on("change", (p) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const percent = Math.round(((index + Math.min(1, p)) / total) * 100);
        saveProgress.mutate({ workId, chapterIndex: index, percent });
      }, 1200);
    });
    saveProgress.mutate({ workId, chapterIndex: index, percent: Math.round((index / total) * 100) });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, workId, index, total]);


  return (
    <div
      className="min-h-svh transition-colors duration-500"
      style={{ background: theme.bg, color: theme.fg, ["--color-muted" as string]: theme.muted, ["--ring" as string]: theme.fg }}
    >
      {/* Progress: a bar on small screens, an uli line growing down the margin on wide ones. */}
      <svg viewBox="0 0 400 12" preserveAspectRatio="none" className="fixed inset-x-0 top-16 z-50 h-3 w-full lg:hidden" fill="none" aria-hidden>
        <motion.path d={PROGRESS_PATH_FLAT} stroke={theme.line} strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ pathLength: bar }} />
      </svg>
      <svg viewBox="0 0 40 1000" preserveAspectRatio="none" className="fixed bottom-6 left-6 top-20 z-30 hidden w-8 lg:block xl:left-12" fill="none" aria-hidden>
        <path d={PROGRESS_PATH} stroke={theme.fg} strokeOpacity={0.15} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <motion.path d={PROGRESS_PATH} stroke={theme.line} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ pathLength: bar }} />
      </svg>

      <header
        className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-4 border-b-2 px-5 md:px-10"
        style={{ background: theme.bg, borderColor: `${theme.fg}1f` }}
      >
        <Link href={`/stories/${slug}`} className="flex min-h-11 min-w-0 items-center gap-2 font-semibold hover:underline">
          <Arrow className="rotate-180" />
          <span lang="ig" className="truncate">
            {data?.work.title ?? detail?.title ?? r.back}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-4">
          {data && data.total > 1 && (
            <span className="hidden text-sm font-semibold tabular-nums text-muted sm:inline">{r.position(chapterNumber, data.total)}</span>
          )}
          <button
            type="button"
            onClick={() => setPanel((v) => !v)}
            className="tale flex size-11 items-center justify-center border-2 border-current text-lg font-semibold"
            aria-expanded={panel}
            aria-label={r.settings}
          >
            Aa
          </button>
        </div>
      </header>

      {panel && (
        <div
          className="fixed right-5 top-[4.5rem] z-50 w-[min(19rem,calc(100vw-2.5rem))] border-2 p-5 shadow-[0_18px_40px_-16px_rgb(26_20_16/0.5)] md:right-10"
          style={{ background: theme.bg, borderColor: theme.fg }}
        >
          <p className="text-sm font-bold">{r.theme}</p>
          <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={r.theme}>
            {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={prefs.theme === key}
                onClick={() => setPrefs({ theme: key })}
                className={cn("min-h-12 border-2 text-sm font-semibold", prefs.theme === key && "outline outline-[3px] outline-offset-2 outline-ochre")}
                style={{ background: THEMES[key].bg, color: THEMES[key].fg, borderColor: THEMES[key].fg }}
              >
                {r.themes[key]}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm font-bold">{r.size}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="tale text-sm">A</span>
            <input
              type="range"
              min={16}
              max={30}
              value={prefs.size}
              onChange={(e) => setPrefs({ size: Number(e.target.value) })}
              className="flex-1 accent-[#9c3b1e]"
              aria-label={r.fontSize}
            />
            <span className="tale text-2xl">A</span>
          </div>
        </div>
      )}

      <main className="px-5 pb-28 pt-28 md:pt-36">
        {isLoading ? (
          <div className="mx-auto max-w-[40rem] space-y-6">
            <Skeleton className="h-16 w-3/4" />
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : error || !data ? (
          <div className="mx-auto max-w-md py-24">
            <p className="display text-6xl">{t.common.ewoo}</p>
            <p className="mt-4 text-lg text-muted">{r.loadError}</p>
            <ButtonLink href={`/stories/${slug}`} className="mt-8" arrow>
              {r.backToTale}
            </ButtonLink>
          </div>
        ) : (
          <article key={index} className="mx-auto max-w-[40rem]">
            <h1 lang="ig" className="tale text-[clamp(2.25rem,5.5vw,3.75rem)] font-semibold leading-[1.05]">
              {data.chapter.title}
            </h1>
            <p className="mt-4 text-sm font-semibold text-muted">
              {[data.total > 1 ? r.position(chapterNumber, data.total) : null, data.work.author?.name, locale === "en" ? t.common.inIgbo : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <div className="my-10 h-1 w-16" style={{ background: theme.line }} />

            <div lang="ig" className="prose-tale tale" style={{ fontSize: prefs.size, lineHeight: 1.7 }}>
              {data.chapter.body.split(PARAGRAPH_BREAK).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <UliClose className="mx-auto mt-16 h-6 w-28" />

            <nav className="mt-14 grid grid-cols-2 gap-6 border-t-2 pt-8" style={{ borderColor: `${theme.fg}2e` }} aria-label={r.nav}>
              <div>
                {data.hasPrev && (
                  <Link href={`/read/${slug}/${chapterNumber - 1}`} className="group block">
                    <span className="text-sm font-semibold text-muted">{r.prev}</span>
                    <span className="mt-1 block text-xl font-bold group-hover:underline">{r.chapter(chapterNumber - 1)}</span>
                  </Link>
                )}
              </div>
              <div className="text-right">
                {data.hasNext ? (
                  <Link href={`/read/${slug}/${chapterNumber + 1}`} className="group block">
                    <span className="text-sm font-semibold text-muted">{r.next}</span>
                    <span className="mt-1 block text-2xl font-extrabold group-hover:underline">{r.chapter(chapterNumber + 1)}</span>
                  </Link>
                ) : (
                  <Link href="/stories" className="group block">
                    <span className="text-sm font-semibold text-muted">{r.end}</span>
                    <span className="mt-1 block text-2xl font-extrabold group-hover:underline">{r.another}</span>
                  </Link>
                )}
              </div>
            </nav>
          </article>
        )}
      </main>
      {/* Likes, sharing and comments sit under the tale once it has been read to the end. */}
      {data && !data.hasNext && <EngagementPanel slug={slug} title={data.work.title} workAuthorId={data.work.author?.id} />}
    </div>
  );
}
