"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/shared/lib/cn";

/*
 * X, Facebook and LinkedIn accept a share URL. Instagram and TikTok have no web
 * share links, so for those we open the phone's share sheet when available
 * (which lists both apps), otherwise copy the link with a hint on where to paste it.
 */

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
    {children}
  </svg>
);

const ICONS = {
  x: (
    <Icon>
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
    </Icon>
  ),
  facebook: (
    <Icon>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.6-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3Z" />
    </Icon>
  ),
  linkedin: (
    <Icon>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.55h.05c.53-1 1.84-2.05 3.78-2.05 4.05 0 4.8 2.66 4.8 6.12V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.63V21h-4V9.75Z" />
    </Icon>
  ),
  tiktok: (
    <Icon>
      <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7.2 7.2 0 0 1-3.8-1.2v5.9c0 3.7-2.6 6.5-6.2 6.5A6 6 0 0 1 4.5 15c0-3.6 3-6.3 6.8-5.9v3.1c-1.7-.4-3.7.6-3.7 2.8 0 1.6 1.2 2.9 2.9 2.9 1.9 0 3-1.3 3-3.5V3h3.1Z" />
    </Icon>
  ),
  instagram: (
    <Icon>
      <path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.6c2.7 0 3 0 4.1.1 2.8.1 4.1 1.4 4.2 4.2.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.8-1.4 4.1-4.2 4.2-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.8-.1-4.1-1.4-4.2-4.2-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1C3.8 5.1 5.1 3.8 7.9 3.7c1.1-.1 1.4-.1 4.1-.1Zm0-1.6c-2.7 0-3.1 0-4.2.1C4 2.3 2.3 4 2.1 7.8 2 8.9 2 9.3 2 12s0 3.1.1 4.2c.2 3.8 1.9 5.5 5.7 5.7 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c3.8-.2 5.5-1.9 5.7-5.7.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2C21.7 4 20 2.3 16.2 2.1 15.1 2 14.7 2 12 2Z" />
    </Icon>
  ),
  link: (
    <Icon>
      <path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0Zm-2.8 4.9a3.5 3.5 0 0 1-2.5-6l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1a1.5 1.5 0 0 0 2.1 2.1l2.1-2.1a1 1 0 0 1 1.4 1.4l-2.1 2.1a3.5 3.5 0 0 1-2.4 1.1Zm8.5-5.7a1 1 0 0 1-.7-1.7l2.1-2.1a1.5 1.5 0 0 0-2.1-2.1l-2.1 2.1a1 1 0 1 1-1.4-1.4l2.1-2.1a3.5 3.5 0 1 1 4.9 4.9L17 12.3a1 1 0 0 1-.7.3Z" />
    </Icon>
  ),
};

type Network = keyof typeof ICONS;

export function ShareBar({ slug, title, className }: { slug: string; title: string; className?: string }) {
  const { t } = useI18n();
  const e = t.engagement;
  const [toast, setToast] = useState<string | null>(null);

  const url = () => `${window.location.origin}/stories/${slug}`;
  const text = e.shareText(title);

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  };

  const copy = async (hint: string) => {
    try {
      await navigator.clipboard.writeText(url());
      flash(hint);
    } catch {
      flash(url());
    }
  };

  const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer,width=640,height=640");

  const share = async (network: Network) => {
    const u = encodeURIComponent(url());
    const t = encodeURIComponent(text);
    switch (network) {
      case "x":
        return open(`https://x.com/intent/post?text=${t}&url=${u}`);
      case "facebook":
        return open(`https://www.facebook.com/sharer/sharer.php?u=${u}`);
      case "linkedin":
        return open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`);
      case "instagram":
      case "tiktok": {
        const app = network === "instagram" ? "Instagram" : "TikTok";
        if (navigator.share) {
          try {
            await navigator.share({ title, text, url: url() });
            return;
          } catch {
            // Share sheet dismissed: fall through to copying.
          }
        }
        return copy(e.pasteHint(app));
      }
      case "link":
        return copy(e.copied);
    }
  };

  const items: { network: Network; label: string }[] = [
    { network: "x", label: "X" },
    { network: "facebook", label: "Facebook" },
    { network: "linkedin", label: "LinkedIn" },
    { network: "tiktok", label: "TikTok" },
    { network: "instagram", label: "Instagram" },
    { network: "link", label: e.copyLink },
  ];

  return (
    <div className={cn("relative", className)}>
      <h2 className="text-lg font-bold">{e.shareTitle}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map(({ network, label }) => (
          <li key={network}>
            <button
              type="button"
              onClick={() => share(network)}
              aria-label={network === "link" ? e.copyLink : e.shareOn(label)}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-char/30 px-3.5 text-sm font-semibold transition-colors duration-200 hover:border-char hover:bg-char hover:text-nzu"
            >
              {ICONS[network]}
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {toast && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm font-semibold text-earth"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
