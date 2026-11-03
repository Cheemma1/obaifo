import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../shared/db/client";
import { watDay } from "../../shared/utils/time";

/** A tab counts as online while it has sent a heartbeat this recently. The client beats every 30s. */
export const ONLINE_WINDOW_MS = 75_000;
const MIN_BEAT_GAP_MS = 10_000;
const PRUNE_AFTER_MS = 24 * 60 * 60 * 1000;

const heartbeatSchema = z.object({
  visitorId: z.uuid(),
  path: z.string().max(300),
  slug: z.string().max(200).optional(),
  chapter: z.number().int().min(0).max(10_000).optional(),
});

/** Which visitors already have today's VisitorDay row (and whether it says "reading"), to skip rewrites. */
const seenToday = new Map<string, boolean>();
let seenDay = watDay();

/** One row per browser per WAT day; flips to reading the first time it opens a tale that day. */
async function recordVisitorDay(visitorId: string, userId: string | null, reading: boolean) {
  const day = watDay();
  if (day !== seenDay) {
    seenToday.clear();
    seenDay = day;
  }
  const seen = seenToday.get(visitorId);
  if (seen === true || (seen === false && !reading)) return;
  seenToday.set(visitorId, reading);
  await prisma.visitorDay.upsert({
    where: { day_visitorId: { day, visitorId } },
    create: { day, visitorId, userId, reading },
    update: reading ? { reading: true, userId: userId ?? undefined } : { userId: userId ?? undefined },
  });
}

/** Ignores repeat beats faster than the client sends them, so one browser can't flood the table. */
const lastBeat = new Map<string, { at: number; path: string }>();

/**
 * POST /api/presence: open tabs on the reader site ping this so the admin app
 * can show who is online and which tale each one is reading. Anyone may call it;
 * signed-in readers are linked to their account.
 */
export const presenceRouter = Router();

presenceRouter.post("/", async (req, res) => {
  const input = heartbeatSchema.parse(req.body);
  const now = Date.now();
  const previous = lastBeat.get(input.visitorId);
  // A new page (e.g. the next chapter) always goes through; the same page is throttled.
  if (previous && previous.path === input.path && now - previous.at < MIN_BEAT_GAP_MS) {
    res.status(204).end();
    return;
  }
  lastBeat.set(input.visitorId, { at: now, path: input.path });

  const work = input.slug
    ? await prisma.work.findFirst({ where: { slug: input.slug, status: "published" }, select: { id: true } })
    : null;
  const data = {
    userId: req.user?.id ?? null,
    workId: work?.id ?? null,
    chapterIndex: work ? (input.chapter ?? 0) : null,
    path: input.path,
    lastSeen: new Date(now),
  };
  await recordVisitorDay(input.visitorId, data.userId, !!work);
  await prisma.presence.upsert({
    where: { visitorId: input.visitorId },
    create: { visitorId: input.visitorId, startedAt: data.lastSeen, ...data },
    update: data,
  });
  res.status(204).end();
});

/** Drops day-old heartbeats and the throttle entries for tabs that have gone quiet. */
export function startPresencePruning() {
  const timer = setInterval(async () => {
    const now = Date.now();
    for (const [id, beat] of lastBeat) if (now - beat.at > ONLINE_WINDOW_MS) lastBeat.delete(id);
    try {
      await prisma.presence.deleteMany({ where: { lastSeen: { lt: new Date(now - PRUNE_AFTER_MS) } } });
    } catch (err) {
      console.error("Could not prune presence", err);
    }
  }, 10 * 60_000);
  timer.unref();
}
