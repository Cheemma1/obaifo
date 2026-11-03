import type { z } from "zod";
import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../shared/db/client";
import { deleteCover } from "../../shared/storage/covers";
import type { User } from "../../shared/types";
import { badRequest, notFound } from "../../shared/utils/http-error";
import { ONLINE_WINDOW_MS } from "../presence/presence.routes";
import { summaryInclude, toSummary } from "../works/works.service";
import type {
  listCommentsSchema,
  listDonationsSchema,
  listUsersSchema,
  listWorksSchema,
  suspendSchema,
  updateUserSchema,
  updateWorkSchema,
} from "./admin.schema";

const DAY = 24 * 60 * 60 * 1000;
/** Ọbaifo's days run on West Africa Time (UTC+1, no daylight saving), where most readers are. */
const WAT = 60 * 60 * 1000;

/** Midnight WAT of today, the 1st of this month and 1 January, as UTC instants. */
function watBoundaries(now: number) {
  const wat = new Date(now + WAT);
  const y = wat.getUTCFullYear();
  const m = wat.getUTCMonth();
  return {
    today: new Date(Date.UTC(y, m, wat.getUTCDate()) - WAT),
    month: new Date(Date.UTC(y, m, 1) - WAT),
    year: new Date(Date.UTC(y, 0, 1) - WAT),
  };
}

/** The WAT calendar day (YYYY-MM-DD) an instant falls on. */
const watDay = (at: number | Date) => new Date(+at + WAT).toISOString().slice(0, 10);

/** The last 30 WAT days, oldest first, each with how many of `dates` fall on it. */
function perDay(now: number, dates: { day: string; count: number }[]) {
  const counts = new Map(dates.map((d) => [d.day, d.count]));
  return Array.from({ length: 30 }, (_, i) => {
    const day = watDay(now - (29 - i) * DAY);
    return { day, count: counts.get(day) ?? 0 };
  });
}
const ymd = (day: string) => day.split("-").map(Number).map((n, i) => (i === 1 ? n - 1 : n)) as [number, number, number];
const onlineSince = () => new Date(Date.now() - ONLINE_WINDOW_MS);
const paging = (q: { page: number; pageSize: number }) => ({ skip: (q.page - 1) * q.pageSize, take: q.pageSize });
const insensitive = (q: string) => ({ contains: q, mode: "insensitive" as const });

// ---------- Overview & live readers ----------

export async function overview() {
  const now = Date.now();
  const since7 = new Date(now - 7 * DAY);
  const since30 = new Date(now - 30 * DAY);
  const bounds = watBoundaries(now);
  const chartStart = new Date(Date.UTC(...ymd(watDay(now - 29 * DAY))) - WAT);
  const online = { lastSeen: { gte: onlineSince() } };

  const [
    users,
    authors,
    admins,
    suspended,
    newUsers7,
    published,
    drafts,
    chapters,
    reads,
    likes,
    comments,
    comments7,
    donations,
    donations30,
    onlineNow,
    reading,
    signedIn,
    recent,
    topWorks,
    readsToday,
    readsMonth,
    readsYear,
    firstRead,
    readsByDay,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "author" } }),
    prisma.user.count({ where: { isAdmin: true } }),
    prisma.user.count({ where: { suspendedAt: { not: null } } }),
    prisma.user.count({ where: { createdAt: { gte: since7 } } }),
    prisma.work.count({ where: { status: "published" } }),
    prisma.work.count({ where: { status: "draft" } }),
    prisma.chapter.count(),
    prisma.work.aggregate({ _sum: { reads: true } }),
    prisma.like.count(),
    prisma.comment.count(),
    prisma.comment.count({ where: { createdAt: { gte: since7 } } }),
    prisma.donation.aggregate({ where: { status: "success" }, _sum: { amountKobo: true }, _count: true }),
    prisma.donation.aggregate({
      where: { status: "success", createdAt: { gte: since30 } },
      _sum: { amountKobo: true },
      _count: true,
    }),
    prisma.presence.count({ where: online }),
    prisma.presence.count({ where: { ...online, workId: { not: null } } }),
    prisma.presence.count({ where: { ...online, userId: { not: null } } }),
    prisma.user.findMany({ where: { createdAt: { gte: since30 } }, select: { createdAt: true } }),
    prisma.work.findMany({ where: { status: "published" }, orderBy: { reads: "desc" }, take: 5, include: summaryInclude }),
    prisma.readEvent.count({ where: { chapterIndex: 0, createdAt: { gte: bounds.today } } }),
    prisma.readEvent.count({ where: { chapterIndex: 0, createdAt: { gte: bounds.month } } }),
    prisma.readEvent.count({ where: { chapterIndex: 0, createdAt: { gte: bounds.year } } }),
    prisma.readEvent.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    prisma.$queryRaw<{ day: string; count: number }[]>`
      SELECT to_char("createdAt" + interval '1 hour', 'YYYY-MM-DD') AS day, count(*)::int AS count
      FROM "ReadEvent" WHERE "chapterIndex" = 0 AND "createdAt" >= ${chartStart}
      GROUP BY 1`,
  ]);

  const signupDays = new Map<string, number>();
  for (const u of recent) signupDays.set(watDay(u.createdAt), (signupDays.get(watDay(u.createdAt)) ?? 0) + 1);
  const signups = perDay(now, [...signupDays].map(([day, count]) => ({ day, count })));

  return {
    users: { total: users, authors, admins, suspended, new7d: newUsers7 },
    works: { published, drafts, chapters, reads: reads._sum.reads ?? 0 },
    reads: {
      today: readsToday,
      month: readsMonth,
      year: readsYear,
      allTime: reads._sum.reads ?? 0,
      /** Dated reads only exist from this moment; the all-time total is older. */
      trackedSince: firstRead?.createdAt ?? null,
      perDay: perDay(now, readsByDay),
    },
    engagement: { likes, comments, comments7d: comments7 },
    donations: {
      count: donations._count,
      totalKobo: donations._sum.amountKobo ?? 0,
      count30d: donations30._count,
      totalKobo30d: donations30._sum.amountKobo ?? 0,
    },
    live: { online: onlineNow, reading, signedIn, guests: onlineNow - signedIn },
    signups,
    topWorks: topWorks.map(toSummary),
  };
}

export async function live() {
  const rows = await prisma.presence.findMany({
    where: { lastSeen: { gte: onlineSince() } },
    orderBy: { lastSeen: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, avatarHue: true } },
      work: {
        select: {
          id: true,
          slug: true,
          title: true,
          author: { select: { name: true } },
          _count: { select: { chapters: true } },
        },
      },
    },
  });

  const visitors = rows.map((r) => ({
    visitorId: r.visitorId,
    user: r.user,
    path: r.path,
    work: r.work
      ? { id: r.work.id, slug: r.work.slug, title: r.work.title, author: r.work.author.name, chapterCount: r.work._count.chapters }
      : null,
    chapterIndex: r.chapterIndex,
    startedAt: r.startedAt,
    lastSeen: r.lastSeen,
  }));

  type LiveWork = NonNullable<(typeof visitors)[number]["work"]>;
  const byWork = new Map<string, { work: LiveWork; readers: number }>();
  for (const v of visitors) {
    if (!v.work) continue;
    const entry = byWork.get(v.work.id) ?? { work: v.work, readers: 0 };
    entry.readers++;
    byWork.set(v.work.id, entry);
  }

  return {
    online: visitors.length,
    reading: visitors.filter((v) => v.work).length,
    tales: [...byWork.values()].sort((a, b) => b.readers - a.readers),
    visitors,
  };
}

// ---------- Users ----------

const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isAdmin: true,
  avatarHue: true,
  suspendedAt: true,
  suspendReason: true,
  createdAt: true,
  _count: { select: { works: true, comments: true, likes: true } },
} satisfies Prisma.UserSelect;

export async function listUsers(q: z.infer<typeof listUsersSchema>) {
  const where: Prisma.UserWhereInput = {
    OR: q.q ? [{ name: insensitive(q.q) }, { email: insensitive(q.q) }] : undefined,
    role: q.role === "admin" ? undefined : q.role,
    isAdmin: q.role === "admin" ? true : undefined,
    suspendedAt: q.status === "suspended" ? { not: null } : q.status === "active" ? null : undefined,
  };
  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, select: userListSelect, ...paging(q) }),
  ]);
  return { total, page: q.page, pageSize: q.pageSize, items };
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...userListSelect,
      bio: true,
      emailVerified: true,
      updatedAt: true,
      sessions: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { updatedAt: "desc" },
        select: { id: true, ipAddress: true, userAgent: true, createdAt: true, updatedAt: true },
      },
    },
  });
  if (!user) throw notFound("User not found");

  const [works, comments, progress, donations, presence] = await Promise.all([
    prisma.work.findMany({ where: { authorId: id }, orderBy: { updatedAt: "desc" }, include: summaryInclude }),
    prisma.comment.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { work: { select: { slug: true, title: true } } },
    }),
    prisma.progress.findMany({
      where: { userId: id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { work: { select: { slug: true, title: true } } },
    }),
    prisma.donation.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" } }),
    prisma.presence.findFirst({
      where: { userId: id },
      orderBy: { lastSeen: "desc" },
      include: { work: { select: { slug: true, title: true } } },
    }),
  ]);

  const online = !!presence && presence.lastSeen >= onlineSince();
  return {
    ...user,
    online,
    lastSeen: presence?.lastSeen ?? null,
    nowReading: online && presence.work ? { ...presence.work, chapterIndex: presence.chapterIndex } : null,
    works: works.map(toSummary),
    comments,
    progress,
    donations,
  };
}

/** Admins can't lock themselves out by demoting, suspending or deleting their own account. */
function notSelf(admin: User, id: string, action: string) {
  if (admin.id === id) throw badRequest(`You can't ${action} your own account`, "SELF");
}

export async function updateUser(admin: User, id: string, input: z.infer<typeof updateUserSchema>) {
  if (input.isAdmin === false) notSelf(admin, id, "remove admin from");
  await prisma.user.update({ where: { id }, data: input });
  return getUser(id);
}

/** Ends every session at once, so a suspended reader is signed out on their next request. */
export async function suspendUser(admin: User, id: string, input: z.infer<typeof suspendSchema>) {
  notSelf(admin, id, "suspend");
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { suspendedAt: new Date(), suspendReason: input.reason || null } }),
    prisma.session.deleteMany({ where: { userId: id } }),
  ]);
  return getUser(id);
}

export async function unsuspendUser(id: string) {
  await prisma.user.update({ where: { id }, data: { suspendedAt: null, suspendReason: null } });
  return getUser(id);
}

export async function signOutEverywhere(id: string) {
  await prisma.session.deleteMany({ where: { userId: id } });
}

/** Their tales, chapters, likes, comments and sessions go with them (cascade); donations are kept, unlinked. */
export async function deleteUser(admin: User, id: string) {
  notSelf(admin, id, "delete");
  const works = await prisma.work.findMany({ where: { authorId: id }, select: { coverUrl: true } });
  await prisma.user.delete({ where: { id } });
  await Promise.all(works.map((w) => deleteCover(w.coverUrl)));
}

// ---------- Tales ----------

export async function listWorks(q: z.infer<typeof listWorksSchema>) {
  const where: Prisma.WorkWhereInput = {
    OR: q.q
      ? [{ title: insensitive(q.q) }, { slug: insensitive(q.q) }, { author: { name: insensitive(q.q) } }]
      : undefined,
    status: q.status,
    theme: q.theme,
    featured: q.featured === undefined ? undefined : q.featured === "true",
  };
  const orderBy: Prisma.WorkOrderByWithRelationInput =
    q.sort === "reads" ? { reads: "desc" } : q.sort === "updated" ? { updatedAt: "desc" } : { createdAt: "desc" };
  const [total, rows] = await Promise.all([
    prisma.work.count({ where }),
    prisma.work.findMany({ where, orderBy, include: summaryInclude, ...paging(q) }),
  ]);
  return { total, page: q.page, pageSize: q.pageSize, items: rows.map(toSummary) };
}

export async function updateWork(id: string, input: z.infer<typeof updateWorkSchema>) {
  const current = await prisma.work.findUnique({ where: { id }, select: { publishedAt: true } });
  if (!current) throw notFound("Tale not found");
  const publishedAt = input.status === "published" && !current.publishedAt ? new Date() : undefined;
  const work = await prisma.work.update({ where: { id }, data: { ...input, publishedAt }, include: summaryInclude });
  return toSummary(work);
}

/** Chapters, likes, comments and reading progress are removed by the database cascade. */
export async function deleteWork(id: string) {
  const work = await prisma.work.findUnique({ where: { id }, select: { coverUrl: true } });
  if (!work) throw notFound("Tale not found");
  await prisma.work.delete({ where: { id } });
  await deleteCover(work.coverUrl);
}

// ---------- Comments & donations ----------

export async function listComments(q: z.infer<typeof listCommentsSchema>) {
  const where: Prisma.CommentWhereInput = {
    OR: q.q
      ? [{ body: insensitive(q.q) }, { user: { name: insensitive(q.q) } }, { work: { title: insensitive(q.q) } }]
      : undefined,
  };
  const [total, items] = await Promise.all([
    prisma.comment.count({ where }),
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, avatarHue: true } },
        work: { select: { id: true, slug: true, title: true } },
      },
      ...paging(q),
    }),
  ]);
  return { total, page: q.page, pageSize: q.pageSize, items };
}

export async function deleteComment(id: string) {
  await prisma.comment.delete({ where: { id } });
}

export async function listDonations(q: z.infer<typeof listDonationsSchema>) {
  const where: Prisma.DonationWhereInput = {
    status: q.status,
    OR: q.q ? [{ name: insensitive(q.q) }, { email: insensitive(q.q) }, { reference: insensitive(q.q) }] : undefined,
  };
  const [total, sum, items] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.aggregate({ where: { ...where, status: "success" }, _sum: { amountKobo: true } }),
    prisma.donation.findMany({ where, orderBy: { createdAt: "desc" }, ...paging(q) }),
  ]);
  return { total, successKobo: sum._sum.amountKobo ?? 0, page: q.page, pageSize: q.pageSize, items };
}
