import { prisma } from "../../shared/db/client";
import type { Comment, User } from "../../shared/types";
import { forbidden, HttpError, notFound } from "../../shared/utils/http-error";

const COMMENT_COOLDOWN_MS = 10_000;

async function publishedBySlug(slug: string) {
  const work = await prisma.work.findFirst({
    where: { slug, status: "published" },
    select: { id: true, authorId: true },
  });
  if (!work) throw notFound("This tale could not be found");
  return work;
}

export async function getLikes(slug: string, viewer?: User) {
  const work = await publishedBySlug(slug);
  const [likes, mine] = await Promise.all([
    prisma.like.count({ where: { workId: work.id } }),
    viewer
      ? prisma.like.findUnique({
          where: { userId_workId: { userId: viewer.id, workId: work.id } },
        })
      : null,
  ]);
  return { likes, liked: !!mine };
}

/** Idempotent: `liked` is the state the reader wants, so double-clicks can't flip it back. */
export async function setLike(slug: string, user: User, liked: boolean) {
  const work = await publishedBySlug(slug);
  const key = { userId: user.id, workId: work.id };
  if (liked)
    await prisma.like.upsert({
      where: { userId_workId: key },
      create: key,
      update: {},
    });
  else await prisma.like.deleteMany({ where: key });
  return getLikes(slug, user);
}

type CommentWithUser = Comment & {
  user: { id: string; name: string; avatarHue: number };
};

const commentUser = {
  user: { select: { id: true, name: true, avatarHue: true } },
} as const;

function toPublicComment(comment: CommentWithUser, workAuthorId: string) {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    user: comment.user,
    isWorkAuthor: comment.userId === workAuthorId,
  };
}

export async function listComments(slug: string) {
  const work = await publishedBySlug(slug);
  const rows = await prisma.comment.findMany({
    where: { workId: work.id },
    orderBy: { createdAt: "desc" },
    include: commentUser,
  });
  return rows.map((c) => toPublicComment(c, work.authorId));
}

export async function addComment(slug: string, user: User, body: string) {
  const work = await publishedBySlug(slug);
  // Light spam guard: one comment per reader every few seconds.
  const last = await prisma.comment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (last && Date.now() - last.createdAt.getTime() < COMMENT_COOLDOWN_MS) {
    throw new HttpError(
      429,
      "Please wait a moment before commenting again",
      "SLOW_DOWN",
    );
  }
  const comment = await prisma.comment.create({
    data: { userId: user.id, workId: work.id, body },
    include: commentUser,
  });
  return toPublicComment(comment, work.authorId);
}

/** The commenter can delete their own comment; the tale's author can moderate their page. */
export async function deleteComment(id: string, user: User) {
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { work: { select: { authorId: true } } },
  });
  if (!comment) throw notFound("Comment not found");
  if (comment.userId !== user.id && comment.work.authorId !== user.id) {
    throw forbidden("You can't delete this comment");
  }
  await prisma.comment.delete({ where: { id } });
}
