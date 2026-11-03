"use client";

import clsx from "clsx";
import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { errorMessage } from "@/lib/api";
import { initials } from "@/lib/format";

export const cn = clsx;

/**
 * Painted blocks with square corners, as on the reader site. Hover lights them
 * ochre, the one colour kept for what is under your pointer or current.
 */
type Variant = "solid" | "outline" | "danger" | "ghost";
const variants: Record<Variant, string> = {
  solid: "bg-char text-nzu hover:bg-ochre hover:text-char",
  outline: "border-2 border-char/35 hover:border-ochre hover:bg-ochre",
  danger: "bg-earth text-nzu hover:bg-earth-deep",
  ghost: "hover:bg-char/6",
};

const control =
  "inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-45 md:h-9 md:px-3.5";

export function Button({ variant = "solid", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(control, variants[variant], className)} {...props} />;
}

const field =
  "h-11 border-2 border-char/60 bg-nzu px-3 text-sm text-char outline-none transition-colors placeholder:text-char-soft hover:border-char focus:border-char focus:bg-white/70 md:h-9";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(field, props.className)} />;
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(field, "cursor-pointer pr-8", props.className)}>
      {children}
    </select>
  );
}

type Tone = "neutral" | "live" | "earth" | "ochre" | "char";
const tones: Record<Tone, string> = {
  neutral: "bg-char/8 text-char-soft",
  live: "bg-live/12 text-live",
  earth: "bg-earth/12 text-earth-deep",
  ochre: "bg-ochre/30 text-char",
  char: "bg-char text-nzu",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap", tones[tone])}>{children}</span>
  );
}

/** Initials on a square of earth, charcoal or limewash, picked from the person's hue. */
export function Avatar({ name, hue, className }: { name: string; hue: number; className?: string }) {
  const grounds = ["bg-earth text-nzu", "bg-char text-nzu", "bg-nzu-deep text-char", "bg-earth-deep text-nzu"];
  return (
    <span
      className={cn("inline-flex size-8 shrink-0 items-center justify-center text-[0.7rem] font-bold", grounds[Math.abs(hue) % grounds.length], className)}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function PageTitle({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="narrow text-[2rem] leading-none font-extrabold">{title}</h1>
        {children && <p className="mt-2 text-sm leading-relaxed text-char-soft">{children}</p>}
      </div>
      {actions}
    </div>
  );
}

/** A section of the wall: a heading on a 2px charcoal rule, then its content, no box. */
export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("min-w-0", className)}>
      {title && (
        <header className="flex items-end justify-between gap-3 border-b-2 border-char pb-2">
          <h2 className="text-[0.95rem] font-bold">{title}</h2>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

/** Numbers set in one ruled band under a 4px charcoal rule, divided by painted lines. */
export function StatBand({ children, className, ruled = true }: { children: ReactNode; className?: string; ruled?: boolean }) {
  return (
    <div className={cn("grid grid-cols-2 gap-px bg-rule pb-px lg:grid-cols-4", ruled && "border-t-4 border-char", className)}>{children}</div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="bg-nzu px-4 py-4 first:pl-0 lg:[&:nth-child(4n+1)]:pl-0 max-lg:[&:nth-child(odd)]:pl-0">
      <div className="text-xs font-semibold text-char-soft">{label}</div>
      <div className="narrow mt-1 text-[2rem] leading-none font-extrabold">{value}</div>
      {hint && <div className="mt-1.5 text-xs text-char-soft">{hint}</div>}
    </div>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: false | string }) {
  return (
    <div className="md:overflow-x-auto">
      <table className="rtable w-full text-left text-sm">
        <thead className="text-[0.7rem] tracking-wide text-char-soft uppercase">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="py-2.5 pr-4 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rule border-t border-rule">{children}</tbody>
      </table>
      {empty && <p className="border-t border-rule py-10 text-center text-sm text-char-soft">{empty}</p>}
    </div>
  );
}

export const Td = ({ children, className, label }: { children?: ReactNode; className?: string; label?: string }) => (
  <td data-label={label} className={cn("py-3 pr-4 align-middle", className)}>
    {children}
  </td>
);

export function Pagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between gap-3 border-t-2 border-char pt-3 text-sm text-char-soft">
      <span>
        {total === 0 ? "None" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

/** Filters and search sit on one row above what they scope. */
export function Toolbar({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 [&>select]:min-w-0 [&>select]:flex-1 sm:[&>select]:flex-none">
      {children}
      <span className={cn("text-xs text-char-soft transition-opacity", busy ? "opacity-100" : "opacity-0")} aria-live="polite">
        {busy ? "Loading…" : ""}
      </span>
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  return (
    <div role="alert" className="border-2 border-earth bg-earth/10 px-4 py-3 text-sm font-medium text-earth-deep">
      {errorMessage(error)}
    </div>
  );
}

export function Notice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "live" | "earth" }) {
  return (
    <div
      role="status"
      className={cn(
        "border-2 px-4 py-3 text-sm",
        tone === "neutral" && "border-rule bg-nzu-deep",
        tone === "live" && "border-live/40 bg-live/10",
        tone === "earth" && "border-earth bg-earth/10 text-earth-deep",
      )}
    >
      {children}
    </div>
  );
}

export function Loading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-px border-t border-rule pt-px" aria-busy aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-11 animate-pulse bg-char/6" />
      ))}
    </div>
  );
}

/** Search box that only fires after the admin stops typing. */
export function SearchInput({ onSearch, placeholder }: { onSearch: (q: string) => void; placeholder: string }) {
  const [value, setValue] = useState("");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => onSearch(value.trim()), 300);
    return () => clearTimeout(t);
  }, [value, onSearch]);
  return (
    <Input
      type="search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full sm:w-72"
    />
  );
}

/**
 * A confirm step for anything destructive. When `typeToConfirm` is set the admin
 * must type that word before the button unlocks; `withReason` adds a reason box.
 */
export function ConfirmButton({
  label,
  title,
  body,
  confirmLabel,
  variant = "danger",
  typeToConfirm,
  withReason,
  onConfirm,
  disabled,
}: {
  label: ReactNode;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  variant?: Variant;
  typeToConfirm?: string;
  withReason?: boolean;
  onConfirm: (reason: string) => Promise<unknown>;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const open = () => {
    setTyped("");
    setReason("");
    setError(null);
    ref.current?.showModal();
  };
  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      ref.current?.close();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  const locked = !!typeToConfirm && typed.trim() !== typeToConfirm;
  const danger = variant === "danger";

  return (
    <>
      <Button
        variant={danger ? "outline" : variant}
        className={danger ? "border-earth/50 text-earth-deep hover:border-earth hover:bg-earth hover:text-nzu" : undefined}
        onClick={open}
        disabled={disabled}
      >
        {label}
      </Button>
      <dialog ref={ref} className="m-auto w-[min(92vw,30rem)] bg-nzu p-0 text-char shadow-[0_18px_40px_-16px_rgb(26_20_16/0.5)]">
        <div className="border-t-4 border-char p-5">
          <h2 className="narrow text-xl font-extrabold">{title}</h2>
          <div className="mt-2 text-sm leading-relaxed text-char-soft">{body}</div>
          {withReason && (
            <label className="mt-4 block text-sm font-semibold">
              Reason <span className="font-normal text-char-soft">(only admins see this)</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3} className={cn(field, "mt-1.5 h-auto w-full py-2 md:h-auto")} />
            </label>
          )}
          {typeToConfirm && (
            <label className="mt-4 block text-sm font-semibold">
              Type <span className="text-earth-deep">{typeToConfirm}</span> to confirm
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-1.5 w-full" autoFocus />
            </label>
          )}
          {error !== null && (
            <div className="mt-4">
              <ErrorBox error={error} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 bg-nzu-deep px-5 py-3">
          <Button variant="ghost" onClick={() => ref.current?.close()}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "solid"} onClick={confirm} disabled={busy || locked}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
