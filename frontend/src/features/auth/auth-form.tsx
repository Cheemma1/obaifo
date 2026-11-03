"use client";

import Link from "@/i18n/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useErrorText } from "@/i18n/errors";
import { useI18n, useLocaleRouter } from "@/i18n/provider";
import { cn } from "@/shared/lib/cn";
import { Button, Field, Input, Notice } from "@/shared/ui/primitives";
import type { Role } from "@/shared/types";
import { useLogin, useRegister } from "./api";

/** Only allow same-site relative redirects after sign-in. */
function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function LoginForm() {
  const router = useLocaleRouter();
  const { t } = useI18n();
  const errorText = useErrorText();
  const a = t.auth;
  const params = useSearchParams();
  const login = useLogin();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    login.mutate(
      { email: String(form.get("email")), password: String(form.get("password")) },
      {
        onSuccess: ({ user }) => router.push(safeNext(params.get("next"), user?.role === "author" ? "/studio" : "/library")),
      },
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Field label={a.email}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <div>
        <Field label={a.password}>
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Link href="/forgot-password" className="link mt-2 inline-block text-sm font-semibold text-char">
          {a.login.forgot}
        </Link>
      </div>
      {login.isError && <Notice tone="error">{errorText(login.error)}</Notice>}
      <Button type="submit" arrow disabled={login.isPending} className="w-full">
        {login.isPending ? a.login.pending : a.login.submit}
      </Button>
      <p className="text-muted">
        {a.login.newHere}{" "}
        <Link href={`/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="link font-semibold text-char">
          {a.login.create}
        </Link>
      </p>
    </form>
  );
}

const ROLES: Role[] = ["reader", "author"];

export function RegisterForm() {
  const router = useLocaleRouter();
  const { t } = useI18n();
  const errorText = useErrorText();
  const a = t.auth;
  const params = useSearchParams();
  const register = useRegister();
  const [role, setRole] = useState<Role>(params.get("role") === "author" ? "author" : "reader");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    register.mutate(
      { name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), role },
      { onSuccess: () => router.push(safeNext(params.get("next"), role === "author" ? "/studio/new" : "/stories")) },
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <fieldset>
        <legend className="text-sm font-semibold">{a.register.joiningAs}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {ROLES.map((value) => {
            const r = a.register.roles[value];
            return (
            <label
              key={value}
              className={cn(
                "relative cursor-pointer border-2 p-5 transition-colors duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-char",
                role === value ? "border-char bg-char text-nzu" : "border-char/40 hover:border-char",
              )}
            >
              <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only" />
              <span className="block text-xl font-extrabold">{r.name}</span>
              <span className="mt-1 block text-sm font-semibold">{r.label}</span>
              <span className={cn("mt-3 block text-sm leading-relaxed", role === value ? "text-nzu/80" : "text-muted")}>{r.body}</span>
              {role === value && <span aria-hidden className="absolute right-4 top-4 size-3 bg-ochre" />}
            </label>
            );
          })}
        </div>
      </fieldset>
      <Field label={role === "author" ? a.register.penName : a.register.name}>
        <Input name="name" autoComplete="name" required minLength={2} />
      </Field>
      <Field label={a.email}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label={a.password} hint={a.register.passwordHint}>
        <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      {register.isError && <Notice tone="error">{errorText(register.error)}</Notice>}
      <Button type="submit" arrow disabled={register.isPending} className="w-full">
        {register.isPending ? a.register.pending : a.register.submit}
      </Button>
      <p className="text-sm text-muted">
        {a.register.agree[0]}
        <Link href="/terms" className="link">
          {a.register.agree[1]}
        </Link>
        {a.register.agree[2]}
        <Link href="/privacy" className="link">
          {a.register.agree[3]}
        </Link>
        {a.register.agree[4]}
      </p>
      <p className="text-muted">
        {a.register.haveAccount}{" "}
        <Link href="/login" className="link font-semibold text-char">
          {a.register.signIn}
        </Link>
      </p>
    </form>
  );
}
