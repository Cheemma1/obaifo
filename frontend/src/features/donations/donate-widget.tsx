"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useEffect, useState } from "react";
import { CloseIcon, GiftIcon } from "@/shared/ui/primitives";
import { useDonationStats } from "./api";
import { DonateForm } from "./donate-form";

/** Small gift button, bottom-right. Opens a panel to support Ọbaifo. */
export function DonateWidget() {
  const pathname = stripLocale(usePathname());
  const { t } = useI18n();
  const w = t.donate.widget;
  const [open, setOpen] = useState(false);
  const { data: stats } = useDonationStats();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Stay out of the way while reading, and don't duplicate the full donate page.
  if (pathname.startsWith("/read/") || pathname.startsWith("/donate"))
    return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <div
          role="dialog"
          aria-label={w.dialog}
          className="tone-nzu max-h-[calc(100svh-7rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto border-4 border-char p-6 shadow-[0_18px_40px_-16px_rgb(26_20_16/0.45)]"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-extrabold leading-tight">{w.title}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={w.close}
              className="-mr-2 -mt-1 p-2 hover:bg-nzu-deep"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{w.body}</p>
          {stats && stats.supporters > 0 && (
            <p className="mt-2 text-sm font-semibold text-earth">
              {w.supporters(stats.supporters)}
            </p>
          )}
          <div className="mt-5">
            <DonateForm compact />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? w.closeAria : w.openAria}
        className="flex min-h-11 items-center gap-2 border-2 border-nzu bg-char px-4 text-sm font-semibold text-nzu shadow-[0_8px_20px_-10px_rgb(26_20_16/0.6)] transition-colors hover:bg-ochre hover:text-char"
      >
        {open ? <CloseIcon className="size-4" /> : <GiftIcon />}
        <span>{open ? w.buttonClose : w.button}</span>
      </button>
    </div>
  );
}
