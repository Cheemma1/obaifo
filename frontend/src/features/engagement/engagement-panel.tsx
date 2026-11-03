"use client";

import { useI18n } from "@/i18n/provider";
import { Comments } from "./comments";
import { LikeButton } from "./like-button";
import { ShareBar } from "./share-bar";

/** Like, share and discuss: shown under a finished tale, always on nzu whatever the reader theme. */
export function EngagementPanel({ slug, title, workAuthorId }: { slug: string; title: string; workAuthorId?: string }) {
  const { t } = useI18n();
  return (
    <div className="tone-nzu border-t-4 border-char">
      <div className="mx-auto max-w-[40rem] px-5 py-16">
        <div className="flex flex-col gap-8 border-b-2 border-rule pb-10">
          <div>
            <h2 className="text-2xl font-extrabold">{t.engagement.enjoy}</h2>
            <LikeButton slug={slug} className="mt-4" />
          </div>
          <ShareBar slug={slug} title={title} />
        </div>
        <div className="pt-10">
          <Comments slug={slug} workAuthorId={workAuthorId} />
        </div>
      </div>
    </div>
  );
}
