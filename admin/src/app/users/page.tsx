"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Avatar, Badge, ErrorBox, Loading, PageTitle, Pagination, SearchInput, Select, Table, Td, Toolbar } from "@/components/ui";
import { date, num } from "@/lib/format";
import { useUsers } from "@/lib/queries";

export default function UsersPage() {
  const [filters, setFilters] = useState({ q: "", role: "", status: "", page: 1 });
  const { data, error, isLoading, isFetching } = useUsers(filters);
  const onSearch = useCallback((q: string) => setFilters((f) => ({ ...f, q, page: 1 })), []);
  const filtered = !!(filters.q || filters.role || filters.status);

  return (
    <>
      <PageTitle title="Users">Every account on Ọbaifo. Open one to change its role, suspend it or delete it.</PageTitle>

      <Toolbar busy={isFetching && !isLoading}>
        <SearchInput onSearch={onSearch} placeholder="Search name or email" />
        <Select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))} aria-label="Role">
          <option value="">All roles</option>
          <option value="reader">Readers</option>
          <option value="author">Storytellers</option>
          <option value="admin">Admins</option>
        </Select>
        <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))} aria-label="Status">
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </Select>
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : isLoading || !data ? (
        <Loading />
      ) : (
        <div className="border-t-4 border-char">
          <Table
            head={["User", "Role", "Status", "Tales", "Comments", "Likes", "Joined"]}
            empty={data.items.length === 0 && (filtered ? "No accounts match these filters. Clear the search or pick another role." : "No accounts yet.")}
          >
            {data.items.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-nzu-deep/70">
                <Td>
                  <Link href={`/users/${u.id}`} className="flex items-center gap-2.5">
                    <Avatar name={u.name} hue={u.avatarHue} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold hover:underline">{u.name}</span>
                      <span className="block truncate text-xs text-char-soft">{u.email}</span>
                    </span>
                  </Link>
                </Td>
                <Td label="Role">
                  <span className="inline-flex gap-1">
                    <Badge tone={u.role === "author" ? "ochre" : "neutral"}>{u.role === "author" ? "Storyteller" : "Reader"}</Badge>
                    {u.isAdmin && <Badge tone="char">Admin</Badge>}
                  </span>
                </Td>
                <Td label="Status">{u.suspendedAt ? <Badge tone="earth">Suspended</Badge> : <Badge tone="live">Active</Badge>}</Td>
                <Td label="Tales">{num(u._count.works)}</Td>
                <Td label="Comments">{num(u._count.comments)}</Td>
                <Td label="Likes">{num(u._count.likes)}</Td>
                <Td label="Joined" className="whitespace-nowrap text-char-soft">{date(u.createdAt)}</Td>
              </tr>
            ))}
          </Table>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(page) => setFilters((f) => ({ ...f, page }))} />
        </div>
      )}
    </>
  );
}
