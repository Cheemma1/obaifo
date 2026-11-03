"use client";

import Link from "next/link";
import { ago, num } from "@/lib/format";
import { useLive } from "@/lib/queries";
import type { LiveVisitor } from "@/lib/types";
import { cn } from "./ui";
import { UliThread } from "./uli";

/**
 * Who is reading right now, kept beside the work on every screen. Each reader
 * is a row whose uli thread is drawn as far through the tale as they've got.
 */
export function ReadingNow({ className }: { className?: string }) {
  const { data, error, isLoading } = useLive();
  const readers = data?.visitors.filter((v) => v.work) ?? [];
  const browsing = (data?.online ?? 0) - readers.length;

  return (
    <section className={cn("min-w-0", className)} aria-labelledby="reading-now">
      <h2 id="reading-now" className="flex items-center gap-2.5 text-[0.95rem] font-bold">
        <span className="live-dot" aria-hidden />
        Reading now
      </h2>

      {error ? (
        <p className="mt-4 text-sm text-earth-deep">Live readers could not be loaded. Retrying every 15 seconds.</p>
      ) : isLoading || !data ? (
        <div className="mt-4 h-16 animate-pulse bg-char/6" />
      ) : (
        <>
          <p className="mt-3 flex items-baseline gap-2.5">
            <span className="narrow text-[4rem] leading-[0.85] font-extrabold">{num(data.online)}</span>
            <span className="text-sm font-semibold text-char-soft">
              online
              <br />
              {num(data.reading)} reading a tale
            </span>
          </p>

          {readers.length === 0 ? (
            <p className="mt-6 border-t border-rule pt-4 text-sm leading-relaxed text-char-soft">
              No one has a tale open right now. Readers appear here within 30 seconds of opening a chapter.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-rule border-t border-rule">
              {readers.slice(0, 12).map((v) => (
                <ReaderRow key={v.visitorId} visitor={v} />
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t-2 border-char pt-3 text-sm">
            <span className="text-char-soft">
              {readers.length > 12 && `+${readers.length - 12} more reading · `}
              {num(Math.max(0, browsing))} browsing
            </span>
            <Link href="/live" className="font-semibold underline decoration-char/40 hover:decoration-char">
              See everyone
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

function ReaderRow({ visitor: v }: { visitor: LiveVisitor }) {
  const work = v.work!;
  const chapter = (v.chapterIndex ?? 0) + 1;
  const total = Math.max(1, work.chapterCount);
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3 text-[0.8rem]">
        {v.user ? (
          <Link href={`/users/${v.user.id}`} className="truncate font-bold hover:underline">
            {v.user.name}
          </Link>
        ) : (
          <span className="truncate font-semibold text-char-soft">Guest · {v.visitorId.slice(0, 6)}</span>
        )}
        <span className="shrink-0 text-char-soft" title={`Last seen ${ago(v.lastSeen)}`}>
          Ch. {chapter} of {total}
        </span>
      </div>
      <div lang="ig" className="mt-0.5 truncate font-tale text-[0.95rem] font-semibold">
        {work.title}
      </div>
      <div className="mt-1.5">
        <UliThread progress={chapter / total} label={`Chapter ${chapter} of ${total}`} />
      </div>
    </li>
  );
}
