"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Badge, ErrorBox, Loading, PageTitle, Pagination, SearchInput, Select, Table, Td, Toolbar } from "@/components/ui";
import { dateTime, naira } from "@/lib/format";
import { useDonations } from "@/lib/queries";

const STATUS = {
  success: { tone: "live", label: "Successful" },
  pending: { tone: "ochre", label: "Pending" },
  failed: { tone: "earth", label: "Failed" },
} as const;

export default function DonationsPage() {
  const [filters, setFilters] = useState({ q: "", status: "", page: 1 });
  const { data, error, isLoading, isFetching } = useDonations(filters);
  const onSearch = useCallback((q: string) => setFilters((f) => ({ ...f, q, page: 1 })), []);
  const filtered = !!(filters.q || filters.status);

  return (
    <>
      <PageTitle title="Donations">
        Every gift, including ones still pending or that failed.
        {data && (
          <>
            {" "}
            Successful gifts {filtered ? "matching these filters" : "in all"}: <strong className="text-char">{naira(data.successKobo)}</strong>.
          </>
        )}
      </PageTitle>

      <Toolbar busy={isFetching && !isLoading}>
        <SearchInput onSearch={onSearch} placeholder="Search name, email or reference" />
        <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))} aria-label="Status">
          <option value="">Any status</option>
          <option value="success">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </Select>
      </Toolbar>

      {error ? (
        <ErrorBox error={error} />
      ) : isLoading || !data ? (
        <Loading />
      ) : (
        <div className="border-t-4 border-char">
          <Table
            head={["Donor", "Amount", "Status", "Provider", "Reference", "When"]}
            empty={data.items.length === 0 && (filtered ? "No gifts match these filters." : "No donations yet. Gifts made on /donate appear here.")}
          >
            {data.items.map((d) => (
              <tr key={d.id}>
                <Td>
                  {d.userId ? (
                    <Link href={`/users/${d.userId}`} className="font-semibold hover:underline">
                      {d.name}
                    </Link>
                  ) : (
                    <span className="font-semibold">{d.name}</span>
                  )}
                  <div className="text-xs text-char-soft">{d.email}</div>
                </Td>
                <Td label="Amount" className="font-semibold">{naira(d.amountKobo)}</Td>
                <Td label="Status">
                  <Badge tone={STATUS[d.status].tone}>{STATUS[d.status].label}</Badge>
                </Td>
                <Td label="Provider">{d.provider === "mock" ? "Test checkout" : "Paystack"}</Td>
                <Td label="Reference" className="text-xs break-all">{d.reference}</Td>
                <Td label="When" className="whitespace-nowrap text-char-soft">{dateTime(d.createdAt)}</Td>
              </tr>
            ))}
          </Table>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={(page) => setFilters((f) => ({ ...f, page }))} />
        </div>
      )}
    </>
  );
}
