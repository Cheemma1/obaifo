"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Badge, Button, ConfirmButton, ErrorBox, Loading, PageTitle, Pagination, SearchInput, Select, Table, Td, Toolbar } from "@/components/ui";
import { date, num, SITE_URL, THEME_LABELS } from "@/lib/format";
import { useDeleteWork, useUpdateWork, useWorks } from "@/lib/queries";
import type { Theme } from "@/lib/types";

export default function TalesPage() {
  const [filters, setFilters] = useState({ q: "", status: "", theme: "", featured: "", sort: "new", page: 1 });
  const { data, error, isLoading, isFetching } = useWorks(filters);
  const update = useUpdateWork();
  const remove = useDeleteWork();
  const onSearch = useCallback((q: string) => setFilters((f) => ({ ...f, q, page: 1 })), []);
  const set = (key: keyof typeof filters) => (e: { target: { value: string } }) => setFilters((f) => ({ ...f, [key]: e.target.value, page: 1 }));
  const filtered = !!(filters.q || filters.status || filters.theme || filters.featured);

  return (
    <>
      <PageTitle title="Tales">Every tale, published or draft. Feature a tale on the home page, unpublish it or delete it.</PageTitle>

      {update.error && (
        <div className="mb-4">
          <ErrorBox error={update.error} />
        </div>
      )}

      <Toolbar busy={isFetching && !isLoading}>
        <SearchInput onSearch={onSearch} placeholder="Search title or storyteller" />
        <Select value={filters.status} onChange={set("status")} aria-label="Status">
          <option value="">Published and drafts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </Select>
        <Select value={filters.theme} onChange={set("theme")} aria-label="Kind of tale">
          <option value="">Every kind</option>
          {(Object.keys(THEME_LABELS) as Theme[]).map((t) => (
            <option key={t} value={t}>
              {THEME_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select value={filters.featured} onChange={set("featured")} aria-label="Featured">
          <option value="">Featured or not</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </Select>
        <Select value={filters.sort} onChange={set("sort")} aria-label="Sort">
          <option value="new">Newest</option>
          <option value="updated">Recently updated</option>
          <option value="reads">Most read</option>
        </Select>
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : isLoading || !data ? (
        <Loading />
      ) : (
        <div className="border-t-4 border-char">
          <Table
            head={["Tale", "Storyteller", "Status", "Reads", "Likes", "Comments"]}
            empty={data.items.length === 0 && (filtered ? "No tales match these filters. Clear the search or pick another kind." : "No tales yet.")}
          >
            {data.items.map((w) => (
              <tr key={w.id} className="transition-colors hover:bg-nzu-deep/70">
                <Td className="md:min-w-60">
                  {w.status === "published" ? (
                    <a lang="ig" href={`${SITE_URL}/stories/${w.slug}`} target="_blank" rel="noreferrer" className="font-tale text-[0.95rem] font-semibold hover:underline">
                      {w.title}
                    </a>
                  ) : (
                    <span lang="ig" className="font-tale text-[0.95rem] font-semibold">{w.title}</span>
                  )}
                  <div className="mt-0.5 text-xs text-char-soft">
                    {THEME_LABELS[w.theme]} · {w.chapterCount === 1 ? "1 chapter" : `${w.chapterCount} chapters`} · {num(w.wordCount)} words · {date(w.createdAt)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <Button variant="outline" disabled={update.isPending} onClick={() => update.mutate({ id: w.id, featured: !w.featured })}>
                      {w.featured ? "Unfeature" : "Feature"}
                    </Button>
                    {w.status === "published" && (
                      <ConfirmButton
                        label="Unpublish"
                        title="Unpublish this tale?"
                        body="It goes back to being a draft: readers can no longer open it, but nothing is deleted. The storyteller can publish it again."
                        confirmLabel="Unpublish"
                        variant="solid"
                        onConfirm={() => update.mutateAsync({ id: w.id, status: "draft" })}
                      />
                    )}
                    <ConfirmButton
                      label="Delete"
                      title="Delete this tale?"
                      body={
                        <>
                          &ldquo;<span lang="ig">{w.title}</span>&rdquo; by {w.author?.name ?? "an unknown storyteller"}, with its {w.chapterCount} chapters, {w.likes} likes and {w.comments} comments, will be deleted. This can&apos;t be undone.
                        </>
                      }
                      confirmLabel="Delete tale"
                      typeToConfirm="delete"
                      onConfirm={() => remove.mutateAsync(w.id)}
                    />
                  </div>
                </Td>
                <Td label="Storyteller">{w.author ? <Link href={`/users/${w.author.id}`} className="hover:underline">{w.author.name}</Link> : "—"}</Td>
                <Td label="Status">
                  <span className="inline-flex gap-1">
                    {w.status === "published" ? <Badge tone="live">Published</Badge> : <Badge>Draft</Badge>}
                    {w.featured && <Badge tone="ochre">Featured</Badge>}
                  </span>
                </Td>
                <Td label="Reads">{num(w.reads)}</Td>
                <Td label="Likes">{num(w.likes)}</Td>
                <Td label="Comments">{num(w.comments)}</Td>
              </tr>
            ))}
          </Table>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(page) => setFilters((f) => ({ ...f, page }))} />
        </div>
      )}
    </>
  );
}
