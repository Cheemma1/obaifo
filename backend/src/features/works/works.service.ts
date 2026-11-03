import type { z } from "zod";
import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../shared/db/client";
import { type CoverFile, deleteCover, saveCover } from "../../shared/storage/covers";
import type { User } from "../../shared/types";
import { forbidden, HttpError, notFound } from "../../shared/utils/http-error";
import { fold, minutesToRead, slugify, wordCount } from "../../shared/utils/text";
import { looksEnglish } from "./igbo-check";
import type { createWorkSchema, listWorksSchema, updateWorkSchema } from "./works.schema";

/** Everything a summary card needs, without loading chapter bodies. */
export const summaryInclude = {
  author: { select: { id: true, name: true, avatarHue: true } },
  chapters: { select: { words: true } },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.WorkInclude;

type SummaryRow = Prisma.WorkGetPayload<{ include: typeof summaryInclude }>;

/** The shape every list/detail endpoint returns — never includes chapter bodies. */
export function toSummary(work: SummaryRow) {
  const words = work.chapters.reduce((n, c) => n + c.words, 0);
  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    type: work.type,
    theme: work.theme,
    synopsis: work.synopsis,
    coverUrl: work.coverUrl,
    status: work.status,
    featured: work.featured,
    reads: work.reads,
    likes: work._count.likes,
    comments: work._count.comments,
    chapterCount: work.chapters.length,
    wordCount: words,
    minutes: minutesToRead(words),
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
    author: work.author,
  };
}

export type WorkSummary = ReturnType<typeof toSummary>;

export async function listPublished(query: z.infer<typeof listWorksSchema>): Promise<WorkSummary[]> {
  const where: Prisma.WorkWhereInput = {
    status: "published",
    type: query.type,
    theme: query.theme,
    authorId: query.author,
    featured: query.featured === undefined ? undefined : query.featured === "true",
  };
  const orderBy: Prisma.WorkOrderByWithRelationInput =
    query.sort === "popular" ? { reads: "desc" } : { createdAt: "desc" };

  if (!query.q) {
    const rows = await prisma.work.findMany({ where, orderBy, take: query.limit, include: summaryInclude });
    return rows.map(toSummary);
  }

  // Search folds dotted vowels (ọ matches o), which plain Postgres can't do,
  // so the match runs here. The catalogue of published tales stays small.
  const needle = fold(query.q);
  const rows = await prisma.work.findMany({ where, orderBy, include: summaryInclude });
  return rows
    .filter((w) => fold(`${w.title} ${w.synopsis} ${w.author.name}`).includes(needle))
    .slice(0, query.limit)
    .map(toSummary);
}

async function findPublishedBySlug(slug: string) {
  const work = await prisma.work.findFirst({ where: { slug, status: "published" }, include: summaryInclude });
  if (!work) throw notFound("This tale could not be found");
  return work;
}

export async function getDetail(slug: string) {
  const work = await findPublishedBySlug(slug);
  const chapters = await prisma.chapter.findMany({
    where: { workId: work.id },
    orderBy: { position: "asc" },
    select: { position: true, title: true, words: true },
  });
  return {
    ...toSummary(work),
    chapters: chapters.map((c) => ({ index: c.position, title: c.title, words: c.words })),
  };
}

/** Every chapter of every tale is free to read, signed in or not. */
export async function readChapter(slug: string, index: number) {
  let work = await findPublishedBySlug(slug);
  const chapter = await prisma.chapter.findUnique({
    where: { workId_position: { workId: work.id, position: index } },
  });
  if (!chapter) throw notFound("Chapter not found");

  if (index === 0) {
    work = await prisma.work.update({
      where: { id: work.id },
      data: { reads: { increment: 1 } },
      include: summaryInclude,
    });
  }

  const total = work.chapters.length;
  return {
    work: toSummary(work),
    index,
    total,
    chapter: { title: chapter.title, body: chapter.body },
    hasNext: index < total - 1,
    hasPrev: index > 0,
  };
}

// ---------- Studio (authors managing their own works) ----------

async function uniqueSlug(title: string, exceptId?: string): Promise<string> {
  const base = slugify(title) || "akuko";
  const rows = await prisma.work.findMany({
    where: { slug: { startsWith: base }, id: exceptId ? { not: exceptId } : undefined },
    select: { slug: true },
  });
  const taken = new Set(rows.map((w) => w.slug));
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

const chapterRows = (chapters: { title: string; body: string }[]) =>
  chapters.map((c, position) => ({ position, title: c.title, body: c.body, words: wordCount(c.body) }));

async function ownWork(id: string, author: User) {
  const work = await prisma.work.findUnique({ where: { id } });
  if (!work) throw notFound();
  if (work.authorId !== author.id) throw forbidden("This is not your work");
  return work;
}

export async function listMine(author: User) {
  const rows = await prisma.work.findMany({
    where: { authorId: author.id },
    orderBy: { updatedAt: "desc" },
    include: summaryInclude,
  });
  return rows.map(toSummary);
}

export async function getMine(id: string, author: User) {
  await ownWork(id, author);
  const work = await prisma.work.findUniqueOrThrow({ where: { id }, include: summaryInclude });
  const chapters = await prisma.chapter.findMany({
    where: { workId: id },
    orderBy: { position: "asc" },
    select: { id: true, title: true, body: true },
  });
  return { ...toSummary(work), chapters };
}

/** Published tales must be told in Igbo. Drafts are left alone so writers can work freely. */
function assertIgbo(chapters: { body: string }[]) {
  if (!looksEnglish(chapters.map((c) => c.body).join("\n"))) return;
  throw new HttpError(422, "This tale looks like it is written in English. Ọbaifo only publishes ifo told in Igbo.", "NOT_IGBO");
}

export async function create(author: User, input: z.infer<typeof createWorkSchema>, cover?: CoverFile) {
  if (input.publish) assertIgbo(input.chapters);
  const coverUrl = cover ? await saveCover(cover) : null;
  try {
    const work = await prisma.work.create({
      data: {
        slug: await uniqueSlug(input.title),
        title: input.title,
        authorId: author.id,
        type: input.type,
        theme: input.theme,
        synopsis: input.synopsis,
        coverUrl,
        status: input.publish ? "published" : "draft",
        chapters: { create: chapterRows(input.chapters) },
      },
    });
    return getMine(work.id, author);
  } catch (err) {
    await deleteCover(coverUrl);
    throw err;
  }
}

export async function update(id: string, author: User, input: z.infer<typeof updateWorkSchema>, cover?: CoverFile) {
  const work = await ownWork(id, author);
  const data: Prisma.WorkUpdateInput = {};

  if (input.title !== undefined && input.title !== work.title) {
    data.title = input.title;
    data.slug = await uniqueSlug(input.title, work.id);
  }
  if (input.type !== undefined) data.type = input.type;
  if (input.theme !== undefined) data.theme = input.theme;
  if (input.synopsis !== undefined) data.synopsis = input.synopsis;
  if (input.publish !== undefined) data.status = input.publish ? "published" : "draft";

  const status = input.publish === undefined ? work.status : input.publish ? "published" : "draft";
  if (status === "published") {
    const chapters =
      input.chapters ?? (await prisma.chapter.findMany({ where: { workId: id }, select: { body: true } }));
    assertIgbo(chapters);
  }

  const newCoverUrl = cover ? await saveCover(cover) : null;
  if (cover || input.removeCover) data.coverUrl = newCoverUrl;

  // The editor always sends the full, ordered chapter list, so replace them wholesale.
  if (input.chapters) data.chapters = { deleteMany: {}, create: chapterRows(input.chapters) };

  try {
    await prisma.work.update({ where: { id }, data });
  } catch (err) {
    await deleteCover(newCoverUrl);
    throw err;
  }
  // Only drop the old cover once the new one is saved against the work.
  if (cover || input.removeCover) await deleteCover(work.coverUrl);
  return getMine(id, author);
}

/** Chapters, likes, comments and reading progress are removed by the database cascade. */
export async function remove(id: string, author: User) {
  const work = await ownWork(id, author);
  await prisma.work.delete({ where: { id } });
  await deleteCover(work.coverUrl);
}

/**
 * Splits a plain-text manuscript into chapters. Lines that start with "#",
 * "Isi" (Igbo for chapter) or "Chapter" begin a new chapter.
 */
export function parseManuscript(text: string): { title: string; body: string }[] {
  const heading = /^\s*(#{1,3}\s+.+|(isi|chapter)\s+[\w\dịọụ]+.*)$/i;
  const chapters: { title: string; body: string }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    if (heading.test(line)) {
      if (current) chapters.push({ title: current.title, body: current.lines.join("\n").trim() });
      current = { title: line.replace(/^#+\s*/, "").trim(), lines: [] };
    } else {
      current ??= { title: "Isi 1", lines: [] };
      current.lines.push(line);
    }
  }
  if (current) chapters.push({ title: current.title, body: current.lines.join("\n").trim() });
  return chapters.filter((c) => c.body.length > 0);
}
