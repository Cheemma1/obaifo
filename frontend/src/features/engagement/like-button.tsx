"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSession } from "@/features/auth/api";
import { useI18n, useLocaleRouter } from "@/i18n/provider";
import { compact } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { HeartIcon } from "@/shared/ui/primitives";
import { useLikes, useToggleLike } from "./api";

const BURST = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

export function LikeButton({ slug, className }: { slug: string; className?: string }) {
  const router = useLocaleRouter();
  const { t, intl } = useI18n();
  const { data: session } = useSession();
  const { data } = useLikes(slug);
  const toggle = useToggleLike(slug);
  const liked = data?.liked ?? false;

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? t.engagement.unlikeAria : t.engagement.likeAria}
      onClick={() => {
        if (!session?.user) return router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
        toggle.mutate(!liked);
      }}
      className={cn(
        "relative inline-flex min-h-12 items-center gap-2.5 border-2 px-4 font-semibold transition-colors duration-200",
        liked ? "border-char bg-earth text-nzu" : "border-char hover:bg-nzu-deep",
        className,
      )}
    >
      <span className="relative block size-5">
        <motion.span className="block" animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.4 }}>
          <HeartIcon filled={liked} className="size-5" />
        </motion.span>
        <AnimatePresence>
          {liked &&
            BURST.map((a) => (
              <motion.span
                key={a}
                className="absolute left-1/2 top-1/2 size-1.5 bg-ochre"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: Math.cos(a) * 18, y: Math.sin(a) * 18, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            ))}
        </AnimatePresence>
      </span>
      <span>{liked ? t.engagement.liked : t.engagement.like}</span>
      <span className={cn("tabular-nums", liked ? "text-nzu/85" : "text-muted")}>{compact(data?.likes ?? 0, intl)}</span>
    </button>
  );
}
