import { prisma } from "../../shared/db/client";
import type { User } from "../../shared/types";
import { notFound } from "../../shared/utils/http-error";
import { summaryInclude, toSummary } from "../works/works.service";

export async function saveProgress(
  user: User,
  workId: string,
  chapterIndex: number,
  percent: number,
) {
  const work = await prisma.work.findUnique({
    where: { id: workId },
    select: { id: true },
  });
  if (!work) throw notFound("This tale could not be found");
  const data = { chapterIndex, percent: Math.min(100, Math.max(0, percent)) };
  await prisma.progress.upsert({
    where: { userId_workId: { userId: user.id, workId } },
    create: { userId: user.id, workId, ...data },
    update: data,
  });
}

/** A reader's shelf: every tale they've started, most recent first. */
export async function getLibrary(user: User) {
  const rows = await prisma.progress.findMany({
    where: { userId: user.id, work: { status: "published" } },
    orderBy: { updatedAt: "desc" },
    include: { work: { include: summaryInclude } },
  });

  return {
    reading: rows.map((p) => ({
      work: toSummary(p.work),
      chapterIndex: p.chapterIndex,
      percent: p.percent,
      updatedAt: p.updatedAt,
    })),
  };
}
