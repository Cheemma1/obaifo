"use client";

import { useState, type FormEvent } from "react";
import { useSession } from "@/features/auth/api";
import { useErrorText } from "@/i18n/errors";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/shared/lib/cn";
import { naira } from "@/shared/lib/format";
import { Button, Notice } from "@/shared/ui/primitives";
import { useStartDonation } from "./api";

const PRESETS = [100_000, 250_000, 500_000, 1_000_000]; // kobo: ₦1k, ₦2.5k, ₦5k, ₦10k
const MIN_NAIRA = 500;

export function DonateForm({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const d = t.donate;
  const errorText = useErrorText();
  const { data: session } = useSession();
  const user = session?.user;
  const start = useStartDonation();
  const [preset, setPreset] = useState<number | null>(PRESETS[1]!);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const amountKobo = preset ?? Math.round(Number(custom || 0) * 100);
  const valid = amountKobo >= MIN_NAIRA * 100;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    start.mutate(
      user
        ? { amountKobo }
        : { amountKobo, name: name.trim(), email: email.trim() },
    );
  };

  const field =
    "w-full border-2 border-char/70 bg-nzu px-3 py-2.5 text-base outline-none placeholder:text-char-soft/80 hover:border-char focus:border-char";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset>
        <legend className="text-sm font-semibold">{d.howMuch}</legend>
        <div
          className={cn(
            "mt-3 grid gap-2",
            compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {PRESETS.map((kobo) => (
            <button
              key={kobo}
              type="button"
              onClick={() => {
                setPreset(kobo);
                setCustom("");
              }}
              aria-pressed={preset === kobo}
              className={cn(
                "min-h-11 border-2 text-base font-semibold tabular-nums transition-colors",
                preset === kobo
                  ? "border-char bg-ochre text-char"
                  : "border-char/40 hover:border-char",
              )}
            >
              {naira(kobo)}
            </button>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-2 border-2 border-char/70 bg-nzu px-3 focus-within:border-char hover:border-char">
          <span className="font-semibold text-muted">₦</span>
          <input
            inputMode="numeric"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value.replace(/[^\d]/g, "").slice(0, 7));
              setPreset(null);
            }}
            placeholder={d.other}
            aria-label={d.otherAria}
            className="w-full bg-transparent py-2.5 text-base outline-none placeholder:text-char-soft/80"
          />
        </label>
        {preset === null && custom && !valid && (
          <p className="mt-1.5 text-sm font-medium text-earth">
            {d.minimum(naira(MIN_NAIRA * 100))}
          </p>
        )}
      </fieldset>

      {!user && (
        <div className="grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={d.name}
            aria-label={d.name}
            maxLength={80}
            className={field}
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={d.email}
            aria-label={d.email}
            className={field}
          />
        </div>
      )}

      {start.isError && <Notice tone="error">{errorText(start.error)}</Notice>}

      <Button
        type="submit"
        arrow
        disabled={!valid || start.isPending}
        className="w-full"
      >
        {start.isPending
          ? d.opening
          : valid
            ? d.give(naira(amountKobo))
            : d.choose}
      </Button>
      <p className="text-sm leading-relaxed text-muted">{d.footnote}</p>
    </form>
  );
}
