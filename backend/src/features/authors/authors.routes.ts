import { Router } from "express";
import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../shared/db/client";
import { notFound } from "../../shared/utils/http-error";
import { summaryInclude, toSummary } from "../works/works.service";

export const authorsRouter = Router();

const authorWithTales = {
  works: { where: { status: "published" }, select: { reads: true } },
} satisfies Prisma.UserInclude;

function authorCard(
  author: Prisma.UserGetPayload<{ include: typeof authorWithTales }>,
) {
  return {
    id: author.id,
    name: author.name,
    bio: author.bio,
    avatarHue: author.avatarHue,
    workCount: author.works.length,
    totalReads: author.works.reduce((n, w) => n + w.reads, 0),
    joinedAt: author.createdAt,
  };
}

authorsRouter.get("/", async (_req, res) => {
  const authors = await prisma.user.findMany({
    where: { role: "author", works: { some: { status: "published" } } },
    include: authorWithTales,
  });
  const items = authors
    .map(authorCard)
    .sort((a, b) => b.totalReads - a.totalReads);
  res.json({ items });
});

authorsRouter.get("/:id", async (req, res) => {
  const author = await prisma.user.findFirst({
    where: { id: req.params.id, role: "author" },
    include: authorWithTales,
  });
  if (!author) throw notFound("Author not found");
  const works = await prisma.work.findMany({
    where: { authorId: author.id, status: "published" },
    orderBy: { createdAt: "desc" },
    include: summaryInclude,
  });
  res.json({ ...authorCard(author), works: works.map(toSummary) });
});
