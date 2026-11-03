"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "@/i18n/link";
import { useState, type FormEvent } from "react";
import { useSession } from "@/features/auth/api";
import { useErrorText } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import type { Dictionary } from "@/i18n/dictionaries";
import { Avatar, Button, Notice, Skeleton, Textarea } from "@/shared/ui/primitives";
import { useAddComment, useComments, useDeleteComment } from "./api";

const MAX = 1000;

function timeAgo(iso: string, e: Dictionary["engagement"], intl: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return e.justNow;
  if (s < 3600) return e.minutesAgo(Math.floor(s / 60));
  if (s < 86400) return e.hoursAgo(Math.floor(s / 3600));
  if (s < 86400 * 30) return e.daysAgo(Math.floor(s / 86400));
  return new Date(iso).toLocaleDateString(intl, { day: "numeric", month: "short", year: "numeric" });
}

export function Comments({ slug, workAuthorId }: { slug: string; workAuthorId?: string }) {
  const { t, intl } = useI18n();
  const e = t.engagement;
  const errorText = useErrorText();
  const { data: session } = useSession();
  const { data: comments, isLoading } = useComments(slug);
  const add = useAddComment(slug);
  const remove = useDeleteComment(slug);
  const [body, setBody] = useState("");
  const user = session?.user;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    add.mutate(body.trim(), { onSuccess: () => setBody("") });
  };

  return (
    <section aria-labelledby="comments-title">
      <h2 id="comments-title" className="text-2xl font-extrabold">
        {e.commentsTitle} <span className="tabular-nums text-muted">{comments?.length ?? 0}</span>
      </h2>
      <p className="mt-1 text-muted">{e.commentsHint}</p>

      {user ? (
        <form onSubmit={onSubmit} className="mt-6">
          <div className="flex gap-4">
            <Avatar name={user.name} hue={user.avatarHue} />
            <div className="flex-1">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, MAX))}
                placeholder={e.placeholder}
                rows={3}
                aria-label={e.commentAria}
                className="text-base"
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm tabular-nums text-muted">
                  {body.length}/{MAX}
                </span>
                <Button type="submit" disabled={add.isPending || !body.trim()}>
                  {add.isPending ? e.posting : e.post}
                </Button>
              </div>
            </div>
          </div>
          {add.isError && (
            <div className="mt-3">
              <Notice tone="error">{errorText(add.error)}</Notice>
            </div>
          )}
        </form>
      ) : (
        <p className="mt-6 border-2 border-char bg-nzu-deep px-5 py-4">
          <Link href={`/login?next=/stories/${slug}`} className="link font-semibold">
            {e.signInPrompt[0]}
          </Link>
          {e.signInPrompt[1]}
          <Link href={`/register?next=/stories/${slug}`} className="link font-semibold">
            {e.signInPrompt[2]}
          </Link>
          {e.signInPrompt[3]}
        </p>
      )}

      <ul className="mt-10 space-y-1">
        {isLoading && <Skeleton className="h-20" />}
        <AnimatePresence initial={false}>
          {comments?.map((c) => {
            const canDelete = user && (user.id === c.user?.id || user.id === workAuthorId);
            return (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 border-t-2 border-rule py-5"
              >
                {c.user && <Avatar name={c.user.name} hue={c.user.avatarHue} />}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {c.user ? (
                      <Link href={`/authors/${c.user.id}`} className="font-bold hover:text-earth">
                        {c.user.name}
                      </Link>
                    ) : (
                      <span className="font-bold text-muted">{e.deleted}</span>
                    )}
                    {c.isWorkAuthor && <span className="bg-earth px-2 py-0.5 text-xs font-bold text-nzu">{e.storyteller}</span>}
                    <span className="text-sm text-muted">{timeAgo(c.createdAt, e, intl)}</span>
                  </p>
                  <p className="mt-1.5 whitespace-pre-line break-words leading-relaxed">{c.body}</p>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => remove.mutate(c.id)}
                    className="min-h-9 self-start px-2 text-sm font-semibold text-muted hover:bg-nzu-deep hover:text-earth"
                    aria-label={e.deleteAria}
                  >
                    {e.delete}
                  </button>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
        {comments?.length === 0 && <li className="border-t-2 border-rule py-8 text-muted">{e.empty}</li>}
      </ul>
    </section>
  );
}
