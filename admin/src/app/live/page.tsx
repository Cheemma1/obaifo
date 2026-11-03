"use client";

import Link from "next/link";
import { Avatar, Badge, Card, ErrorBox, Loading, PageTitle, Stat, StatBand, Table, Td } from "@/components/ui";
import { UliThread } from "@/components/uli";
import { ago, num, since, SITE_URL } from "@/lib/format";
import { useLive } from "@/lib/queries";

export default function LivePage() {
  const { data, error, isLoading, dataUpdatedAt } = useLive();

  if (error) return <ErrorBox error={error} />;
  if (isLoading || !data) {
    return (
      <>
        <PageTitle title="Live readers" />
        <Loading rows={8} />
      </>
    );
  }

  const signedIn = data.visitors.filter((v) => v.user).length;
  const updated = new Date(dataUpdatedAt).toLocaleTimeString("en-GB");

  return (
    <>
      <PageTitle title="Live readers">
        Open tabs that checked in during the last 75 seconds · updated {updated}, refreshes every 15 seconds
      </PageTitle>

      <StatBand>
        <Stat
          label="Online now"
          value={
            <span className="inline-flex items-center gap-3">
              <span className="live-dot" aria-hidden />
              {num(data.online)}
            </span>
          }
        />
        <Stat label="Reading a tale" value={num(data.reading)} />
        <Stat label="Signed in" value={num(signedIn)} />
        <Stat label="Guests" value={num(data.online - signedIn)} />
      </StatBand>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <Card title="Tales open right now">
          {data.tales.length === 0 ? (
            <p className="py-8 text-sm leading-relaxed text-char-soft">No one has a tale open. Readers show up here within 30 seconds of opening a chapter.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {data.tales.map(({ work, readers }) => (
                <li key={work.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <a lang="ig" href={`${SITE_URL}/stories/${work.slug}`} target="_blank" rel="noreferrer" className="block truncate font-tale font-semibold hover:underline">
                      {work.title}
                    </a>
                    <div className="text-xs text-char-soft">by {work.author}</div>
                  </div>
                  <Badge tone="live">
                    {readers} {readers === 1 ? "reader" : "readers"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Everyone online · ${num(data.online)}`}>
          <Table head={["Who", "Where", "On site for", "Last seen"]} empty={data.visitors.length === 0 && "No one is on the site right now."}>
            {data.visitors.map((v) => {
              const chapter = (v.chapterIndex ?? 0) + 1;
              const total = Math.max(1, v.work?.chapterCount ?? 1);
              return (
                <tr key={v.visitorId}>
                  <Td>
                    {v.user ? (
                      <Link href={`/users/${v.user.id}`} className="flex items-center gap-2.5">
                        <Avatar name={v.user.name} hue={v.user.avatarHue} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold hover:underline">{v.user.name}</span>
                          <span className="block truncate text-xs text-char-soft">{v.user.email}</span>
                        </span>
                      </Link>
                    ) : (
                      <span className="text-char-soft">Guest · {v.visitorId.slice(0, 6)}</span>
                    )}
                  </Td>
                  <Td label="Where" className="min-w-52">
                    {v.work ? (
                      <div>
                        <span lang="ig" className="font-tale font-semibold">{v.work.title}</span>
                        <div className="text-xs text-char-soft">
                          Chapter {chapter} of {total}
                        </div>
                        <div className="mt-1 max-w-56">
                          <UliThread progress={chapter / total} label={`Chapter ${chapter} of ${total}`} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-char-soft">Browsing {v.path}</span>
                    )}
                  </Td>
                  <Td label="On site for" className="whitespace-nowrap text-char-soft">{since(v.startedAt)}</Td>
                  <Td label="Last seen" className="whitespace-nowrap text-char-soft">{ago(v.lastSeen)}</Td>
                </tr>
              );
            })}
          </Table>
        </Card>
      </div>
    </>
  );
}
