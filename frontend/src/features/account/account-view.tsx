"use client";

import { useState, type FormEvent } from "react";
import { RequireAuth } from "@/features/auth/require-auth";
import {
  useBecomeAuthor,
  useLogout,
  useUpdateProfile,
} from "@/features/auth/api";
import Link from "@/i18n/link";
import { useI18n, useLocaleRouter } from "@/i18n/provider";
import { errorMessage } from "@/shared/lib/api-client";
import { longDate } from "@/shared/lib/format";
import {
  Avatar,
  Button,
  Field,
  Input,
  Notice,
  Textarea,
} from "@/shared/ui/primitives";
import type { User } from "@/shared/types";

function ProfileForm({ user }: { user: User }) {
  const { t } = useI18n();
  const a = t.account;
  const update = useUpdateProfile();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");

  const dirty = name.trim() !== user.name || bio.trim() !== (user.bio ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({ name: name.trim(), bio: bio.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <h2 className="text-2xl font-extrabold">{a.edit}</h2>
      <Field label={a.name}>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={80}
          required
          autoComplete="name"
        />
      </Field>
      <Field label={a.bio} hint={a.bioHint}>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={600}
          rows={5}
        />
      </Field>
      {update.isError && (
        <Notice tone="error">{errorMessage(update.error)}</Notice>
      )}
      {update.isSuccess && !dirty && <Notice tone="success">{a.saved}</Notice>}
      <Button type="submit" disabled={!dirty || update.isPending}>
        {update.isPending ? a.saving : a.save}
      </Button>
    </form>
  );
}

function Account({ user }: { user: User }) {
  const { t, locale } = useI18n();
  const a = t.account;
  const router = useLocaleRouter();
  const logout = useLogout();
  const become = useBecomeAuthor();

  return (
    <div className="tone-nzu px-5 pb-28 pt-12 md:px-10 md:pt-16">
      <div className="mx-auto grid max-w-[90rem] gap-12 md:grid-cols-12">
        <section className="md:col-span-5">
          <div className="flex items-center gap-5 border-t-4 border-char pt-8">
            <Avatar
              name={user.name}
              hue={user.avatarHue}
              className="size-20 text-2xl"
            />
            <div className="min-w-0">
              <p className="truncate text-3xl font-extrabold leading-tight">
                {user.name}
              </p>
              <p className="text-muted">{a.roles[user.role]}</p>
            </div>
          </div>

          <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-muted">
            {a.details}
          </h2>
          <dl className="mt-3 border-t-2 border-char">
            {[
              [a.email, user.email],
              [a.role, a.roles[user.role]],
              [
                a.since,
                longDate(user.createdAt, locale === "ig" ? "ig-NG" : "en-GB"),
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b-2 border-rule py-3"
              >
                <dt className="font-semibold">{k}</dt>
                <dd className="break-all text-muted">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col items-start gap-4">
            <Link href="/library" className="link font-medium">
              {t.nav.shelf}
            </Link>
            {user.role === "author" ? (
              <>
                <Link href="/studio" className="link font-medium">
                  {t.nav.studio}
                </Link>
                <Link href={`/authors/${user.id}`} className="link font-medium">
                  {a.publicPage}
                </Link>
              </>
            ) : (
              <div>
                <Button
                  variant="outline"
                  disabled={become.isPending}
                  onClick={() =>
                    become.mutate(undefined, {
                      onSuccess: () => router.push("/studio"),
                    })
                  }
                >
                  {a.becomeAuthor}
                </Button>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  {a.becomeAuthorHint}
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 border-t-2 border-rule pt-6">
            <Button
              variant="solid"
              disabled={logout.isPending}
              onClick={() =>
                logout.mutate(undefined, { onSuccess: () => router.push("/") })
              }
            >
              {t.nav.signOut}
            </Button>
            <p className="mt-2 text-sm text-muted">{a.signOutHint}</p>
          </div>
        </section>

        <section className="border-t-4 border-char pt-8 md:col-span-6 md:col-start-7">
          <ProfileForm user={user} />
        </section>
      </div>
    </div>
  );
}

export function AccountView() {
  return (
    <RequireAuth next="/account">
      {(user) => <Account user={user} />}
    </RequireAuth>
  );
}
