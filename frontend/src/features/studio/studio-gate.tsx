"use client";

import type { ReactNode } from "react";
import { useBecomeAuthor } from "@/features/auth/api";
import { RequireAuth } from "@/features/auth/require-auth";
import { useErrorText } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import { Button, Notice } from "@/shared/ui/primitives";
import type { User } from "@/shared/types";

function BecomeAuthor() {
  const become = useBecomeAuthor();
  const { t } = useI18n();
  const errorText = useErrorText();
  const g = t.studio.gate;
  return (
    <div className="tone-nzu px-5 py-20 md:px-10">
      <div className="mx-auto max-w-[90rem]">
      <div className="max-w-2xl border-t-4 border-char pt-8">
      <p className="display text-5xl">{g.title}</p>
      <p className="mt-5 text-lg text-muted">{g.body}</p>
      <Button className="mt-8" arrow disabled={become.isPending} onClick={() => become.mutate(undefined)}>
        {g.become}
      </Button>
      {become.isError && (
        <div className="mt-4">
          <Notice tone="error">{errorText(become.error)}</Notice>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}

export function StudioGate({ next, children }: { next: string; children: (user: User) => ReactNode }) {
  return <RequireAuth next={next}>{(user) => (user.role === "author" ? children(user) : <BecomeAuthor />)}</RequireAuth>;
}
