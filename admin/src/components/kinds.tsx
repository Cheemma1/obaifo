"use client";

import type { ReactNode } from "react";
import { num, THEME_LABELS } from "@/lib/format";
import type { Insights, KindAdvice } from "@/lib/types";
import { Badge } from "./ui";

/** A question as a section heading, with its one-sentence answer underneath. */
function Question({ title, answer, children, aside }: { title: string; answer: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-4 border-char pb-3">
        <div className="max-w-3xl">
          <h2 className="narrow text-2xl leading-none font-extrabold">{title}</h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed">{answer}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

// ---------- 4. What should storytellers write next? ----------

const ADVICE: Record<KindAdvice, { label: string; tone: "live" | "earth" | "ochre" | "neutral" }> = {
  "write-more": { label: "Ask for more", tone: "live" },
  missing: { label: "No tales yet", tone: "ochre" },
  enough: { label: "Enough for now", tone: "neutral" },
  steady: { label: "Balanced", tone: "neutral" },
};

export function Kinds({ kinds }: { kinds: Insights["kinds"] }) {
  const top = kinds.items.find((k) => k.advice === "write-more");
  const missing = kinds.items.filter((k) => k.advice === "missing");
  const max = Math.max(1, ...kinds.items.map((k) => k.perTale));
  const basis = kinds.basis === "30d" ? "reads in the last 30 days" : "all-time reads (not enough recent reads yet)";
  return (
    <Question
      title="What should storytellers write next?"
      answer={
        top ? (
          <>
            Ask storytellers for more <strong>{THEME_LABELS[top.theme].toLowerCase()}</strong>: each one gets {top.ratio}× the reads of an average tale, and there {top.tales === 1 ? "is only 1" : `are only ${top.tales}`}.
            {missing.length > 0 && <> No one has written {missing.map((k) => THEME_LABELS[k.theme].toLowerCase()).join(" or ")} yet.</>}
          </>
        ) : missing.length ? (
          <>No one has written {missing.map((k) => THEME_LABELS[k.theme].toLowerCase()).join(" or ")} yet. Those are the gaps in the archive.</>
        ) : (
          <>Readers are spread evenly across the kinds of tale; no kind is short of tales.</>
        )
      }
    >
      <ul className="divide-y divide-rule">
        {kinds.items.map((k) => (
          <li key={k.theme} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 md:grid-cols-[12rem_minmax(0,1fr)_7rem_8rem]">
            <div className="font-semibold">{THEME_LABELS[k.theme]}</div>
            <div className="col-span-2 row-start-2 flex items-center gap-3 md:col-span-1 md:row-start-auto">
              <div className="h-3 flex-1 bg-char/8">
                <div className="h-full bg-earth" style={{ width: `${(k.perTale / max) * 100}%` }} />
              </div>
              <span className="w-24 shrink-0 text-right text-xs text-char-soft">{num(k.perTale)} per tale</span>
            </div>
            <div className="hidden text-sm text-char-soft md:block">{k.tales === 1 ? "1 tale" : `${k.tales} tales`}</div>
            <div className="justify-self-end md:justify-self-start">
              <Badge tone={ADVICE[k.advice].tone}>{ADVICE[k.advice].label}</Badge>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-char-soft">Demand is {basis}, divided by how many published tales of that kind exist. Average: {num(kinds.avgPerTale)} per tale.</p>
    </Question>
  );
}
