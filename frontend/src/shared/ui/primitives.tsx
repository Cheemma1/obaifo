import Link from "@/i18n/link";
import type { ButtonHTMLAttributes, ComponentProps, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { initials } from "../lib/format";
import { cn } from "../lib/cn";
import { UliSnake } from "./uli";

/**
 * Buttons are painted blocks with square corners. Hover lights them ochre,
 * the one colour reserved for what is live.
 *  - solid: charcoal block, works on every wall
 *  - light: nzu block, for charcoal and earth walls
 *  - outline: a painted frame in the current ink
 */
type Variant = "solid" | "light" | "outline";

const variants: Record<Variant, string> = {
  solid: "bg-char text-nzu hover:bg-ochre hover:text-char",
  light: "bg-nzu text-char hover:bg-ochre",
  outline: "border-2 border-current hover:bg-ochre hover:border-ochre hover:text-char",
};

const base =
  "group inline-flex min-h-12 items-center justify-center gap-3 px-6 py-3 text-[0.95rem] font-semibold transition-colors duration-200 ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-45";

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5", className)} aria-hidden>
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export function Button({
  variant = "solid",
  arrow,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; arrow?: boolean }) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  arrow,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; arrow?: boolean }) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** Initials on a square of earth, charcoal or ochre, picked from the person's hue. */
export function Avatar({ name, hue, className }: { name: string; hue: number; className?: string }) {
  const grounds = ["bg-earth text-nzu", "bg-char text-nzu", "bg-nzu-deep text-char", "bg-earth-deep text-nzu"];
  return (
    <span
      className={cn("inline-flex size-10 shrink-0 items-center justify-center text-[0.8rem] font-bold", grounds[Math.abs(hue) % grounds.length], className)}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <span className="mt-1.5 block text-sm font-medium text-earth">{error}</span> : hint ? <span className="mt-1.5 block text-sm text-muted">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full border-2 border-char/70 bg-nzu px-4 py-3 text-base text-char outline-none transition-colors placeholder:text-char-soft/80 hover:border-char focus:border-char focus:bg-white/60";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "resize-y leading-relaxed", props.className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-current opacity-[0.08]", className)} />;
}

export function Notice({ tone = "neutral", children }: { tone?: "neutral" | "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "border-2 px-4 py-3 text-sm font-medium",
        tone === "error" && "border-earth bg-earth/10 text-earth-deep",
        tone === "success" && "border-char bg-nzu-deep text-char",
        tone === "neutral" && "border-rule bg-nzu-deep text-char",
      )}
    >
      {children}
    </div>
  );
}

/** Every inner page opens on a short earth wall carrying its title. */
export function PageHeader({ title, children, aside }: { title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="tone-earth plinth overflow-hidden px-5 pb-16 pt-12 md:px-10 md:pb-20 md:pt-16">
      <div className="mx-auto grid max-w-[90rem] gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h1 className="display text-[clamp(3rem,8vw,6.5rem)]">{title}</h1>
          {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{children}</div>}
        </div>
        {aside && <div className="md:col-span-4">{aside}</div>}
      </div>
      <UliSnake className="mx-auto mt-10 block h-6 w-full max-w-[90rem] text-nzu/70" />
    </header>
  );
}

/** Small drawn icons, one stroke weight, used in place of emoji. */
export function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 shrink-0", className)} aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2 0 3.5 1.1 5.1 3 1.6-1.9 3.1-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpeechIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 shrink-0", className)} fill="none" aria-hidden>
      <path d="M4 5h16v11H10l-5 4v-4H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 shrink-0", className)} fill="none" aria-hidden>
      <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1-3-5-4-5-1.5S12 7 12 7Zm0 0c1-3 5-4 5-1.5S12 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5 shrink-0", className)} fill="none" aria-hidden>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}
