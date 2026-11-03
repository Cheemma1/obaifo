import { prisma } from "../../shared/db/client";
import { THEMES, type Theme } from "../../shared/types";
import { DAY_MS, watDay, watDayStart, watDaysAgo } from "../../shared/utils/time";

/**
 * GET /api/admin/insights: the overview's answers to four questions an admin acts on.
 *   1. Is reading growing?           visitors, readers, returning readers, reads, sign-ups, week on week
 *   2. What needs attention?          stalled drafts, unread tales, new comments, stuck payments
 *   3. Which tales are working?       starts, how far readers get, where they stop, what to do
 *   4. What should be written next?   demand per kind of tale against how many tales exist
 * Day-level history (ReadEvent, VisitorDay) only exists from when it was first recorded, so
 * every comparison says whether it has enough history to be trusted.
 */

const pct = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);

type Period = { from: string; to: string };

async function distinctVisitors(p: Period, readingOnly: boolean) {
  const rows = readingOnly
    ? await prisma.$queryRaw<{ n: number }[]>`
        SELECT count(DISTINCT "visitorId")::int AS n FROM "VisitorDay"
        WHERE day BETWEEN ${p.from} AND ${p.to} AND reading`
    : await prisma.$queryRaw<{ n: number }[]>`
        SELECT count(DISTINCT "visitorId")::int AS n FROM "VisitorDay"
        WHERE day BETWEEN ${p.from} AND ${p.to}`;
  return rows[0]?.n ?? 0;
}

/** Readers in the period who had also read on some earlier day. */
async function returningReaders(p: Period) {
  const rows = await prisma.$queryRaw<{ n: number }[]>`
    SELECT count(DISTINCT a."visitorId")::int AS n FROM "VisitorDay" a
    WHERE a.day BETWEEN ${p.from} AND ${p.to} AND a.reading
      AND EXISTS (SELECT 1 FROM "VisitorDay" b WHERE b."visitorId" = a."visitorId" AND b.reading AND b.day < ${p.from})`;
  return rows[0]?.n ?? 0;
}

export async function insights() {
  const now = Date.now();
  const week: Period = { from: watDaysAgo(6, now), to: watDay(now) };
  const lastWeek: Period = { from: watDaysAgo(13, now), to: watDaysAgo(7, now) };
  const weekStart = watDayStart(week.from);
  const lastWeekStart = watDayStart(lastWeek.from);
  const since30 = watDayStart(watDaysAgo(29, now));
  const since60 = watDayStart(watDaysAgo(59, now));
  const since14 = new Date(now - 14 * DAY_MS);

  const [firstVisit, firstRead] = await Promise.all([
    prisma.visitorDay.findFirst({ orderBy: { day: "asc" }, select: { day: true } }),
    prisma.readEvent.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  const trackedSince = firstVisit?.day ?? (firstRead ? watDay(firstRead.createdAt) : null);
  /** A week-on-week comparison is only fair once last week was fully recorded. */
  const hasLastWeek = !!trackedSince && trackedSince <= lastWeek.from;
  const has30Days = !!trackedSince && trackedSince <= watDaysAgo(29, now);

  // ---------- 1. Is reading growing? ----------
  const [visitors, visitorsBefore, readers, readersBefore, returning, reads, readsBefore, signups, signupsBefore, daily, readsDaily] =
    await Promise.all([
      distinctVisitors(week, false),
      distinctVisitors(lastWeek, false),
      distinctVisitors(week, true),
      distinctVisitors(lastWeek, true),
      returningReaders(week),
      prisma.readEvent.count({ where: { chapterIndex: 0, createdAt: { gte: weekStart } } }),
      prisma.readEvent.count({ where: { chapterIndex: 0, createdAt: { gte: lastWeekStart, lt: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeekStart, lt: weekStart } } }),
      prisma.$queryRaw<{ day: string; visitors: number; readers: number }[]>`
        SELECT day, count(*)::int AS visitors, (count(*) FILTER (WHERE reading))::int AS readers
        FROM "VisitorDay" WHERE day >= ${watDaysAgo(29, now)} GROUP BY day`,
      prisma.$queryRaw<{ day: string; reads: number }[]>`
        SELECT to_char("createdAt" + interval '1 hour', 'YYYY-MM-DD') AS day, count(*)::int AS reads
        FROM "ReadEvent" WHERE "chapterIndex" = 0 AND "createdAt" >= ${since30} GROUP BY 1`,
    ]);
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const readsByDay = new Map(readsDaily.map((d) => [d.day, d.reads]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = watDaysAgo(29 - i, now);
    return { day, visitors: byDay.get(day)?.visitors ?? 0, readers: byDay.get(day)?.readers ?? 0, reads: readsByDay.get(day) ?? 0 };
  });

  const growth = {
    hasLastWeek,
    visitors: { now: visitors, before: visitorsBefore, change: hasLastWeek ? pct(visitors, visitorsBefore) : null },
    readers: { now: readers, before: readersBefore, change: hasLastWeek ? pct(readers, readersBefore) : null },
    returning: { now: returning, share: readers ? Math.round((returning / readers) * 100) : null },
    reads: { now: reads, before: readsBefore, change: hasLastWeek ? pct(reads, readsBefore) : null },
    signups: { now: signups, before: signupsBefore, change: pct(signups, signupsBefore) },
    days,
  };

  // ---------- 3. Which tales are working? ----------
  const works = await prisma.work.findMany({
    where: { status: "published" },
    select: {
      id: true,
      slug: true,
      title: true,
      theme: true,
      featured: true,
      reads: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
      _count: { select: { chapters: true, likes: true, comments: true } },
    },
  });
  const [opens30, startsBefore, progressAll, progressDone] = await Promise.all([
    prisma.readEvent.groupBy({ by: ["workId", "chapterIndex"], where: { createdAt: { gte: since30 } }, _count: { _all: true } }),
    prisma.readEvent.groupBy({ by: ["workId"], where: { chapterIndex: 0, createdAt: { gte: since60, lt: since30 } }, _count: { _all: true } }),
    prisma.progress.groupBy({ by: ["workId"], _count: { _all: true } }),
    prisma.progress.groupBy({ by: ["workId"], where: { percent: { gte: 95 } }, _count: { _all: true } }),
  ]);
  const opens = new Map<string, number[]>();
  for (const row of opens30) {
    const list = opens.get(row.workId) ?? [];
    list[row.chapterIndex] = row._count._all;
    opens.set(row.workId, list);
  }
  const countBy = (rows: { workId: string; _count: { _all: number } }[]) => new Map(rows.map((r) => [r.workId, r._count._all]));
  const before30 = countBy(startsBefore);
  const tracked = countBy(progressAll);
  const finished = countBy(progressDone);

  const tales = works
    .map((w) => {
      const chapters = w._count.chapters;
      const perChapter = Array.from({ length: chapters }, (_, i) => opens.get(w.id)?.[i] ?? 0);
      const starts = perChapter[0] ?? 0;
      const reachedEnd = chapters > 1 ? perChapter[chapters - 1] : null;
      // The chapter after which the most readers leave (biggest fall from one chapter to the next).
      let dropAfter: number | null = null;
      if (chapters > 1 && starts >= 5) {
        let worst = 0;
        for (let i = 1; i < chapters; i++) {
          const fall = perChapter[i - 1] - perChapter[i];
          if (fall > worst) {
            worst = fall;
            dropAfter = i; // 1-based: readers stop after chapter i
          }
        }
      }
      const reachRate = reachedEnd !== null && starts > 0 ? Math.min(100, Math.round((reachedEnd / starts) * 100)) : null;
      const signedIn = tracked.get(w.id) ?? 0;
      const finishRate = signedIn >= 3 ? Math.round(((finished.get(w.id) ?? 0) / signedIn) * 100) : null;
      const likesPer100 = w.reads > 0 ? Math.round((w._count.likes / w.reads) * 1000) / 10 : null;
      const publishedAt = w.publishedAt ?? w.createdAt;
      const ageDays = Math.floor((now - publishedAt.getTime()) / DAY_MS);

      let verdict: "new" | "unread" | "losing" | "feature" | "steady";
      if (ageDays < 14) verdict = "new";
      else if (has30Days && starts === 0) verdict = "unread";
      else if (reachRate !== null && starts >= 10 && reachRate < 40) verdict = "losing";
      else if (!w.featured && starts >= 5 && ((finishRate ?? 0) >= 60 || (likesPer100 ?? 0) >= 5)) verdict = "feature";
      else verdict = "steady";

      return {
        id: w.id,
        slug: w.slug,
        title: w.title,
        theme: w.theme,
        featured: w.featured,
        author: w.author,
        chapters,
        publishedAt,
        starts,
        startsChange: has30Days ? pct(starts, before30.get(w.id) ?? 0) : null,
        perChapter,
        reachRate,
        dropAfter,
        signedIn,
        finishRate,
        likesPer100,
        reads: w.reads,
        comments: w._count.comments,
        verdict,
      };
    })
    .sort((a, b) => b.starts - a.starts || b.reads - a.reads);

  // ---------- 4. What should storytellers write next? ----------
  // Demand is reads in the last 30 days; until there is enough of that, all-time reads stand in.
  const recentStarts = tales.reduce((n, t) => n + t.starts, 0);
  const basis: "30d" | "allTime" = recentStarts >= 20 ? "30d" : "allTime";
  const demand = (t: (typeof tales)[number]) => (basis === "30d" ? t.starts : t.reads);
  const totalDemand = tales.reduce((n, t) => n + demand(t), 0);
  const avgPerTale = tales.length ? totalDemand / tales.length : 0;
  const kinds = THEMES.map((theme: Theme) => {
    const ofKind = tales.filter((t) => t.theme === theme);
    const kindDemand = ofKind.reduce((n, t) => n + demand(t), 0);
    const perTale = ofKind.length ? Math.round(kindDemand / ofKind.length) : 0;
    const share = totalDemand ? Math.round((kindDemand / totalDemand) * 100) : 0;
    let advice: "write-more" | "missing" | "enough" | "steady";
    if (ofKind.length === 0) advice = "missing";
    else if (avgPerTale > 0 && perTale >= avgPerTale * 1.25) advice = "write-more";
    else if (avgPerTale > 0 && perTale <= avgPerTale * 0.6) advice = "enough";
    else advice = "steady";
    return { theme, tales: ofKind.length, demand: kindDemand, perTale, share, ratio: avgPerTale ? Math.round((perTale / avgPerTale) * 10) / 10 : null, advice };
  }).sort((a, b) => b.perTale - a.perTale);

  // ---------- 2. What needs attention? ----------
  const [staleDrafts, staleDraftCount, newComments, latestComments, stuckPayments] = await Promise.all([
    prisma.work.findMany({
      where: { status: "draft", updatedAt: { lt: since14 } },
      orderBy: { updatedAt: "asc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true, author: { select: { id: true, name: true, email: true } }, _count: { select: { chapters: true } } },
    }),
    prisma.work.count({ where: { status: "draft", updatedAt: { lt: since14 } } }),
    prisma.comment.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.comment.findMany({
      where: { createdAt: { gte: weekStart } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, body: true, createdAt: true, user: { select: { id: true, name: true } }, work: { select: { title: true } } },
    }),
    prisma.donation.count({ where: { status: "pending", createdAt: { lt: new Date(now - DAY_MS) } } }),
  ]);

  // ---------- Archive and support ----------
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - (5 - i), 1));
    return start.toISOString().slice(0, 7);
  });
  const sixMonthsAgo = new Date(`${months[0]}-01T00:00:00Z`);
  const [publishedRecent, storytellers, activeStorytellers, drafts, gifts30, giftsBefore] = await Promise.all([
    prisma.work.findMany({ where: { status: "published", publishedAt: { gte: sixMonthsAgo } }, select: { publishedAt: true } }),
    prisma.user.count({ where: { works: { some: { status: "published" } } } }),
    prisma.user.count({ where: { works: { some: { status: "published", publishedAt: { gte: new Date(now - 90 * DAY_MS) } } } } }),
    prisma.work.count({ where: { status: "draft" } }),
    prisma.donation.aggregate({ where: { status: "success", createdAt: { gte: since30 } }, _sum: { amountKobo: true }, _count: true }),
    prisma.donation.aggregate({ where: { status: "success", createdAt: { gte: since60, lt: since30 } }, _sum: { amountKobo: true } }),
  ]);
  const perMonth = new Map<string, number>();
  for (const w of publishedRecent) {
    const m = w.publishedAt!.toISOString().slice(0, 7);
    perMonth.set(m, (perMonth.get(m) ?? 0) + 1);
  }
  const giftKobo = gifts30._sum.amountKobo ?? 0;

  return {
    trackedSince,
    growth,
    attention: {
      staleDrafts: { count: staleDraftCount, items: staleDrafts },
      unreadTales: tales.filter((t) => t.verdict === "unread").map((t) => ({ id: t.id, title: t.title, author: t.author })),
      losingTales: tales.filter((t) => t.verdict === "losing").map((t) => ({ id: t.id, title: t.title, dropAfter: t.dropAfter, reachRate: t.reachRate })),
      newComments: { count: newComments, latest: latestComments },
      stuckPayments,
    },
    tales,
    kinds: { basis, avgPerTale: Math.round(avgPerTale), items: kinds },
    archive: {
      months: months.map((m) => ({ month: m, published: perMonth.get(m) ?? 0 })),
      storytellers,
      activeStorytellers,
      drafts,
    },
    support: {
      kobo30d: giftKobo,
      gifts30d: gifts30._count,
      change: pct(giftKobo, giftsBefore._sum.amountKobo ?? 0),
    },
  };
}
