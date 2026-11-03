"use client";

import Link from "next/link";
import { Kinds } from "@/components/kinds";
import { Badge, Card, ErrorBox, Loading, PageTitle, Stat, StatBand, Table, Td } from "@/components/ui";
import { date, naira, num } from "@/lib/format";
import { useInsights, useLive, useOverview } from "@/lib/queries";

export default function OverviewPage() {
  const { data, error, isLoading, dataUpdatedAt } = useOverview();
  const live = useLive();
  const insights = useInsights();

  if (error) return <ErrorBox error={error} />;
  if (isLoading || !data) {
    return (
      <>
        <PageTitle title="Overview" />
        <Loading rows={8} />
      </>
    );
  }

  const maxSignups = Math.max(1, ...data.signups.map((s) => s.count));
  const signups30 = data.signups.reduce((n, s) => n + s.count, 0);
  const updated = new Date(dataUpdatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <PageTitle title="Overview">Everything on Ọbaifo at a glance · updated {updated}, refreshes every 15 seconds</PageTitle>

      <StatBand>
        <Stat
          label="Online now"
          value={
            <span className="inline-flex items-center gap-3">
              <span className="live-dot" aria-hidden />
              {num(data.live.online)}
            </span>
          }
          hint={`${num(data.live.signedIn)} signed in · ${num(data.live.guests)} guests`}
        />
        <Stat label="Reading a tale now" value={num(data.live.reading)} hint="Have a chapter open" />
        <Stat label="Users" value={num(data.users.total)} hint={`+${num(data.users.new7d)} this week`} />
        <Stat label="Storytellers" value={num(data.users.authors)} hint={`${num(data.users.admins)} admins · ${num(data.users.suspended)} suspended`} />
        <Stat label="Published tales" value={num(data.works.published)} hint={`${num(data.works.drafts)} drafts · ${num(data.works.chapters)} chapters`} />
        <Stat label="Total reads" value={num(data.works.reads)} hint="Opens of a tale's first chapter" />
        <Stat label="Likes · Comments" value={`${num(data.engagement.likes)} · ${num(data.engagement.comments)}`} hint={`${num(data.engagement.comments7d)} comments this week`} />
        <Stat label="Donations" value={naira(data.donations.totalKobo)} hint={`${num(data.donations.count)} gifts · ${naira(data.donations.totalKobo30d)} in 30 days`} />
      </StatBand>

      <div className="mt-10 grid gap-10 xl:grid-cols-2">
        <Card title="Being read right now" actions={<Link href="/live" className="text-sm font-semibold underline decoration-char/40 hover:decoration-char">See everyone</Link>}>
          {live.data && live.data.tales.length > 0 ? (
            <ul className="divide-y divide-rule">
              {live.data.tales.slice(0, 6).map(({ work, readers }) => (
                <li key={work.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div lang="ig" className="truncate font-tale text-base font-semibold">{work.title}</div>
                    <div className="text-xs text-char-soft">by {work.author}</div>
                  </div>
                  <Badge tone="live">
                    {readers} {readers === 1 ? "reader" : "readers"}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-char-soft">No one has a tale open right now.</p>
          )}
        </Card>

        <Card title={`Sign-ups, last 30 days · ${num(signups30)}`} actions={<span className="text-xs text-char-soft">Most in one day: {num(maxSignups)}</span>}>
          <div className="flex h-36 items-end gap-[3px] pt-5" role="img" aria-label={`${signups30} sign-ups in the last 30 days`}>
            {data.signups.map((s) => (
              <div key={s.day} className="group flex h-full flex-1 items-end" title={`${date(s.day)}: ${s.count}`}>
                <div
                  className={s.count ? "w-full bg-earth transition-colors duration-200 group-hover:bg-ochre" : "w-full bg-char/12"}
                  style={{ height: s.count ? `${Math.max(4, (s.count / maxSignups) * 100)}%` : "2px" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-char-soft">
            <span>{date(data.signups[0]?.day ?? new Date().toISOString())}</span>
            <span>Today</span>
          </div>
        </Card>
      </div>

      <Card title="Most-read tales" className="mt-10" actions={<Link href="/tales" className="text-sm font-semibold underline decoration-char/40 hover:decoration-char">All tales</Link>}>
        <Table head={["Tale", "Storyteller", "Reads", "Likes", "Comments"]} empty={data.topWorks.length === 0 && "No published tales yet. They appear here once a storyteller publishes."}>
          {data.topWorks.map((w) => (
            <tr key={w.id}>
              <Td>
                <span lang="ig" className="font-tale text-[0.95rem] font-semibold">{w.title}</span>
              </Td>
              <Td label="Storyteller">{w.author ? <Link href={`/users/${w.author.id}`} className="hover:underline">{w.author.name}</Link> : "—"}</Td>
              <Td label="Reads">{num(w.reads)}</Td>
              <Td label="Likes">{num(w.likes)}</Td>
              <Td label="Comments">{num(w.comments)}</Td>
            </tr>
          ))}
        </Table>
      </Card>

      {insights.data && (
        <div className="mt-14">
          <Kinds kinds={insights.data.kinds} />
        </div>
      )}
    </>
  );
}
