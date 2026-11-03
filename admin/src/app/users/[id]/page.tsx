"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Badge, Button, Card, ConfirmButton, ErrorBox, Loading, Notice, Table, Td } from "@/components/ui";
import { UliThread } from "@/components/uli";
import { ago, date, dateTime, device, naira, num, SITE_URL } from "@/lib/format";
import { useDeleteUser, useDeleteWork, useSession, useSignOutUser, useSuspendUser, useUnsuspendUser, useUpdateUser, useUser } from "@/lib/queries";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user, error, isLoading } = useUser(id);
  const { data: session } = useSession();
  const update = useUpdateUser();
  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();
  const signOut = useSignOutUser();
  const remove = useDeleteUser();
  const removeWork = useDeleteWork();
  const [notice, setNotice] = useState<string | null>(null);

  if (error) return <ErrorBox error={error} />;
  if (isLoading || !user) return <Loading rows={8} />;

  const self = session?.user?.id === user.id;
  const actionError = update.error ?? unsuspend.error ?? signOut.error;

  return (
    <>
      <Link href="/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-char-soft hover:text-char">
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
          <path d="M15 8H2M7 3L2 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" />
        </svg>
        All users
      </Link>

      <header className="mt-5 mb-7 flex items-center gap-4">
        <Avatar name={user.name} hue={user.avatarHue} className="size-14 text-base" />
        <div className="min-w-0">
          <h1 className="narrow truncate text-[2rem] leading-none font-extrabold">{user.name}</h1>
          <div className="mt-1 truncate text-sm text-char-soft">{user.email}</div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Badge tone={user.role === "author" ? "ochre" : "neutral"}>{user.role === "author" ? "Storyteller" : "Reader"}</Badge>
            {user.isAdmin && <Badge tone="char">Admin</Badge>}
            {user.suspendedAt ? <Badge tone="earth">Suspended {date(user.suspendedAt)}</Badge> : <Badge tone="live">Active</Badge>}
            {user.online ? (
              <Badge tone="live">
                <span className="live-dot scale-75" aria-hidden /> Online now
              </Badge>
            ) : (
              <Badge>{user.lastSeen ? `Last seen ${ago(user.lastSeen)}` : "Not seen on the site yet"}</Badge>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {user.nowReading && (
          <Notice tone="live">
            <div>
              Reading <strong lang="ig" className="font-tale">{user.nowReading.title}</strong>, chapter {(user.nowReading.chapterIndex ?? 0) + 1}, right now.
            </div>
          </Notice>
        )}
        {user.suspendedAt && (
          <Notice tone="earth">
            Suspended on {dateTime(user.suspendedAt)}. {user.suspendReason ? `Reason: ${user.suspendReason}.` : "No reason given."} They can&apos;t sign in, like or comment until you unsuspend them.
          </Notice>
        )}
        {notice && <Notice>{notice}</Notice>}
        {actionError && <ErrorBox error={actionError} />}
      </div>

      <Card title="Controls" className="mt-7">
        <div className="flex flex-wrap gap-2 pt-4">
          {user.role === "reader" ? (
            <Button variant="outline" disabled={update.isPending} onClick={() => update.mutate({ id: user.id, role: "author" })}>
              Make storyteller
            </Button>
          ) : (
            <Button variant="outline" disabled={update.isPending} onClick={() => update.mutate({ id: user.id, role: "reader" })}>
              Make reader
            </Button>
          )}

          {user.isAdmin ? (
            <ConfirmButton
              label="Remove admin"
              title={`Remove admin from ${user.name}?`}
              body="They lose access to this admin app straight away."
              confirmLabel="Remove admin"
              variant="solid"
              disabled={self}
              onConfirm={() => update.mutateAsync({ id: user.id, isAdmin: false })}
            />
          ) : (
            <ConfirmButton
              label="Make admin"
              title={`Make ${user.name} an admin?`}
              body="Admins can see every account and delete users, tales and comments. Only do this for people you trust."
              confirmLabel="Make admin"
              variant="solid"
              typeToConfirm="admin"
              onConfirm={() => update.mutateAsync({ id: user.id, isAdmin: true })}
            />
          )}

          <ConfirmButton
            label="Sign out everywhere"
            title="Sign out every device?"
            body="Every session for this account ends now. They can sign in again unless suspended."
            confirmLabel="Sign out"
            variant="solid"
            disabled={user.sessions.length === 0}
            onConfirm={async () => {
              await signOut.mutateAsync(user.id);
              setNotice("Signed out of every device.");
            }}
          />

          {user.suspendedAt ? (
            <Button variant="outline" disabled={unsuspend.isPending} onClick={() => unsuspend.mutate(user.id)}>
              {unsuspend.isPending ? "Unsuspending…" : "Unsuspend"}
            </Button>
          ) : (
            <ConfirmButton
              label="Suspend"
              title={`Suspend ${user.name}?`}
              body="They're signed out of every device and can't sign in again until you unsuspend them. Their tales stay on the site; unpublish or delete them separately if needed."
              confirmLabel="Suspend account"
              withReason
              disabled={self}
              onConfirm={(reason) => suspend.mutateAsync({ id: user.id, reason })}
            />
          )}

          <ConfirmButton
            label="Delete user"
            title={`Delete ${user.name} for good?`}
            body={
              <>
                This deletes the account and <strong className="text-char">{user.works.length === 1 ? "1 tale" : `${user.works.length} tales`}</strong>, with all their chapters, likes, comments and reading progress. Donation records are kept without the account. This can&apos;t be undone.
              </>
            }
            confirmLabel="Delete forever"
            typeToConfirm="delete"
            disabled={self}
            onConfirm={async () => {
              await remove.mutateAsync(user.id);
              router.replace("/users");
            }}
          />
        </div>
        {self && <p className="mt-3 text-xs text-char-soft">This is your own account, so you can&apos;t suspend, delete or demote it here.</p>}
      </Card>

      <div className="mt-10 grid gap-10 2xl:grid-cols-2">
        <Card title="Account">
          <dl className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 pt-4 text-sm">
            <dt className="text-char-soft">Joined</dt>
            <dd>{dateTime(user.createdAt)}</dd>
            <dt className="text-char-soft">Email verified</dt>
            <dd>{user.emailVerified ? "Yes" : "No"}</dd>
            <dt className="text-char-soft">Likes · Comments</dt>
            <dd>
              {num(user._count.likes)} · {num(user._count.comments)}
            </dd>
            <dt className="text-char-soft">Bio</dt>
            <dd className="whitespace-pre-line">{user.bio || "—"}</dd>
            <dt className="text-char-soft">User id</dt>
            <dd className="text-xs break-all text-char-soft">{user.id}</dd>
          </dl>
        </Card>

        <Card title={`Signed-in devices · ${user.sessions.length}`}>
          <Table head={["Device", "IP address", "Last active"]} empty={user.sessions.length === 0 && "Not signed in on any device."}>
            {user.sessions.map((s) => (
              <tr key={s.id}>
                <Td>{device(s.userAgent)}</Td>
                <Td label="IP address" className="text-xs">{s.ipAddress || "—"}</Td>
                <Td label="Last active" className="text-char-soft">{ago(s.updatedAt)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <Card title={`Tales · ${user.works.length}`} className="mt-10">
        <Table head={["Tale", "Status", "Reads", "Likes", "Comments", "Updated", ""]} empty={user.works.length === 0 && "They haven't written any tales."}>
          {user.works.map((w) => (
            <tr key={w.id}>
              <Td>
                <span lang="ig" className="font-tale font-semibold">{w.title}</span>
              </Td>
              <Td label="Status">{w.status === "published" ? <Badge tone="live">Published</Badge> : <Badge>Draft</Badge>}</Td>
              <Td label="Reads">{num(w.reads)}</Td>
              <Td label="Likes">{num(w.likes)}</Td>
              <Td label="Comments">{num(w.comments)}</Td>
              <Td label="Updated" className="text-char-soft">{date(w.updatedAt)}</Td>
              <Td className="md:text-right">
                <ConfirmButton
                  label="Delete"
                  title="Delete this tale?"
                  body={<>&ldquo;<span lang="ig">{w.title}</span>&rdquo; and all its chapters, likes and comments will be deleted. This can&apos;t be undone.</>}
                  confirmLabel="Delete tale"
                  onConfirm={() => removeWork.mutateAsync(w.id)}
                />
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="mt-10 grid gap-10 2xl:grid-cols-2">
        <Card title="Recent comments">
          {user.comments.length === 0 ? (
            <p className="py-8 text-sm text-char-soft">They haven&apos;t commented on any tale.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {user.comments.map((c) => (
                <li key={c.id} className="py-3 text-sm">
                  <div className="text-xs text-char-soft">
                    On <span lang="ig" className="font-tale font-semibold text-char">{c.work.title}</span> · {ago(c.createdAt)}
                  </div>
                  <p className="mt-1 leading-relaxed whitespace-pre-line">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Reading history">
          <Table head={["Tale", "Progress", "When"]} empty={user.progress.length === 0 && "They haven't saved a place in any tale."}>
            {user.progress.map((p) => (
              <tr key={p.id}>
                <Td>
                  <a lang="ig" href={`${SITE_URL}/stories/${p.work.slug}`} target="_blank" rel="noreferrer" className="font-tale font-semibold hover:underline">
                    {p.work.title}
                  </a>
                </Td>
                <Td label="Progress" className="min-w-40">
                  <div className="text-xs text-char-soft">
                    Chapter {p.chapterIndex + 1} · {Math.round(p.percent)}%
                  </div>
                  <div className="mt-1 max-w-48">
                    <UliThread progress={p.percent / 100} label={`${Math.round(p.percent)}% read`} />
                  </div>
                </Td>
                <Td label="When" className="text-char-soft">{ago(p.updatedAt)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {user.donations.length > 0 && (
        <Card title="Donations" className="mt-10">
          <Table head={["Amount", "Status", "Reference", "When"]}>
            {user.donations.map((d) => (
              <tr key={d.id}>
                <Td className="font-semibold">{naira(d.amountKobo)}</Td>
                <Td label="Status">{d.status}</Td>
                <Td label="Reference" className="text-xs">{d.reference}</Td>
                <Td label="When" className="text-char-soft">{dateTime(d.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </>
  );
}
