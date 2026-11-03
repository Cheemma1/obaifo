"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Avatar, ConfirmButton, ErrorBox, Loading, PageTitle, Pagination, SearchInput, Toolbar } from "@/components/ui";
import { ago, dateTime } from "@/lib/format";
import { useComments, useDeleteComment } from "@/lib/queries";

export default function CommentsPage() {
  const [filters, setFilters] = useState({ q: "", page: 1 });
  const { data, error, isLoading, isFetching } = useComments(filters);
  const remove = useDeleteComment();
  const onSearch = useCallback((q: string) => setFilters({ q, page: 1 }), []);

  return (
    <>
      <PageTitle title="Comments">Every comment on every tale, newest first.</PageTitle>

      <Toolbar busy={isFetching && !isLoading}>
        <SearchInput onSearch={onSearch} placeholder="Search text, person or tale" />
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : isLoading || !data ? (
        <Loading />
      ) : (
        <div className="border-t-4 border-char">
          {data.items.length === 0 && (
            <p className="py-10 text-center text-sm text-char-soft">
              {filters.q ? "No comments match that search." : "No one has commented yet. Comments appear here as readers leave them."}
            </p>
          )}
          <ul className="divide-y divide-rule">
            {data.items.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
                <div className="flex min-w-0 flex-1 gap-3">
                  <Avatar name={c.user.name} hue={c.user.avatarHue} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <Link href={`/users/${c.user.id}`} className="font-semibold hover:underline">
                        {c.user.name}
                      </Link>
                      <span className="text-char-soft">
                        on <span lang="ig" className="font-tale font-semibold text-char">{c.work.title}</span>
                      </span>
                      <time dateTime={c.createdAt} className="text-xs text-char-soft" title={dateTime(c.createdAt)}>
                        {ago(c.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 max-w-[70ch] text-sm leading-relaxed whitespace-pre-line">{c.body}</p>
                  </div>
                </div>
                <div className="pl-11 sm:pl-0">
                  <ConfirmButton
                    label="Delete"
                    title="Delete this comment?"
                    body={<span className="whitespace-pre-line">&ldquo;{c.body.length > 200 ? `${c.body.slice(0, 200)}…` : c.body}&rdquo;</span>}
                    confirmLabel="Delete comment"
                    onConfirm={() => remove.mutateAsync(c.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(page) => setFilters((f) => ({ ...f, page }))} />
        </div>
      )}
    </>
  );
}
